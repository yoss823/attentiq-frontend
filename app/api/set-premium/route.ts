import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getPlanFromOfferSlug } from "@/lib/premium";
import {
  isPaidStripeCheckoutSession,
  jobAndVideoFromStripeSession,
  resolveOfferSlugFromPaidStripeSession,
} from "@/lib/paid-stripe-session";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
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

    return NextResponse.json({
      ok: true,
      paid: true,
      offerSlug: resolvedOfferSlug,
      plan,
      jobId: resolvedJobId,
      videoUrl: resolvedVideoUrl,
    });
  } catch (error) {
    console.error("[set-premium] error:", error);
    return NextResponse.json(
      { ok: false, error: "PREMIUM_SET_FAILED" },
      { status: 500 }
    );
  }
}
