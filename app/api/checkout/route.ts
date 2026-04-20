import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// ✅ Pas de apiVersion hardcodée → Stripe prend celle du compte

function getBaseUrl(req: NextRequest) {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("host");

  if (!host) {
    throw new Error("Host header is missing");
  }

  const protocol = forwardedProto ?? "http";
  return `${protocol}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const { jobId, videoUrl } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId manquant" },
        { status: 400 }
      );
    }

    if (!videoUrl) {
      return NextResponse.json(
        { error: "videoUrl manquante" },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl(req);

    // ✅ Price ID Stripe (à remplacer si besoin)
    const PRICE_ID = process.env.STRIPE_PRICE_SINGLE_REPORT;

    if (!PRICE_ID) {
      throw new Error("STRIPE_PRICE_SINGLE_REPORT non défini");
    }

    // ✅ UNE session Stripe par clic utilisateur
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
