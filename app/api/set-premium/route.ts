import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

const PREMIUM_COOKIE_NAME = "premium_access";

type SetPremiumBody = {
  sessionId?: string;
  jobId?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SetPremiumBody;
    const sessionId = body.sessionId?.trim();
    const requestedJobId = body.jobId?.trim();

    if (!sessionId || !requestedJobId) {
      return NextResponse.json(
        { error: "Missing sessionId or jobId" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Stripe session not found" },
        { status: 404 }
      );
    }

    const paymentOk =
      session.payment_status === "paid" ||
      session.status === "complete";

    if (!paymentOk) {
      return NextResponse.json(
        {
          error: "Stripe session is not paid",
          payment_status: session.payment_status,
          status: session.status,
        },
        { status: 403 }
      );
    }

    const paidJobId = session.metadata?.jobId?.trim() || "";
    const paidPlan = session.metadata?.plan?.trim() || "single";

    if (!paidJobId) {
      return NextResponse.json(
        { error: "No jobId found in Stripe session metadata" },
        { status: 409 }
      );
    }

    if (paidJobId !== requestedJobId) {
      return NextResponse.json(
        { error: "jobId mismatch" },
        { status: 403 }
      );
    }

    const payload = {
      active: true,
      jobId: paidJobId,
      plan: paidPlan,
      sessionId,
      grantedAt: Date.now(),
    };

    const response = NextResponse.json({
      ok: true,
      premium: payload,
    });

    response.cookies.set(PREMIUM_COOKIE_NAME, JSON.stringify(payload), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("set-premium error:", error);
    return NextResponse.json(
      { error: "Unable to validate premium access" },
      { status: 500 }
    );
  }
}
