/**
 * Premium cookie helpers
 *
 * Cookie name : attentiq_premium
 * Duration    : 30 days
 *
 * The authoritative cookie is set server-side (httpOnly) by
 * /api/set-premium so it cannot be tampered with from JS.
 * getPremiumFromCookie() is used client-side to read the
 * non-httpOnly mirror cookie that the API also sets.
 */

export const PREMIUM_COOKIE_NAME = 'attentiq_premium';
/** 30 days in seconds */
export const PREMIUM_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

// ---------------------------------------------------------------------------
// Client-side helpers (browser only)
// ---------------------------------------------------------------------------

/**
 * Read the premium flag from document.cookie.
 * Returns true only when the cookie value is exactly "true".
 */
export function getPremiumFromCookie(): boolean {
  if (typeof document === 'undefined') return false;
  const entry = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${PREMIUM_COOKIE_NAME}=`));
  return entry?.split('=')[1] === 'true';
}

/**
 * Set the premium cookie directly from the browser.
 * Used as a fallback; the httpOnly cookie set by the API is preferred.
 */
export function setPremiumCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${PREMIUM_COOKIE_NAME}=true; path=/; max-age=${PREMIUM_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Clear the premium cookie (e.g. on logout).
 */
export function clearPremiumCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${PREMIUM_COOKIE_NAME}=; path=/; max-age=0`;
}
