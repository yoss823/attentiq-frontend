import type { Metadata } from "next";
import CheckoutSuccessState from "@/components/checkout-success-state";
import { getCheckoutContextFromSearchParams } from "@/lib/checkout-context";

export const metadata: Metadata = {
  title: "Paiement confirmé — Attentiq",
};

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    offerSlug?: string | string[] | undefined;
    jobId?: string | string[] | undefined;
    videoUrl?: string | string[] | undefined;
    url?: string | string[] | undefined;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const checkoutContext = getCheckoutContextFromSearchParams(await searchParams);

  return <CheckoutSuccessState initialContext={checkoutContext} />;
}
