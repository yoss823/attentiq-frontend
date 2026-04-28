import { NextRequest, NextResponse } from "next/server";
import { URL_PIPELINE_VERSION, buildPipelineHeaders } from "@/lib/railway-server";
import {
  parsePremiumEntitlement,
  PREMIUM_ENTITLEMENT_COOKIE_NAME,
} from "@/lib/premium";
import {
  freeTrialExhaustedUserMessage,
  hasUsedFreeTrialForFormat,
  paywallPathForFormat,
} from "@/lib/free-trial";
import { enforceSubscriptionQuotaGate } from "@/lib/subscription-quota-gate";
import { hasConsumedServerSideTrial } from "@/lib/trial-server-gate";

const ACCEPTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const entitlement = parsePremiumEntitlement(
    req.cookies.get(PREMIUM_ENTITLEMENT_COOKIE_NAME)?.value ?? null
  );
  const hasPremium = Boolean(entitlement?.isPremium);
  const hasUsedServerImageTrial = hasPremium
    ? false
    : await hasConsumedServerSideTrial(req, "image");

  const quotaGate = await enforceSubscriptionQuotaGate(req);
  if (quotaGate.shouldBlock) {
    return NextResponse.json(
      {
        error: "SUBSCRIPTION_QUOTA_BLOCKED",
        reason: quotaGate.reason,
        userMessage: quotaGate.userMessage,
        paywallPath: "/compte",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 402, headers: buildPipelineHeaders() }
    );
  }

  if (
    !hasPremium &&
    (hasUsedFreeTrialForFormat(req, "image") || hasUsedServerImageTrial)
  ) {
    return NextResponse.json(
      {
        error: "FREE_TRIAL_EXHAUSTED",
        userMessage: freeTrialExhaustedUserMessage("image"),
        paywallPath: paywallPathForFormat("image"),
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 402, headers: buildPipelineHeaders() }
    );
  }

  const base = process.env.RAILWAY_BASE_URL?.trim();
  if (!base) {
    return NextResponse.json(
      {
        error: "MISSING_CONFIG",
        userMessage: "Service d'analyse non configure.",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 503, headers: buildPipelineHeaders() }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      {
        error: "INVALID_FORM",
        userMessage: "Requete invalide — impossible de lire le fichier.",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 400, headers: buildPipelineHeaders() }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      {
        error: "MISSING_FILE",
        userMessage: "Aucune image recue. Selectionnez un fichier JPEG, PNG ou WebP.",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 400, headers: buildPipelineHeaders() }
    );
  }

  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        error: "UNSUPPORTED_FORMAT",
        userMessage: "Format non supporte. Utilisez JPEG, PNG ou WebP.",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 415, headers: buildPipelineHeaders() }
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      {
        error: "FILE_TOO_LARGE",
        userMessage: "Image trop volumineuse. La limite est de 10 Mo.",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 413, headers: buildPipelineHeaders() }
    );
  }

  const railwayBaseUrl = base.replace(/\/+$/, "");
  const upstream = new FormData();
  upstream.append("file", file, file.name);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);
  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${railwayBaseUrl}/analyze/image`, {
      method: "POST",
      body: upstream,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = (await upstreamResponse.json().catch(() => null)) as Record<string, unknown> | null;
  const jobId = payload && typeof payload.job_id === "string" ? payload.job_id : null;

  if (!upstreamResponse.ok || !jobId) {
    const detail = payload && typeof payload.detail === "string" ? payload.detail : null;
    return NextResponse.json(
      {
        error: "ANALYZE_START_FAILED",
        userMessage:
          detail ??
          "Le service n'a pas accepte cette image. Verifiez le format et reessayez.",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      {
        status:
          upstreamResponse.status >= 400 && upstreamResponse.status < 600
            ? upstreamResponse.status
            : 502,
        headers: buildPipelineHeaders(),
      }
    );
  }

  const response = NextResponse.json(
    { ...payload, pipelineVersion: URL_PIPELINE_VERSION },
    { headers: buildPipelineHeaders() }
  );
  return response;
}
