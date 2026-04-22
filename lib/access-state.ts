import { hasSubscriptionAccess, type PremiumEntitlement } from "@/lib/premium";
import { normalizeCheckoutContext } from "@/lib/checkout-context";

export const FREE_LIMIT_COOKIE_NAME = "attentiq_free_used";

const FREE_LIMIT_STORAGE_KEY = "attentiq.free.limit.v1";
const PENDING_CHECKOUT_STORAGE_KEY = "attentiq.checkout.pending.v1";

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;
const FREE_LIMIT_COOKIE_TTL_SECONDS = 365 * ONE_DAY_IN_SECONDS;

type StorageValue = {
  savedAt: string;
};

export type PendingCheckoutState = StorageValue & {
  offerSlug: string;
  jobId: string | null;
  videoUrl: string | null;
  source: "checkout_page";
};

export type FreeLimitState = StorageValue & {
  fingerprint: string;
  url: string | null;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "SameSite=Lax",
    "Secure",
    `Max-Age=${maxAgeSeconds}`,
  ].join("; ");
}

function readCookie(name: string): string | null {
  if (!isBrowser()) {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(name.length + 1));
}

function readStorageItem<T>(key: string): T | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function writeStorageItem(key: string, value: unknown) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function removeStorageItem(key: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(key);
}

export function persistPendingCheckout({
  offerSlug,
  jobId = null,
  videoUrl = null,
}: {
  offerSlug: string;
  jobId?: string | null;
  videoUrl?: string | null;
}) {
  const normalizedContext = normalizeCheckoutContext({
    offerSlug,
    jobId,
    videoUrl,
  });

  const state: PendingCheckoutState = {
    offerSlug: normalizedContext.offerSlug ?? offerSlug,
    jobId: normalizedContext.jobId,
    videoUrl: normalizedContext.videoUrl,
    source: "checkout_page",
    savedAt: new Date().toISOString(),
  };

  writeStorageItem(PENDING_CHECKOUT_STORAGE_KEY, state);
}

export function readPendingCheckout() {
  return readStorageItem<PendingCheckoutState>(PENDING_CHECKOUT_STORAGE_KEY);
}

export function clearPendingCheckout() {
  removeStorageItem(PENDING_CHECKOUT_STORAGE_KEY);
}

export function markFreeDiagnosticUsed(fingerprint: string, url: string) {
  const state: FreeLimitState = {
    fingerprint,
    url: url.trim() || null,
    savedAt: new Date().toISOString(),
  };

  writeStorageItem(FREE_LIMIT_STORAGE_KEY, state);
  setCookie(FREE_LIMIT_COOKIE_NAME, fingerprint, FREE_LIMIT_COOKIE_TTL_SECONDS);
}

export function readFreeLimitState() {
  return readStorageItem<FreeLimitState>(FREE_LIMIT_STORAGE_KEY);
}

export function isFreeDiagnosticBlocked(
  fingerprint: string | null,
  initialEntitlement: PremiumEntitlement | null = null
) {
  if (!fingerprint || hasSubscriptionAccess(initialEntitlement)) {
    return false;
  }

  const cookieFingerprint = readCookie(FREE_LIMIT_COOKIE_NAME);
  const storedFingerprint = readFreeLimitState()?.fingerprint;

  return cookieFingerprint === fingerprint || storedFingerprint === fingerprint;
}

function fallbackFingerprint(rawValue: string) {
  let total = 0;
  for (let index = 0; index < rawValue.length; index += 1) {
    total = (total * 31 + rawValue.charCodeAt(index)) >>> 0;
  }

  return total.toString(16);
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeLightFingerprint() {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    window.screen.width,
    window.screen.height,
    window.devicePixelRatio,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");

  if (!window.crypto?.subtle) {
    return fallbackFingerprint(rawValue);
  }

  const encoded = new TextEncoder().encode(rawValue);
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return bytesToHex(new Uint8Array(digest)).slice(0, 24);
}
