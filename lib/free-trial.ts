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
export const FREE_TRIAL_MAX_ANALYSES = 3;
export const FREE_TRIAL_TOTAL_COUNT_COOKIE_NAME = "attentiq_free_trial_total_count";

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
  void format;
  const rawTotal = req.cookies.get(FREE_TRIAL_TOTAL_COUNT_COOKIE_NAME)?.value ?? null;
  const parsedTotal = rawTotal ? Number.parseInt(rawTotal, 10) : Number.NaN;
  if (Number.isFinite(parsedTotal) && parsedTotal >= FREE_TRIAL_MAX_ANALYSES) {
    return true;
  }

  // Migration: reconstruct rough count from old per-format cookies when total count is absent.
  const legacyCount = (["video", "text", "image"] as const).reduce((count, key) => {
    return count + (req.cookies.get(FREE_TRIAL_COOKIE_BY_FORMAT[key])?.value === "1" ? 1 : 0);
  }, 0);
  const hasLegacyVideo = req.cookies.get(LEGACY_FREE_TRIAL_COOKIE_NAME)?.value === "1";
  const effectiveCount = Math.max(legacyCount, hasLegacyVideo ? 1 : 0);
  return effectiveCount >= FREE_TRIAL_MAX_ANALYSES;
}

export function paywallPathForFormat(format: FreeTrialFormat): string {
  if (format === "video") return "/videos#tarifs";
  if (format === "text") return "/text#tarifs";
  return "/images#tarifs";
}

export function freeTrialExhaustedUserMessage(format: FreeTrialFormat): string {
  const limitText = `${FREE_TRIAL_MAX_ANALYSES} analyses gratuites`;
  if (format === "video") {
    return `Vous avez atteint la limite (${limitText}). Debloquez une offre pour continuer l'analyse video.`;
  }
  if (format === "text") {
    return `Vous avez atteint la limite (${limitText}). Debloquez une offre pour continuer l'analyse texte.`;
  }
  return `Vous avez atteint la limite (${limitText}). Debloquez une offre pour continuer l'analyse image.`;
}

export function setFreeTrialCookieOnResponse(
  response: NextResponse,
  format: FreeTrialFormat,
  hasPremium: boolean,
  currentTotalCount: number | null = null
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
  // Also track a global free-usage counter (new model: 3 analyses gratuites max).
  const previous = typeof currentTotalCount === "number" ? currentTotalCount : 0;
  const nextValue = String(
    Math.min(
      Number.isFinite(previous) ? previous + 1 : 1,
      FREE_TRIAL_MAX_ANALYSES
    )
  );
  response.cookies.set({
    name: FREE_TRIAL_TOTAL_COUNT_COOKIE_NAME,
    value: nextValue,
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
