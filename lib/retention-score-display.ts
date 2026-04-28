/**
 * Score affiché sur /10, avec un plafond volontaire à 6,5 : même lecture gratuit / payant,
 * mais aucune note au-delà de 6,5/10 pour refléter l’inférence (pas d’analytics natives) et
 * la marge d’amélioration qu’Attentiq adresse.
 */
export const RETENTION_SCORE_DISPLAY_MAX = 10 as const;

/** Plus haute valeur affichée (le dénominateur reste 10). */
export const RETENTION_SCORE_DISPLAY_CAP = 6.5 as const;

export function clampRetentionScoreForDisplay(
  raw: number | null | undefined
): number | null {
  if (raw == null || !Number.isFinite(Number(raw))) {
    return null;
  }
  const n = Number(Number(raw).toFixed(1));
  return Math.max(0, Math.min(RETENTION_SCORE_DISPLAY_CAP, n));
}

export function formatRetentionScoreFraction(score: number | null | undefined): string {
  const s = clampRetentionScoreForDisplay(score);
  if (s == null) {
    return "—";
  }
  return `${s.toFixed(1)}/${RETENTION_SCORE_DISPLAY_MAX}`;
}
