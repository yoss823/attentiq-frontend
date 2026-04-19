import { NextResponse } from 'next/server';
import { PREMIUM_COOKIE_NAME, PREMIUM_COOKIE_MAX_AGE } from '@/lib/premium';

/**
 * POST /api/set-premium
 *
 * Called from the /merci page after a successful Stripe payment.
 * Sets two cookies:
 *   - attentiq_premium (httpOnly) — tamper-proof, read by server-side code
 *   - attentiq_premium (non-httpOnly) — readable by client-side JS via
 *     getPremiumFromCookie() in lib/premium.ts
 *
 * Both cookies share the same name; the httpOnly one takes precedence in
 * server contexts while the plain one is accessible from the browser.
 * We set the httpOnly version here and let the client set its own copy
 * via setPremiumCookie() as a fallback.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  // httpOnly cookie — cannot be read or modified by client-side JS
  response.cookies.set(PREMIUM_COOKIE_NAME, 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: PREMIUM_COOKIE_MAX_AGE,
  });

  return response;
}
