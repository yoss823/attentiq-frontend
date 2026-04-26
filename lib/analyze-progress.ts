export const ANALYZE_PROGRESS_STEPS = [
  {
    label: "Verification de l'URL et recuperation de la video",
    helper:
      "Attentiq verifie l'URL (TikTok, YouTube, Instagram, Snapchat) ou le fichier, puis lance la collecte.",
    startMs: 0,
  },
  {
    label: "Transcription et reperage des ruptures",
    helper: "La piste audio et le rythme sont inspectes pour isoler les moments de decrochage.",
    startMs: 15_000,
  },
  {
    label: "Synthese du diagnostic d'attention",
    helper: "Le teaser gratuit est prepare avec les chutes visibles et l'aperçu d'actions.",
    startMs: 42_000,
  },
  {
    label: "Mise en forme du rapport",
    helper: "Le rapport est assemble avant la redirection vers votre resultat.",
    startMs: 72_000,
  },
] as const;

export function getCurrentAnalyzeStepIndex(elapsedMs: number) {
  for (let index = ANALYZE_PROGRESS_STEPS.length - 1; index >= 0; index -= 1) {
    if (elapsedMs >= ANALYZE_PROGRESS_STEPS[index].startMs) {
      return index;
    }
  }

  return 0;
}

export function getAnalyzeProgressPercent(elapsedMs: number) {
  const capped = Math.min(elapsedMs, 90_000);
  return Math.max(8, Math.min(96, (capped / 90_000) * 100));
}

export function formatElapsedLabel(elapsedMs: number) {
  const seconds = Math.max(1, Math.round(elapsedMs / 1000));
  return `${seconds}s`;
}
