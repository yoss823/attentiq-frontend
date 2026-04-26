import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

function getBaseUrl(req: NextRequest) {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("host");

  if (!host) {
    throw new Error("Host header is missing");
  }

  const protocol = forwardedProto ?? "https";
  return `${protocol}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const { jobId, videoUrl } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "jobId manquant" }, { status: 400 });
    }

    if (!videoUrl) {
      return NextResponse.json({ error: "videoUrl manquante" }, { status: 400 });
    }

    const PRICE_ID =
      process.env.STRIPE_PRICE_SINGLE_REPORT ||
      process.env.STRIPE_PRICE_SINGLE_REPORT_9;
    if (!PRICE_ID) {
      throw new Error(
        "STRIPE_PRICE_SINGLE_REPORT ou STRIPE_PRICE_SINGLE_REPORT_9 non défini"
      );
    }

    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        jobId,
        videoUrl,
      },
      success_url: `${baseUrl}/merci?session_id={CHECKOUT_SESSION_ID}&jobId=${jobId}`,
      cancel_url: `${baseUrl}/analyze`,
    });

    if (!session.url) {
      throw new Error("Stripe session URL manquante");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur création session Stripe",
      },
      { status: 500 }
    );
  }
}
