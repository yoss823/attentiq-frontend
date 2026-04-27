import { NextRequest, NextResponse } from "next/server";
import { URL_PIPELINE_VERSION, buildPipelineHeaders } from "@/lib/railway-server";
import {
  parsePremiumEntitlement,
  PREMIUM_ENTITLEMENT_COOKIE_NAME,
} from "@/lib/premium";
import {
  FREE_TRIAL_TOTAL_COUNT_COOKIE_NAME,
  freeTrialExhaustedUserMessage,
  hasUsedFreeTrialForFormat,
  isDevVideoTrialBypassEnabled,
  paywallPathForFormat,
  setFreeTrialCookieOnResponse,
} from "@/lib/free-trial";
import { enforceSubscriptionQuotaGate } from "@/lib/subscription-quota-gate";

const ACCEPTED_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

export async function POST(req: NextRequest) {
  const entitlement = parsePremiumEntitlement(
    req.cookies.get(PREMIUM_ENTITLEMENT_COOKIE_NAME)?.value ?? null
  );
  const hasUsedVideoTrial = hasUsedFreeTrialForFormat(req, "video");
  const hasPremium = Boolean(entitlement?.isPremium);
  const currentTrialCount = Number.parseInt(
    req.cookies.get(FREE_TRIAL_TOTAL_COUNT_COOKIE_NAME)?.value ?? "0",
    10
  );

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

  if (!isDevVideoTrialBypassEnabled() && hasUsedVideoTrial && !hasPremium) {
    return NextResponse.json(
      {
        error: "FREE_TRIAL_EXHAUSTED",
        userMessage: freeTrialExhaustedUserMessage("video"),
        paywallPath: paywallPathForFormat("video"),
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 402, headers: buildPipelineHeaders() }
    );
  }

  if (!process.env.RAILWAY_BASE_URL) {
    return NextResponse.json(
      {
        error: "MISSING_CONFIG",
        userMessage:
          "Le service d'upload n'est pas configure. Reessayez plus tard.",
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
        userMessage: "Aucun fichier video recu. Selectionnez un fichier et reessayez.",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 400, headers: buildPipelineHeaders() }
    );
  }

  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error: "UNSUPPORTED_FORMAT",
        userMessage:
          "Format non supporte. Utilisez un fichier MP4, MOV ou WebM.",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 415, headers: buildPipelineHeaders() }
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: "FILE_TOO_LARGE",
        userMessage: "Fichier trop volumineux. La limite est de 500 Mo.",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 413, headers: buildPipelineHeaders() }
    );
  }

  try {
    const railwayBaseUrl = process.env.RAILWAY_BASE_URL.replace(/\/+$/, "");

    const upstream = new FormData();
    upstream.append("file", file, file.name);
    upstream.append("request_id", crypto.randomUUID());
    upstream.append("platform", "upload");
    upstream.append("requested_at", new Date().toISOString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000);

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(`${railwayBaseUrl}/analyze/upload`, {
        method: "POST",
        body: upstream,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const payload = (await upstreamResponse.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!upstreamResponse.ok || !payload) {
      return NextResponse.json(
        {
          error: "UPLOAD_FAILED",
          userMessage:
            "Le service n'a pas accepte ce fichier. Verifiez le format et reessayez.",
          pipelineVersion: URL_PIPELINE_VERSION,
        },
        { status: 502, headers: buildPipelineHeaders() }
      );
    }

    const response = NextResponse.json(
      { ...payload, pipelineVersion: URL_PIPELINE_VERSION },
      { headers: buildPipelineHeaders() }
    );

    if (!isDevVideoTrialBypassEnabled()) {
      setFreeTrialCookieOnResponse(
        response,
        "video",
        hasPremium,
        Number.isFinite(currentTrialCount) ? currentTrialCount : 0
      );
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "UPLOAD_TIMEOUT",
          userMessage:
            "L'upload a pris trop de temps. Essayez avec un fichier plus petit.",
          pipelineVersion: URL_PIPELINE_VERSION,
        },
        { status: 504, headers: buildPipelineHeaders() }
      );
    }

    return NextResponse.json(
      {
        error: "INTERNAL",
        userMessage:
          "Une erreur inattendue est survenue lors de l'upload. Reessayez.",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 500, headers: buildPipelineHeaders() }
    );
  }
}
