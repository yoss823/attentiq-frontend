import { NextRequest, NextResponse } from "next/server";
import {
  CHECKOUT_CONTEXT_COOKIE_NAME,
  createCheckoutContextCookieValue,
  getCheckoutContextCookieMaxAgeSeconds,
} from "@/lib/checkout-session";
import { getOfferBySlug } from "@/lib/offer-config";
import { buildAttentiqPaymentClientReferenceId } from "@/lib/stripe-client-reference";
import { withStripePrefilledEmail } from "@/lib/stripe-prefill-url";

export const runtime = "nodejs";

type PrepareCheckoutBody = {
  offerSlug?: unknown;
  jobId?: unknown;
  videoUrl?: unknown;
  /** Préremplit l'email sur les Payment Links Stripe (`prefilled_email`). */
  prefillEmail?: unknown;
};

function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: NextRequest) {
  let body: PrepareCheckoutBody;

  try {
    body = (await request.json()) as PrepareCheckoutBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const offerSlug = normalizeString(body.offerSlug);

  if (!offerSlug) {
    return NextResponse.json(
      { ok: false, error: "MISSING_OFFER_SLUG" },
      { status: 400 }
    );
  }

  const offer = getOfferBySlug(offerSlug);

  if (!offer) {
    return NextResponse.json(
      { ok: false, error: "UNKNOWN_OFFER" },
      { status: 404 }
    );
  }

  const prefillFromBody = normalizeString(body.prefillEmail);
  const prefillFromEnv =
    typeof process.env.STRIPE_CHECKOUT_PREFILL_EMAIL === "string"
      ? process.env.STRIPE_CHECKOUT_PREFILL_EMAIL.trim()
      : null;
  let redirectUrl = withStripePrefilledEmail(
    offer.stripeUrl,
    prefillFromBody ?? prefillFromEnv ?? undefined
  );

  const cref = buildAttentiqPaymentClientReferenceId(
    normalizeString(body.jobId),
    normalizeString(body.videoUrl)
  );
  if (cref) {
    try {
      const u = new URL(redirectUrl);
      const host = u.hostname.toLowerCase();
      const isStripeCheckout =
        host === "buy.stripe.com" ||
        host === "checkout.stripe.com" ||
        host.endsWith(".stripe.com");
      if (isStripeCheckout) {
        u.searchParams.set("client_reference_id", cref);
        redirectUrl = u.toString();
      }
    } catch {
      /* ignore invalid payment URL */
    }
  }

  const response = NextResponse.json({
    ok: true,
    redirectUrl,
  });

  const canonicalOfferSlug = offer.slug;

  response.cookies.set({
    name: CHECKOUT_CONTEXT_COOKIE_NAME,
    value: createCheckoutContextCookieValue({
      offerSlug: canonicalOfferSlug,
      jobId: normalizeString(body.jobId),
      videoUrl: normalizeString(body.videoUrl),
    }),
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: getCheckoutContextCookieMaxAgeSeconds(),
  });

  return response;
}
