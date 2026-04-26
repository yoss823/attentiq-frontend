import { readAnalyzeResult } from "@/lib/analyze-session";
import { normalizeOfferSlug } from "@/lib/offer-config";

export const PREMIUM_ENTITLEMENT_COOKIE_NAME = "attentiq_premium_entitlement";

export const LEGACY_PREMIUM_UNLOCK_COOKIE_NAME = "attentiq_premium_unlock";
export const LEGACY_SUBSCRIPTION_ACCESS_COOKIE_NAME =
  "attentiq_subscription_access";

const PREMIUM_ENTITLEMENT_STORAGE_KEY = "attentiq.premium.entitlement.v1";
const LEGACY_PREMIUM_UNLOCK_STORAGE_KEY = "attentiq.premium.unlock.v1";
const LEGACY_SUBSCRIPTION_ACCESS_STORAGE_KEY =
  "attentiq.subscription.access.v1";

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;
const SINGLE_PLAN_TTL_SECONDS = 7 * ONE_DAY_IN_SECONDS;
const SUBSCRIPTION_PLAN_TTL_SECONDS = 31 * ONE_DAY_IN_SECONDS;

type StorageValue = {
  savedAt: string;
};

type LegacyPremiumUnlockState = StorageValue & {
  requestId: string;
  offerSlug: string | null;
};

type LegacySubscriptionAccessState = StorageValue & {
  offerSlug: string;
};

export type PremiumPlan = "single" | "5" | "pack15";

export type PremiumEntitlement = StorageValue & {
  isPremium: boolean;
  jobId: string | null;
  requestId: string | null;
  plan: PremiumPlan | null;
  offerSlug: string | null;
  /** E-mail abonné (côté serveur pour quota mensuel), renvoyé après set-premium. */
  subscriberEmail: string | null;
  expiresAt: string | null;
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

export function getPlanFromOfferSlug(
  offerSlug: string | null | undefined
): PremiumPlan | null {
  const normalizedOfferSlug = normalizeOfferSlug(offerSlug);

  if (!normalizedOfferSlug) {
    return null;
  }

  if (normalizedOfferSlug === "single") {
    return "single";
  }

  if (normalizedOfferSlug === "monthly-5") {
    return "5";
  }

  if (normalizedOfferSlug === "pack-15") {
    return "pack15";
  }

  return null;
}

function getPlanTtlSeconds(plan: PremiumPlan | null) {
  if (plan === "single") {
    return SINGLE_PLAN_TTL_SECONDS;
  }

  if (plan === "5") {
    return SUBSCRIPTION_PLAN_TTL_SECONDS;
  }

  if (plan === "pack15") {
    /** 15 rapports / mois : même logique de fenêtre d'accès que l'abonnement 5 rapports. */
    return SUBSCRIPTION_PLAN_TTL_SECONDS;
  }

  return SINGLE_PLAN_TTL_SECONDS;
}

function isPremiumEntitlement(value: unknown): value is PremiumEntitlement {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PremiumEntitlement>;
  return (
    typeof candidate.savedAt === "string" &&
    typeof candidate.isPremium === "boolean" &&
    (candidate.jobId == null || typeof candidate.jobId === "string") &&
    (candidate.requestId == null || typeof candidate.requestId === "string") &&
    (candidate.plan == null ||
      candidate.plan === "single" ||
      candidate.plan === "5" ||
      candidate.plan === "pack15") &&
    (candidate.offerSlug == null || typeof candidate.offerSlug === "string") &&
    (candidate.subscriberEmail == null ||
      typeof candidate.subscriberEmail === "string") &&
    (candidate.expiresAt == null || typeof candidate.expiresAt === "string")
  );
}

function normalizeIsoDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function coerceString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function isEntitlementExpired(
  entitlement: Pick<PremiumEntitlement, "expiresAt">
): boolean {
  if (!entitlement.expiresAt) {
    return false;
  }

  return new Date(entitlement.expiresAt).getTime() <= Date.now();
}

function sanitizeEntitlement(
  entitlement: PremiumEntitlement | null
): PremiumEntitlement | null {
  if (!entitlement || !entitlement.isPremium || isEntitlementExpired(entitlement)) {
    return null;
  }

  return {
    ...entitlement,
    jobId: coerceString(entitlement.jobId),
    requestId: coerceString(entitlement.requestId),
    offerSlug: coerceString(entitlement.offerSlug),
    subscriberEmail: coerceString(entitlement.subscriberEmail),
    expiresAt: normalizeIsoDate(entitlement.expiresAt),
  };
}

function buildPremiumEntitlement({
  offerSlug,
  jobId,
  requestId,
  subscriberEmail,
  savedAt = new Date(),
}: {
  offerSlug: string;
  jobId?: string | null;
  requestId?: string | null;
  subscriberEmail?: string | null;
  savedAt?: Date;
}): PremiumEntitlement {
  const normalizedOfferSlug = normalizeOfferSlug(offerSlug) ?? offerSlug;
  const plan = getPlanFromOfferSlug(normalizedOfferSlug);
  const savedAtIso = savedAt.toISOString();
  const expiresAt = new Date(
    savedAt.getTime() + getPlanTtlSeconds(plan) * 1000
  ).toISOString();

  return {
    isPremium: true,
    jobId: coerceString(jobId),
    requestId: coerceString(requestId),
    plan,
    offerSlug: normalizedOfferSlug,
    subscriberEmail: coerceString(subscriberEmail),
    expiresAt,
    savedAt: savedAtIso,
  };
}

function readEntitlementCookie() {
  return parsePremiumEntitlement(readCookie(PREMIUM_ENTITLEMENT_COOKIE_NAME));
}

function readEntitlementStorage() {
  const value = readStorageItem<unknown>(PREMIUM_ENTITLEMENT_STORAGE_KEY);
  return isPremiumEntitlement(value) ? sanitizeEntitlement(value) : null;
}

function pickLatestEntitlement(
  ...candidates: Array<PremiumEntitlement | null | undefined>
) {
  const valid = candidates
    .map((candidate) => sanitizeEntitlement(candidate ?? null))
    .filter((candidate): candidate is PremiumEntitlement => Boolean(candidate));

  if (valid.length === 0) {
    return null;
  }

  return valid.sort((left, right) => {
    return (
      new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime()
    );
  })[0];
}

function readLegacyPremiumUnlockState() {
  const value = readStorageItem<unknown>(LEGACY_PREMIUM_UNLOCK_STORAGE_KEY);

  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<LegacyPremiumUnlockState>;
  if (
    typeof candidate.savedAt !== "string" ||
    typeof candidate.requestId !== "string" ||
    (candidate.offerSlug != null && typeof candidate.offerSlug !== "string")
  ) {
    return null;
  }

  return candidate as LegacyPremiumUnlockState;
}

function readLegacySubscriptionAccessState() {
  const value = readStorageItem<unknown>(LEGACY_SUBSCRIPTION_ACCESS_STORAGE_KEY);

  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<LegacySubscriptionAccessState>;
  if (
    typeof candidate.savedAt !== "string" ||
    typeof candidate.offerSlug !== "string"
  ) {
    return null;
  }

  return candidate as LegacySubscriptionAccessState;
}

export function parsePremiumEntitlement(
  value: string | null | undefined
): PremiumEntitlement | null {
  if (!value) {
    return null;
  }

  try {
    const decodedValue = (() => {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    })();
    const parsed: unknown = JSON.parse(decodedValue);
    if (!isPremiumEntitlement(parsed)) {
      return null;
    }

    return sanitizeEntitlement(parsed);
  } catch {
    return null;
  }
}

export function buildLegacyPremiumEntitlement({
  premiumUnlockRequestId,
  subscriptionOfferSlug,
}: {
  premiumUnlockRequestId?: string | null;
  subscriptionOfferSlug?: string | null;
}) {
  const subscriptionPlan = getPlanFromOfferSlug(subscriptionOfferSlug);
  if (subscriptionPlan) {
    return buildPremiumEntitlement({
      offerSlug: subscriptionOfferSlug!,
      savedAt: new Date(),
    });
  }

  if (premiumUnlockRequestId) {
    return {
      isPremium: true,
      jobId: null,
      requestId: premiumUnlockRequestId,
      plan: "single" as const,
      offerSlug: null,
      subscriberEmail: null,
      expiresAt: new Date(Date.now() + SINGLE_PLAN_TTL_SECONDS * 1000).toISOString(),
      savedAt: new Date().toISOString(),
    };
  }

  return null;
}

export function readPremiumEntitlement(
  initialEntitlement: PremiumEntitlement | null = null
) {
  const currentEntitlement = pickLatestEntitlement(
    initialEntitlement,
    readEntitlementCookie(),
    readEntitlementStorage()
  );

  if (currentEntitlement) {
    return currentEntitlement;
  }

  const legacySubscription = readLegacySubscriptionAccessState();
  const legacyUnlock = readLegacyPremiumUnlockState();
  const legacyCookieEntitlement = buildLegacyPremiumEntitlement({
    premiumUnlockRequestId: readCookie(LEGACY_PREMIUM_UNLOCK_COOKIE_NAME),
    subscriptionOfferSlug: readCookie(
      LEGACY_SUBSCRIPTION_ACCESS_COOKIE_NAME
    ),
  });
  const legacyStorageEntitlement = legacySubscription
    ? buildPremiumEntitlement({
        offerSlug: legacySubscription.offerSlug,
        savedAt: new Date(legacySubscription.savedAt),
      })
    : legacyUnlock
      ? buildPremiumEntitlement({
          offerSlug: legacyUnlock.offerSlug ?? "single",
          requestId: legacyUnlock.requestId,
          savedAt: new Date(legacyUnlock.savedAt),
        })
      : null;

  return pickLatestEntitlement(legacyCookieEntitlement, legacyStorageEntitlement);
}

export function persistPremiumEntitlement(entitlement: PremiumEntitlement) {
  const sanitized = sanitizeEntitlement(entitlement);
  if (!sanitized) {
    return;
  }

  writeStorageItem(PREMIUM_ENTITLEMENT_STORAGE_KEY, sanitized);
  setCookie(
    PREMIUM_ENTITLEMENT_COOKIE_NAME,
    JSON.stringify(sanitized),
    getPlanTtlSeconds(sanitized.plan)
  );
}

export function hasSubscriptionAccess(
  initialEntitlement: PremiumEntitlement | null = null
) {
  const entitlement = readPremiumEntitlement(initialEntitlement);
  return entitlement?.plan === "5" || entitlement?.plan === "pack15";
}

/** Réponses assistant autorisées par rapport complet (pas un quota mensuel). */
export function getMaxAssistantRepliesForPremiumPlan(
  plan: PremiumPlan | null
): number {
  if (plan === "pack15") return 5;
  return 3;
}

export function resolveMaxAssistantRepliesForReport(
  entitlement: PremiumEntitlement | null,
  isPremiumUnlocked: boolean
) {
  if (!isPremiumUnlocked) return 1;
  return getMaxAssistantRepliesForPremiumPlan(entitlement?.plan ?? null);
}

export function resolvePremiumAccessState({
  reportRequestId,
  reportJobId = null,
  initialEntitlement = null,
}: {
  reportRequestId: string;
  reportJobId?: string | null;
  initialEntitlement?: PremiumEntitlement | null;
}) {
  const entitlement = readPremiumEntitlement(initialEntitlement);
  const isSubscriptionEntitlement =
    entitlement?.plan === "5" || entitlement?.plan === "pack15";
  const isMatchingOneShot =
    Boolean(entitlement) &&
    (entitlement?.requestId === reportRequestId ||
      (!!reportJobId && entitlement?.jobId === reportJobId));

  return {
    entitlement,
    isSubscriptionEntitlement,
    isPremiumUnlocked: Boolean(isSubscriptionEntitlement || isMatchingOneShot),
  };
}

export function activatePremiumEntitlementFromSuccessfulCheckout(
  {
    offerSlug,
    jobId = null,
    videoUrl = null,
    subscriberEmail = null,
  }: {
    offerSlug: string;
    jobId?: string | null;
    videoUrl?: string | null;
    subscriberEmail?: string | null;
  }
) {
  const storedResult = readAnalyzeResult();
  const matchingStoredResult =
    storedResult &&
    ((jobId && storedResult.jobId === jobId) ||
      (videoUrl && storedResult.url === videoUrl) ||
      (!jobId && !videoUrl))
      ? storedResult
      : null;
  const entitlement = buildPremiumEntitlement({
    offerSlug,
    jobId: matchingStoredResult?.jobId ?? jobId,
    requestId: matchingStoredResult?.report.data.request_id ?? null,
    subscriberEmail,
  });

  persistPremiumEntitlement(entitlement);

  return {
    entitlement,
    unlockMode:
      entitlement.plan === "5" || entitlement.plan === "pack15"
        ? ("subscription" as const)
        : ("one_shot" as const),
  };
}
