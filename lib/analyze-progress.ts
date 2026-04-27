export const ANALYZE_PROGRESS_STEPS = [
  {
    label: "Vérification de l'URL et récupération de la vidéo",
    helper:
      "Attentiq vérifie l'URL (TikTok, YouTube, Instagram, Snapchat) ou le fichier, puis lance la collecte.",
    startMs: 0,
  },
  {
    label: "Transcription et repérage des ruptures",
    helper: "La piste audio et le rythme sont inspectés pour isoler les moments de décrochage.",
    startMs: 15_000,
  },
  {
    label: "Synthèse du diagnostic d'attention",
    helper:
      "Le teaser gratuit liste quelques chutes précises ; le complet expose toute la timeline et les analyses liées.",
    startMs: 42_000,
  },
  {
    label: "Mise en forme du rapport",
    helper: "Le rapport est assemblé avant la redirection vers votre résultat.",
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
