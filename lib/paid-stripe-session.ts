import type Stripe from "stripe";
import { getOfferByPriceCents, normalizeOfferSlug } from "@/lib/offer-config";
import { parseJobIdFromAttentiqClientReferenceId } from "@/lib/stripe-client-reference";

/** E-mail acheteur : détails checkout, champ session, ou client Stripe (session avec `expand: ['customer']`). */
export function checkoutSessionCustomerEmail(
  session: Stripe.Checkout.Session
): string | null {
  const fromDetails = session.customer_details?.email;
  if (typeof fromDetails === "string" && fromDetails.trim()) {
    return fromDetails.trim();
  }
  if (
    typeof session.customer_email === "string" &&
    session.customer_email.trim()
  ) {
    return session.customer_email.trim();
  }
  const cust = session.customer;
  if (cust && typeof cust === "object") {
    if ("deleted" in cust && cust.deleted === true) {
      return null;
    }
    if (
      "email" in cust &&
      typeof cust.email === "string" &&
      cust.email.trim()
    ) {
      return cust.email.trim();
    }
  }
  return null;
}

/** Même logique que set-premium : metadata puis montant payé. */
export function resolveOfferSlugFromPaidStripeSession(
  session: Stripe.Checkout.Session
): string {
  const rawOfferSlug =
    session.metadata?.offerSlug?.trim() ||
    session.metadata?.plan?.trim() ||
    null;
  const amountTotal = session.amount_total ?? 0;
  const offerFromAmount = getOfferByPriceCents(amountTotal);
  return (
    normalizeOfferSlug(rawOfferSlug) ??
    offerFromAmount?.slug ??
    "single"
  );
}

export function isPaidStripeCheckoutSession(
  session: Stripe.Checkout.Session
): boolean {
  return (
    session.payment_status === "paid" || session.status === "complete"
  );
}

export function jobAndVideoFromStripeSession(
  session: Stripe.Checkout.Session
): { jobId: string | null; videoUrl: string | null } {
  const jobIdMeta = session.metadata?.jobId?.trim() || null;
  const videoUrlMeta = session.metadata?.videoUrl?.trim() || null;
  if (jobIdMeta || videoUrlMeta) {
    return { jobId: jobIdMeta, videoUrl: videoUrlMeta };
  }
  const cref =
    typeof session.client_reference_id === "string"
      ? session.client_reference_id
      : null;
  const jobFromRef = parseJobIdFromAttentiqClientReferenceId(cref);
  if (jobFromRef) {
    return { jobId: jobFromRef, videoUrl: null };
  }
  return { jobId: null, videoUrl: null };
}
