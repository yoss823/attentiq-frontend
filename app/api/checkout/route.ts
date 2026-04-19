import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

function getBaseUrl(req: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`
  );
}

type CheckoutBody = {
  plan?: "single" | "pack5" | "unlimited";
  jobId?: string;
  videoUrl?: string;
};

function getPriceId(plan: CheckoutBody["plan"]) {
  switch (plan) {
    case "pack5":
      return process.env.STRIPE_PRICE_PACK_5 || "";
    case "unlimited":
      return process.env.STRIPE_PRICE_UNLIMITED || "";
    case "single":
    default:
      return process.env.STRIPE_PRICE_RAPPORT_COMPLET || "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody;

    const plan = body.plan || "single";
    const jobId = body.jobId?.trim();
    const videoUrl = body.videoUrl?.trim() || "";

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing required field: jobId" },
        { status: 400 }
      );
    }

    const priceId = getPriceId(plan);

    if (!priceId) {
      return NextResponse.json(
        { error: `No Stripe price configured for plan "${plan}"` },
        { status: 500 }
      );
    }

    const baseUrl = getBaseUrl(req);

    const successUrl = new URL("/merci", baseUrl);
    successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
    successUrl.searchParams.set("jobId", jobId);
    if (videoUrl) {
      successUrl.searchParams.set("videoUrl", videoUrl);
    }

    const cancelUrl = new URL("/analyze", baseUrl);
    cancelUrl.searchParams.set("jobId", jobId);
    if (videoUrl) {
      cancelUrl.searchParams.set("videoUrl", videoUrl);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      metadata: {
        jobId,
        videoUrl,
        plan,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe checkout creation error:", error);
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 }
    );
  }
}
