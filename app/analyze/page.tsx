import type { Metadata } from "next";
import { cookies } from "next/headers";
import AnalyzeExperience from "@/components/analyze-experience";
import {
  getCheckoutContextFromSearchParams,
  readFirstSearchParam,
  type SearchParamRecord,
} from "@/lib/checkout-context";
import {
  buildLegacyPremiumEntitlement,
  LEGACY_PREMIUM_UNLOCK_COOKIE_NAME,
  LEGACY_SUBSCRIPTION_ACCESS_COOKIE_NAME,
  parsePremiumEntitlement,
  PREMIUM_ENTITLEMENT_COOKIE_NAME,
} from "@/lib/premium";

export const metadata: Metadata = {
  title: "Analyser une video | Attentiq",
  description:
    "Importez une video ou testez une URL TikTok publique pour obtenir le teaser gratuit du diagnostic d'attention Attentiq.",
};

type AnalyzePageProps = {
  searchParams: Promise<
    SearchParamRecord & {
      paid?: string | string[] | undefined;
    }
  >;
};

export default async function AnalyzePage({ searchParams }: AnalyzePageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const { jobId: initialJobId, videoUrl: initialVideoUrl } =
    getCheckoutContextFromSearchParams(params);
  const initialPaid = readFirstSearchParam(params.paid) === "1";
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
    <AnalyzeExperience
      initialJobId={initialJobId}
      initialPaid={initialPaid}
      initialPremiumEntitlement={initialPremiumEntitlement}
      initialVideoUrl={initialVideoUrl}
      railwayBaseUrl={process.env.RAILWAY_BASE_URL?.trim() ?? null}
    />
  );
}
