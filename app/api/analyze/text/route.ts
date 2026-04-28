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

const MAX_TEXT_LEN = 20_000;
const MAX_CONTEXT_LEN = 1_000;

export async function POST(req: NextRequest) {
  const entitlement = parsePremiumEntitlement(
    req.cookies.get(PREMIUM_ENTITLEMENT_COOKIE_NAME)?.value ?? null
  );
  const hasPremium = Boolean(entitlement?.isPremium);
  const hasUsedServerTextTrial = hasPremium
    ? false
    : await hasConsumedServerSideTrial(req, "text");

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
    (hasUsedFreeTrialForFormat(req, "text") || hasUsedServerTextTrial)
  ) {
    return NextResponse.json(
      {
        error: "FREE_TRIAL_EXHAUSTED",
        userMessage: freeTrialExhaustedUserMessage("text"),
        paywallPath: paywallPathForFormat("text"),
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

  let body: { text?: string; context?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: "INVALID_JSON",
        userMessage: "Requete invalide.",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 400, headers: buildPipelineHeaders() }
    );
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json(
      {
        error: "MISSING_TEXT",
        userMessage: "Saisissez un texte a analyser.",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 400, headers: buildPipelineHeaders() }
    );
  }
  if (text.length > MAX_TEXT_LEN) {
    return NextResponse.json(
      {
        error: "TEXT_TOO_LONG",
        userMessage: `Texte trop long (max ${MAX_TEXT_LEN} caracteres).`,
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: 400, headers: buildPipelineHeaders() }
    );
  }

  let context: string | undefined;
  if (typeof body.context === "string") {
    const c = body.context.trim();
    if (c) {
      context = c.slice(0, MAX_CONTEXT_LEN);
    }
  }

  const railwayBaseUrl = base.replace(/\/+$/, "");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);
  let upstream: Response;
  try {
    upstream = await fetch(`${railwayBaseUrl}/analyze/text`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        text,
        context: context ?? null,
        request_id: crypto.randomUUID(),
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = (await upstream.json().catch(() => null)) as Record<string, unknown> | null;
  const jobId = payload && typeof payload.job_id === "string" ? payload.job_id : null;

  if (!upstream.ok || !jobId) {
    const detail = payload && typeof payload.detail === "string" ? payload.detail : null;
    return NextResponse.json(
      {
        error: "ANALYZE_START_FAILED",
        userMessage:
          detail ??
          "Le service n'a pas pu demarrer l'analyse texte. Reessayez dans un instant.",
        pipelineVersion: URL_PIPELINE_VERSION,
      },
      { status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502, headers: buildPipelineHeaders() }
    );
  }

  const response = NextResponse.json(
    { ...payload, pipelineVersion: URL_PIPELINE_VERSION },
    { headers: buildPipelineHeaders() }
  );
  return response;
}
