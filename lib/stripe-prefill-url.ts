const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isLikelyCustomerEmail(value: string | null | undefined): boolean {
  const t = (value ?? "").trim();
  return t.length > 3 && t.length < 320 && EMAIL_RE.test(t);
}

/**
 * Payment Links / Checkout hosted pages accept `prefilled_email` (Stripe docs).
 */
/**
 * Email utilisé pour préremplir Stripe : d'abord localStorage (saisi sur /compte),
 * puis variable publique optionnelle (ex. tests en local).
 */
export function getCheckoutPrefillEmailForClient(): string | undefined {
  if (typeof window !== "undefined") {
    const fromLs = window.localStorage
      .getItem("attentiq_checkout_prefill_email")
      ?.trim();
    if (fromLs) {
      return fromLs;
    }
  }
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_STRIPE_PREFILL_EMAIL?.trim()
      : "";
  return fromEnv || undefined;
}

export function withStripePrefilledEmail(
  checkoutUrl: string,
  email: string | null | undefined
): string {
  const trimmed = (email ?? "").trim();
  if (!trimmed || !isLikelyCustomerEmail(trimmed)) {
    return checkoutUrl;
  }
  try {
    const u = new URL(checkoutUrl);
    if (!u.hostname.endsWith("stripe.com")) {
      return checkoutUrl;
    }
    u.searchParams.set("prefilled_email", trimmed);
    return u.toString();
  } catch {
    return checkoutUrl;
  }
}
