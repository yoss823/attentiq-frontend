import { NextRequest, NextResponse } from "next/server";
import {
  CHECKOUT_CONTEXT_COOKIE_NAME,
  createCheckoutContextCookieValue,
  getCheckoutContextCookieMaxAgeSeconds,
} from "@/lib/checkout-session";
import { getOfferBySlug } from "@/lib/offer-config";

export const runtime = "nodejs";

type PrepareCheckoutBody = {
  offerSlug?: unknown;
  jobId?: unknown;
  videoUrl?: unknown;
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

  const response = NextResponse.json({
    ok: true,
    redirectUrl: offer.stripeUrl,
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
