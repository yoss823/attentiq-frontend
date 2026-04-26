import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  CHECKOUT_CONTEXT_COOKIE_NAME,
  parseCheckoutContextCookieValue,
} from "@/lib/checkout-session";
import { buildAnalyzeHref } from "@/lib/checkout-context";
import {
  isPaidStripeCheckoutSession,
  jobAndVideoFromStripeSession,
  resolveOfferSlugFromPaidStripeSession,
} from "@/lib/paid-stripe-session";
import { getPlanFromOfferSlug } from "@/lib/premium";
import type { RecordedPaymentSession } from "@/lib/subscriber-store";
import {
  getRecordedPaymentSession,
  getVerifiedCheckoutContext,
  recordStripeCheckoutCompletionIfAbsent,
  upsertVerifiedCheckoutContext,
} from "@/lib/subscriber-store";
import { normalizeOfferSlug } from "@/lib/offer-config";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

function normalizeSessionId(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function retrieveCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const sessionId = normalizeSessionId(
    request.nextUrl.searchParams.get("session_id")
  );

  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "MISSING_SESSION_ID" },
      { status: 400 }
    );
  }

  let payment = await getRecordedPaymentSession(sessionId);
  let stripeSession: Stripe.Checkout.Session | null = null;

  if (!payment?.offerSlug) {
    stripeSession = await retrieveCheckoutSession(sessionId);
    if (
      stripeSession &&
      isPaidStripeCheckoutSession(stripeSession)
    ) {
      await recordStripeCheckoutCompletionIfAbsent(stripeSession);
      payment = await getRecordedPaymentSession(sessionId);
      if (!payment?.offerSlug) {
        const slug = resolveOfferSlugFromPaidStripeSession(stripeSession);
        payment = {
          stripeSessionId: sessionId,
          offerSlug: slug,
          amountCents: stripeSession.amount_total ?? 0,
          currency: (stripeSession.currency || "eur").toLowerCase(),
          customerEmail: null,
          receivedAt: new Date().toISOString(),
        } satisfies RecordedPaymentSession;
      }
    }
  }

  if (!payment?.offerSlug) {
    return NextResponse.json(
      { ok: false, error: "SESSION_NOT_VERIFIED" },
      { status: 404 }
    );
  }

  const paymentOfferSlug =
    normalizeOfferSlug(payment.offerSlug) ?? payment.offerSlug;
  const plan = getPlanFromOfferSlug(paymentOfferSlug);

  const cookieContext = parseCheckoutContextCookieValue(
    request.cookies.get(CHECKOUT_CONTEXT_COOKIE_NAME)?.value ?? null
  );
  const cookieMatches =
    Boolean(cookieContext) &&
    normalizeOfferSlug(cookieContext!.offerSlug) === paymentOfferSlug;

  let verifiedContext = await getVerifiedCheckoutContext(sessionId);

  if (!verifiedContext && cookieMatches) {
    await upsertVerifiedCheckoutContext({
      stripeSessionId: sessionId,
      offerSlug: paymentOfferSlug,
      jobId: cookieContext!.jobId,
      videoUrl: cookieContext!.videoUrl,
    });
    verifiedContext = await getVerifiedCheckoutContext(sessionId);
  }

  let jobId = verifiedContext?.jobId ?? null;
  let videoUrl = verifiedContext?.videoUrl ?? null;

  if (!jobId && !videoUrl && cookieMatches) {
    jobId = cookieContext!.jobId;
    videoUrl = cookieContext!.videoUrl;
  }

  if (plan === "single" && !jobId && !videoUrl) {
    if (!stripeSession) {
      stripeSession = await retrieveCheckoutSession(sessionId);
    }
    if (stripeSession) {
      const fromStripe = jobAndVideoFromStripeSession(stripeSession);
      jobId = fromStripe.jobId;
      videoUrl = fromStripe.videoUrl;
    }
  }

  if (plan === "single" && !jobId && !videoUrl) {
    const response = NextResponse.json(
      {
        ok: false,
        error: "CHECKOUT_CONTEXT_NOT_FOUND",
        offerSlug: paymentOfferSlug,
        plan,
      },
      { status: 409 }
    );

    response.cookies.delete(CHECKOUT_CONTEXT_COOKIE_NAME);
    return response;
  }

  const redirectTo = buildAnalyzeHref({
    jobId,
    videoUrl,
    paid: true,
  });

  const response = NextResponse.json({
    ok: true,
    paid: true,
    stripeSessionId: payment.stripeSessionId,
    offerSlug: paymentOfferSlug,
    plan,
    jobId,
    videoUrl,
    redirectTo,
  });

  response.cookies.delete(CHECKOUT_CONTEXT_COOKIE_NAME);
  return response;
}
