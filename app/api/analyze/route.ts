import { NextRequest, NextResponse } from "next/server";
import { formatAttentiqReport, mockSalesWithEvaResponse } from "@/lib/railway-client";
import { URL_PIPELINE_VERSION, buildPipelineHeaders, preflightRailwayUrl, resolveTikTokUrl, startRailwayAnalyze, UrlIntakeError } from "@/lib/railway-server";
import {
  parsePremiumEntitlement,
  PREMIUM_ENTITLEMENT_COOKIE_NAME,
} from "@/lib/premium";

const FREE_TRIAL_COOKIE_NAME = "attentiq_free_trial_used";
const FREE_TRIAL_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

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
      { error: "MISSING_URL", userMessage: "Collez une URL TikTok publique ou passez par l'upload video.", needsUpload: true, pipelineVersion: URL_PIPELINE_VERSION },
      { status: 400, headers: buildPipelineHeaders() }
    );
  }

  const entitlement = parsePremiumEntitlement(
    req.cookies.get(PREMIUM_ENTITLEMENT_COOKIE_NAME)?.value ?? null
  );
  const hasUsedFreeTrial = req.cookies.get(FREE_TRIAL_COOKIE_NAME)?.value === "1";
  const hasPremium = Boolean(entitlement?.isPremium);

  if (hasUsedFreeTrial && !hasPremium) {
    return NextResponse.json(
      {
        error: "FREE_TRIAL_EXHAUSTED",
        userMessage:
          "Votre analyse gratuite est deja utilisee. Debloquez une offre pour continuer.",
        paywallPath: "/videos#tarifs",
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
    const resolvedUrl = await resolveTikTokUrl(rawUrl);
    await preflightRailwayUrl(resolvedUrl);
    const payload = await startRailwayAnalyze(resolvedUrl);
    const response = NextResponse.json(
      { ...payload, normalizedUrl: resolvedUrl, pipelineVersion: URL_PIPELINE_VERSION },
      { headers: buildPipelineHeaders() }
    );

    if (!hasPremium) {
      response.cookies.set({
        name: FREE_TRIAL_COOKIE_NAME,
        value: "1",
        maxAge: FREE_TRIAL_COOKIE_MAX_AGE_SECONDS,
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
      });
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
