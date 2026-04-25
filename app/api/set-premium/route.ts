import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getPlanFromOfferSlug } from "@/lib/premium";
import { normalizeOfferSlug, getOfferByPriceCents } from "@/lib/offer-config";

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

    const paymentOk =
      session.payment_status === "paid" || session.status === "complete";

    if (!paymentOk) {
      return NextResponse.json(
        { ok: false, error: "SESSION_NOT_PAID" },
        { status: 403 }
      );
    }

    // Resolve offer slug from session metadata or amount
    const rawOfferSlug =
      session.metadata?.offerSlug?.trim() ||
      session.metadata?.plan?.trim() ||
      null;
    const amountTotal = session.amount_total ?? 0;
    const offerFromAmount = getOfferByPriceCents(amountTotal);
    const resolvedOfferSlug =
      normalizeOfferSlug(rawOfferSlug) ??
      offerFromAmount?.slug ??
      "single";

    const plan = getPlanFromOfferSlug(resolvedOfferSlug);

    // Resolve jobId from body or session metadata
    const resolvedJobId =
      jobId ?? normalizeString(session.metadata?.jobId) ?? null;
    const resolvedVideoUrl =
      videoUrl ?? normalizeString(session.metadata?.videoUrl) ?? null;

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
