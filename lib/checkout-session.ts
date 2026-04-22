import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { normalizeCheckoutContext } from "@/lib/checkout-context";

export const CHECKOUT_CONTEXT_COOKIE_NAME = "attentiq_checkout_context";

const CHECKOUT_CONTEXT_TTL_SECONDS = 2 * 60 * 60;

type SignedCheckoutContext = {
  offerSlug: string;
  jobId: string | null;
  videoUrl: string | null;
  issuedAt: string;
};

function getCheckoutContextSecret() {
  return (
    process.env.CHECKOUT_CONTEXT_SECRET?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    "attentiq-dev-checkout-context"
  );
}

function encodePayload(payload: SignedCheckoutContext) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(value: string) {
  try {
    return JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as Partial<SignedCheckoutContext>;
  } catch {
    return null;
  }
}

function signValue(value: string) {
  return createHmac("sha256", getCheckoutContextSecret())
    .update(value)
    .digest("base64url");
}

function isValidSignature(payload: string, signature: string) {
  const expected = Buffer.from(signValue(payload));
  const received = Buffer.from(signature);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export function createCheckoutContextCookieValue({
  offerSlug,
  jobId = null,
  videoUrl = null,
}: {
  offerSlug: string;
  jobId?: string | null;
  videoUrl?: string | null;
}) {
  const normalized = normalizeCheckoutContext({
    offerSlug,
    jobId,
    videoUrl,
  });

  if (!normalized.offerSlug) {
    throw new Error("offerSlug is required");
  }

  const payload = encodePayload({
    offerSlug: normalized.offerSlug,
    jobId: normalized.jobId,
    videoUrl: normalized.videoUrl,
    issuedAt: new Date().toISOString(),
  });

  return `${payload}.${signValue(payload)}`;
}

export function parseCheckoutContextCookieValue(value: string | null) {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");

  if (!payload || !signature || !isValidSignature(payload, signature)) {
    return null;
  }

  const decoded = decodePayload(payload);

  if (
    !decoded ||
    typeof decoded.offerSlug !== "string" ||
    typeof decoded.issuedAt !== "string"
  ) {
    return null;
  }

  const issuedAt = new Date(decoded.issuedAt);

  if (Number.isNaN(issuedAt.getTime())) {
    return null;
  }

  if (Date.now() - issuedAt.getTime() > CHECKOUT_CONTEXT_TTL_SECONDS * 1000) {
    return null;
  }

  return normalizeCheckoutContext({
    offerSlug: decoded.offerSlug,
    jobId: typeof decoded.jobId === "string" ? decoded.jobId : null,
    videoUrl: typeof decoded.videoUrl === "string" ? decoded.videoUrl : null,
  });
}

export function getCheckoutContextCookieMaxAgeSeconds() {
  return CHECKOUT_CONTEXT_TTL_SECONDS;
}
