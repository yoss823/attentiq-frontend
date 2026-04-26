import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendCheckoutThankYouEmail } from "@/lib/checkout-email";
import { getPlanFromOfferSlug } from "@/lib/premium";
import {
  isPaidStripeCheckoutSession,
  jobAndVideoFromStripeSession,
  resolveOfferSlugFromPaidStripeSession,
} from "@/lib/paid-stripe-session";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Typings ship `LatestApiVersion`; dashboard uses a newer pinned version.
  // @ts-expect-error Stripe API version string newer than package union
  apiVersion: "2025-02-24.acacia",
});

type SetPremiumBody = {
  sessionId?: unknown;
  jobId?: unknown;
  videoUrl?: unknown;
};

function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function checkoutCustomerEmail(session: Stripe.Checkout.Session) {
  const fromDetails = session.customer_details?.email;
  if (typeof fromDetails === "string" && fromDetails.trim()) {
    return fromDetails.trim();
  }
  if (typeof session.customer_email === "string" && session.customer_email.trim()) {
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SetPremiumBody;
    const sessionId = normalizeString(body.sessionId);
    const jobId = normalizeString(body.jobId);
    const videoUrl = normalizeString(body.videoUrl);

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "MISSING_SESSION_ID" },
        { status: 400 }
      );
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch {
      return NextResponse.json(
        { ok: false, error: "SESSION_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!isPaidStripeCheckoutSession(session)) {
      return NextResponse.json(
        { ok: false, error: "SESSION_NOT_PAID" },
        { status: 403 }
      );
    }

    const resolvedOfferSlug = resolveOfferSlugFromPaidStripeSession(session);
    const plan = getPlanFromOfferSlug(resolvedOfferSlug);

    const fromMeta = jobAndVideoFromStripeSession(session);
    const resolvedJobId =
      jobId ?? normalizeString(fromMeta.jobId) ?? null;
    const resolvedVideoUrl =
      videoUrl ?? normalizeString(fromMeta.videoUrl) ?? null;

    const customerEmail = checkoutCustomerEmail(session);

    let thankYouEmail:
      | {
          status: "sent" | "skipped_no_recipient" | "skipped_no_resend_key" | "failed";
          resendEmailId?: string;
          message?: string;
        }
      | undefined;

    if (!customerEmail) {
      console.warn(
        "[set-premium] thank-you email skipped: no email on Stripe session (customer_details / customer_email / customer)"
      );
      thankYouEmail = { status: "skipped_no_recipient" };
    } else {
      const host =
        req.headers.get("x-forwarded-host") ?? req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") ?? "https";
      const appBaseUrl = host ? `${proto}://${host}` : null;

      const sendResult = await sendCheckoutThankYouEmail({
        to: customerEmail,
        offerSlug: resolvedOfferSlug,
        sessionId,
        appBaseUrl,
      });

      if ("skipped" in sendResult && sendResult.skipped) {
        thankYouEmail = { status: "skipped_no_resend_key" };
      } else if (!sendResult.ok) {
        thankYouEmail = {
          status: "failed",
          message: sendResult.error,
        };
        console.error("[set-premium] thank-you email failed:", sendResult.error);
      } else if ("resendEmailId" in sendResult) {
        thankYouEmail = {
          status: "sent",
          resendEmailId: sendResult.resendEmailId,
        };
      } else {
        thankYouEmail = { status: "failed", message: "unexpected_send_result" };
      }
    }

    return NextResponse.json({
      ok: true,
      paid: true,
      offerSlug: resolvedOfferSlug,
      plan,
      jobId: resolvedJobId,
      videoUrl: resolvedVideoUrl,
      customerEmail,
      thankYouEmail,
    });
  } catch (error) {
    console.error("[set-premium] error:", error);
    return NextResponse.json(
      { ok: false, error: "PREMIUM_SET_FAILED" },
      { status: 500 }
    );
  }
}
