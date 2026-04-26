import type { NextRequest, NextResponse } from "next/server";

/** Legacy cookie: treat as video trial consumed (migration). */
export const LEGACY_FREE_TRIAL_COOKIE_NAME = "attentiq_free_trial_used";

export type FreeTrialFormat = "video" | "text" | "image";

export const FREE_TRIAL_COOKIE_BY_FORMAT: Record<FreeTrialFormat, string> = {
  video: "attentiq_free_trial_used_video",
  text: "attentiq_free_trial_used_text",
  image: "attentiq_free_trial_used_image",
};

export const FREE_TRIAL_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Local dev only: add `ATTENTIQ_DEV_VIDEO_TRIAL_BYPASS=1` to `.env.local` while
 * `next dev` runs so URL/upload video tests are not blocked after the first run.
 * Never set this in production.
 */
export function isDevVideoTrialBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ATTENTIQ_DEV_VIDEO_TRIAL_BYPASS === "1"
  );
}

export function hasUsedFreeTrialForFormat(
  req: NextRequest,
  format: FreeTrialFormat
): boolean {
  const key = FREE_TRIAL_COOKIE_BY_FORMAT[format];
  if (req.cookies.get(key)?.value === "1") {
    return true;
  }
  if (format === "video" && req.cookies.get(LEGACY_FREE_TRIAL_COOKIE_NAME)?.value === "1") {
    return true;
  }
  return false;
}

export function paywallPathForFormat(format: FreeTrialFormat): string {
  if (format === "video") return "/videos#tarifs";
  if (format === "text") return "/text#tarifs";
  return "/images#tarifs";
}

export function freeTrialExhaustedUserMessage(format: FreeTrialFormat): string {
  if (format === "video") {
    return "Votre analyse video gratuite est deja utilisee. Debloquez une offre pour continuer.";
  }
  if (format === "text") {
    return "Votre analyse texte gratuite est deja utilisee. Debloquez une offre pour continuer.";
  }
  return "Votre analyse image gratuite est deja utilisee. Debloquez une offre pour continuer.";
}

export function setFreeTrialCookieOnResponse(
  response: NextResponse,
  format: FreeTrialFormat,
  hasPremium: boolean
): void {
  if (hasPremium) {
    return;
  }
  response.cookies.set({
    name: FREE_TRIAL_COOKIE_BY_FORMAT[format],
    value: "1",
    maxAge: FREE_TRIAL_COOKIE_MAX_AGE_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
  if (format === "video") {
    response.cookies.set({
      name: LEGACY_FREE_TRIAL_COOKIE_NAME,
      value: "",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  }
}
