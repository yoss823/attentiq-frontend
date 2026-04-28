/**
 * Échelle d'affichage du score de rétention : plafond volontairement exigeant
 * (évite des « 9/10 » peu crédibles sur de l'inférence sans analytics natives).
 */
export const RETENTION_SCORE_DISPLAY_MAX = 6.5 as const;

export function clampRetentionScoreForDisplay(
  raw: number | null | undefined
): number | null {
  if (raw == null || !Number.isFinite(Number(raw))) {
    return null;
  }
  const n = Number(Number(raw).toFixed(1));
  return Math.max(0, Math.min(RETENTION_SCORE_DISPLAY_MAX, n));
}

export function formatRetentionScoreFraction(score: number | null | undefined): string {
  const s = clampRetentionScoreForDisplay(score);
  if (s == null) {
    return "—";
  }
  return `${s.toFixed(1)}/${RETENTION_SCORE_DISPLAY_MAX}`;
}
