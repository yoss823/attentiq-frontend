import { NextRequest, NextResponse } from "next/server";
import {
  CHECKOUT_CONTEXT_COOKIE_NAME,
  parseCheckoutContextCookieValue,
} from "@/lib/checkout-session";
import { buildAnalyzeHref } from "@/lib/checkout-context";
import { getPlanFromOfferSlug } from "@/lib/premium";
import {
  getRecordedPaymentSession,
  getVerifiedCheckoutContext,
  upsertVerifiedCheckoutContext,
} from "@/lib/subscriber-store";
import { normalizeOfferSlug } from "@/lib/offer-config";

export const runtime = "nodejs";

function normalizeSessionId(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
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

  const payment = await getRecordedPaymentSession(sessionId);

  if (!payment?.offerSlug) {
    return NextResponse.json(
      { ok: false, error: "SESSION_NOT_VERIFIED" },
      { status: 404 }
    );
  }

  const paymentOfferSlug = normalizeOfferSlug(payment.offerSlug) ?? payment.offerSlug;
  const plan = getPlanFromOfferSlug(paymentOfferSlug);
  let verifiedContext = await getVerifiedCheckoutContext(sessionId);

  if (!verifiedContext) {
    const cookieContext = parseCheckoutContextCookieValue(
      request.cookies.get(CHECKOUT_CONTEXT_COOKIE_NAME)?.value ?? null
    );

    if (
      cookieContext &&
      normalizeOfferSlug(cookieContext.offerSlug) === paymentOfferSlug
    ) {
      await upsertVerifiedCheckoutContext({
        stripeSessionId: sessionId,
        offerSlug: paymentOfferSlug,
        jobId: cookieContext.jobId,
        videoUrl: cookieContext.videoUrl,
      });

      verifiedContext = await getVerifiedCheckoutContext(sessionId);
    }
  }

  if (
    plan === "single" &&
    !verifiedContext?.jobId &&
    !verifiedContext?.videoUrl
  ) {
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
    jobId: verifiedContext?.jobId ?? null,
    videoUrl: verifiedContext?.videoUrl ?? null,
    paid: true,
  });

  const response = NextResponse.json({
    ok: true,
    paid: true,
    stripeSessionId: payment.stripeSessionId,
    offerSlug: paymentOfferSlug,
    plan,
    jobId: verifiedContext?.jobId ?? null,
    videoUrl: verifiedContext?.videoUrl ?? null,
    redirectTo,
  });

  response.cookies.delete(CHECKOUT_CONTEXT_COOKIE_NAME);
  return response;
}
