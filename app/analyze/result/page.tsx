import type { Metadata } from "next";
import { cookies } from "next/headers";
import ResultPageShell from "@/components/result-page-shell";
import {
  buildLegacyPremiumEntitlement,
  LEGACY_PREMIUM_UNLOCK_COOKIE_NAME,
  LEGACY_SUBSCRIPTION_ACCESS_COOKIE_NAME,
  parsePremiumEntitlement,
  PREMIUM_ENTITLEMENT_COOKIE_NAME,
} from "@/lib/premium";

export const metadata: Metadata = {
  title: "Rapport | Attentiq",
  description:
    "Diagnostic d'attention Attentiq: resume, chutes visibles et rapport complet.",
};

type AnalyzeResultPageProps = {
  searchParams: Promise<{
    jobId?: string | string[] | undefined;
    videoUrl?: string | string[] | undefined;
    url?: string | string[] | undefined;
    paid?: string | string[] | undefined;
  }>;
};

export default async function AnalyzeResultPage({
  searchParams,
}: AnalyzeResultPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const rawJobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  const rawVideoUrl = Array.isArray(params.videoUrl)
    ? params.videoUrl[0]
    : params.videoUrl;
  const rawUrl = Array.isArray(params.url) ? params.url[0] : params.url;
  const expectedReportJobId = rawJobId?.trim() || null;
  const expectedVideoUrl = rawVideoUrl?.trim() || rawUrl?.trim() || null;
  const initialPremiumEntitlement =
    parsePremiumEntitlement(
      cookieStore.get(PREMIUM_ENTITLEMENT_COOKIE_NAME)?.value ?? null
    ) ??
    buildLegacyPremiumEntitlement({
      premiumUnlockRequestId:
        cookieStore.get(LEGACY_PREMIUM_UNLOCK_COOKIE_NAME)?.value ?? null,
      subscriptionOfferSlug:
        cookieStore.get(LEGACY_SUBSCRIPTION_ACCESS_COOKIE_NAME)?.value ?? null,
    });

  return (
    <ResultPageShell
      expectStoredResult
      expectedReportJobId={expectedReportJobId}
      expectedVideoUrl={expectedVideoUrl}
      initialPremiumEntitlement={initialPremiumEntitlement}
    />
  );
}

