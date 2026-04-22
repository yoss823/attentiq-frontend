"use client";

import PremiumPaywall from "@/app/analyze/PremiumPaywall";

type StripeCtaProps = {
  jobId?: string | null;
  videoUrl?: string | null;
};

export default function StripeCta(props: StripeCtaProps) {
  return <PremiumPaywall {...props} />;
}
