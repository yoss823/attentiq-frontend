import { NextRequest, NextResponse } from "next/server";
import { formatAttentiqReport, mockSalesWithEvaResponse } from "@/lib/railway-client";
import { URL_PIPELINE_VERSION, buildPipelineHeaders, preflightRailwayUrl, resolveVideoUrl, startRailwayAnalyze, UrlIntakeError } from "@/lib/railway-server";
import {
  parsePremiumEntitlement,
  PREMIUM_ENTITLEMENT_COOKIE_NAME,
} from "@/lib/premium";
import {
  freeTrialExhaustedUserMessage,
  hasUsedFreeTrialForFormat,
  isDevVideoTrialBypassEnabled,
  paywallPathForFormat,
  setFreeTrialCookieOnResponse,
} from "@/lib/free-trial";
import { enforceSubscriptionQuotaGate } from "@/lib/subscription-quota-gate";

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", userMessage: "Requête invalide." }, { status: 400 });
  }

  const rawUrl = typeof body.url === "string" ? body.url : "";
  if (!rawUrl.trim()) {
    return NextResponse.json(
      { error: "MISSING_URL", userMessage: "Collez une URL de vidéo courte (TikTok, YouTube Shorts, Instagram…) ou passez par l'upload.", needsUpload: true, pipelineVersion: URL_PIPELINE_VERSION },
      { status: 400, headers: buildPipelineHeaders() }
    );
  }

  const entitlement = parsePremiumEntitlement(
    req.cookies.get(PREMIUM_ENTITLEMENT_COOKIE_NAME)?.value ?? null
  );
  const hasUsedVideoTrial = hasUsedFreeTrialForFormat(req, "video");
  const hasPremium = Boolean(entitlement?.isPremium);

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
    const mockData = mockSalesWithEvaResponse();
    const report = formatAttentiqReport(mockData);
    return NextResponse.json({ report, demo: true, pipelineVersion: URL_PIPELINE_VERSION }, { headers: buildPipelineHeaders() });
  }

  try {
    const resolvedUrl = await resolveVideoUrl(rawUrl);
    await preflightRailwayUrl(resolvedUrl);
    const payload = await startRailwayAnalyze(resolvedUrl);
    const response = NextResponse.json(
      { ...payload, normalizedUrl: resolvedUrl, pipelineVersion: URL_PIPELINE_VERSION },
      { headers: buildPipelineHeaders() }
    );

    if (!isDevVideoTrialBypassEnabled()) {
      setFreeTrialCookieOnResponse(response, "video", hasPremium);
    }

    return response;
  } catch (error) {
    if (error instanceof UrlIntakeError) {
      return NextResponse.json(
        { error: error.code, userMessage: error.userMessage, needsUpload: error.needsUpload, pipelineVersion: URL_PIPELINE_VERSION },
        { status: error.status, headers: buildPipelineHeaders() }
      );
    }
    return NextResponse.json(
      { error: "INTERNAL", userMessage: "Une erreur inattendue est survenue. Reessayez ou passez par l'upload video.", needsUpload: true, pipelineVersion: URL_PIPELINE_VERSION },
      { status: 500, headers: buildPipelineHeaders() }
    );
  }
}
