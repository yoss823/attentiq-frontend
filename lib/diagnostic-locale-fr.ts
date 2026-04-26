/**
 * Libellés et léger lissage FR pour les champs parfois partiellement anglais (sortie LLM).
 */

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  snapchat: "Snapchat",
  twitter: "X / Twitter",
  upload: "Fichier importé",
  unknown: "Vidéo courte",
};

export function formatSourcePlatformLabel(
  platform: string | undefined | null
): string {
  const key = (platform ?? "unknown").toLowerCase().trim();
  return PLATFORM_LABELS[key] ?? "Vidéo courte";
}

export function formatAttentionDiagnosticEyebrow(
  platform: string | undefined | null
): string {
  const source = formatSourcePlatformLabel(platform);
  return `Diagnostic d'attention · ${source}`;
}

const EN_SNIPPETS: Array<[RegExp, string]> = [
  [/hook weak/gi, "accroche trop faible"],
  [/weak hook/gi, "accroche trop faible"],
  [/strong hook/gi, "accroche solide"],
  [/slow hook/gi, "accroche qui démarre trop tard"],
  [/open loop/gi, "boucle ouverte"],
  [/pain point/gi, "problème cible"],
  [/value prop/gi, "proposition de valeur"],
  [/social proof/gi, "preuve sociale"],
  [/call to action/gi, "appel à l'action"],
  [/\bcta\b/gi, "appel à l'action"],
  [/\bretention\b/gi, "rétention"],
];

export function polishDiagnosticFrenchForDisplay(
  text: string | undefined | null
): string {
  if (text == null) return "";
  let t = text;
  for (const [pattern, replacement] of EN_SNIPPETS) {
    t = t.replace(pattern, replacement);
  }
  return t;
}
