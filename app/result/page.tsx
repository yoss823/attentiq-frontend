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
import {
  RailwayError,
  TimeoutError,
  analyzeVideo,
} from "@/lib/railway-client";

export const metadata: Metadata = {
  title: "Rapport gratuit | Attentiq",
  description:
    "Teaser gratuit du diagnostic d'attention Attentiq: resume, chutes visibles et paywall pour le rapport complet.",
};

type ResultPageProps = {
  searchParams: Promise<{
    url?: string | string[] | undefined;
    videoUrl?: string | string[] | undefined;
    jobId?: string | string[] | undefined;
  }>;
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const rawUrl = Array.isArray(params.url) ? params.url[0] : params.url;
  const rawVideoUrl = Array.isArray(params.videoUrl)
    ? params.videoUrl[0]
    : params.videoUrl;
  const rawJobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  const videoUrl = rawUrl?.trim() ?? "";
  const expectedVideoUrl = rawVideoUrl?.trim() || videoUrl || null;
  const expectedReportJobId = rawJobId?.trim() || null;
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
  let initialReport = null;
  let initialMessage: { title: string; message: string } | null = null;

  if (!videoUrl) {
    return (
      <ResultPageShell
        expectStoredResult
        expectedReportJobId={expectedReportJobId}
        expectedVideoUrl={expectedVideoUrl}
        initialPremiumEntitlement={initialPremiumEntitlement}
      />
    );
  }

  try {
    initialReport = await analyzeVideo(videoUrl);
  } catch (error) {
    initialMessage = {
      title: "Diagnostic indisponible",
      message:
      error instanceof RailwayError
        ? error.userMessage
        : error instanceof TimeoutError
          ? "L'analyse prend plus de temps que prevu. Relancez la video dans quelques instants."
          : "Le service n'a pas pu produire le diagnostic pour cette URL. Reessayez avec une autre video.",
    };
  }

  return (
    <ResultPageShell
      expectedReportJobId={expectedReportJobId}
      expectedVideoUrl={expectedVideoUrl}
      initialPremiumEntitlement={initialPremiumEntitlement}
      initialMessage={initialMessage}
      initialReport={initialReport}
      initialReportJobId={expectedReportJobId}
    />
  );
}
