import type {
  AttentionDrop,
  AttentiqReport,
  RailwayResponse,
} from "@/lib/railway-client";
import type { V2AnalysisResult } from "@/lib/v2-types";
import {
  clampRetentionScoreForDisplay,
  RETENTION_SCORE_DISPLAY_MAX,
} from "@/lib/retention-score-display";

export function isV2AnalysisResult(value: unknown): value is V2AnalysisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<V2AnalysisResult>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.analysedAt === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.pipelineVersion === "string" &&
    Boolean(candidate.diagnostic && typeof candidate.diagnostic === "object") &&
    Array.isArray(candidate.dashboard) &&
    Array.isArray(candidate.actions)
  );
}

const DROP_SEVERITIES = new Set<AttentionDrop["severity"]>([
  "low",
  "medium",
  "high",
  "critical",
]);

function mapV2AttentionDropsToLegacy(result: V2AnalysisResult): AttentionDrop[] {
  const list = result.attentionDrops;
  if (!Array.isArray(list) || list.length === 0) return [];
  const out: AttentionDrop[] = [];
  for (const d of list) {
    const ts = Number(d.timestampSeconds);
    const rawSev = (d.severity || "medium").toLowerCase() as AttentionDrop["severity"];
    const sev = DROP_SEVERITIES.has(rawSev) ? rawSev : "medium";
    const cause = (d.cause || "").trim();
    if (!Number.isFinite(ts) || cause.length < 4) continue;
    out.push({
      timestamp_seconds: ts,
      severity: sev,
      cause,
    });
  }
  return out;
}

/** Libellés FR pour les labels machine du moteur V2 (affichage « humain »). */
const PRIMARY_RISK_FR: Record<string, string> = {
  hook_weak:
    "Le principal frein perçu : l'accroche ne fixe pas assez vite l'attention ou la promesse reste floue.",
  hook_strong:
    "L'ouverture semble accrocher, mais ce n'est qu'un signal partiel : le score global tient compte de toute la vidéo (voir résumé).",
  pacing_off:
    "Le principal frein perçu : le rythme ou les transitions fatiguent l'attention au milieu du contenu.",
  cta_missing:
    "Le principal frein perçu : la prochaine étape (CTA) n'est pas assez claire pour transformer l'attention.",
  cta_present:
    "Un appel à l'action est présent ; vérifiez qu'il arrive assez tôt et qu'il est compris sans effort.",
  retention_high:
    "Les signaux globaux suggèrent une bonne tenue de l'attention sur ce qu'on a pu analyser ici.",
  retention_low:
    "Les signaux globaux suggèrent une attention fragile sur ce qu'on a pu analyser ici.",
  audio_mismatch:
    "Décalage perçu entre ce que dit l'audio et ce que montre l'image (quand les deux sont disponibles).",
  format_optimal:
    "Le format (cadrage, densité) semble adapté au message court.",
  format_suboptimal:
    "Le format (cadrage, lisibilité, densité) semble freiner la compréhension ou l'envie de rester.",
};

const NEGATIVE_SIGNAL =
  /absence|manque|perd|faible|pas assez|sans preuve|sans appel|flou|confus|décroch|decroch|insuffisant|pas clair|n'est pas|ne parvient pas|risque|problème|frein/i;

const SEVERE_LABELS = new Set([
  "cta_missing",
  "hook_weak",
  "pacing_off",
  "retention_low",
  "format_suboptimal",
  "audio_mismatch",
]);

/**
 * Évite score « trop optimiste » quand le texte ou le label indiquent un vrai frein.
 */
export function reconcileDiagnosticScore01(
  score01: number,
  explanation: string,
  label: string
): number {
  const ex = explanation || "";
  const neg = NEGATIVE_SIGNAL.test(ex);
  const lb = (label || "").toLowerCase();

  if (SEVERE_LABELS.has(lb) && score01 > 0.68) {
    return Math.min(score01, 0.62);
  }
  if ((lb === "hook_strong" || lb === "retention_high") && neg) {
    return Math.min(score01, 0.58);
  }
  return score01;
}

function dropOffLine(label: string): string {
  const key = (label || "").toLowerCase().trim();
  const mapped = PRIMARY_RISK_FR[key];
  if (mapped) {
    return mapped;
  }
  const human = key.replace(/_/g, " ").trim() || "signal à préciser";
  return `Levier dominant côté moteur : ${human}. Croisez avec le résumé ci-dessus.`;
}

function buildGlobalSummary(
  explanation: string,
  actions: V2AnalysisResult["actions"]
): string {
  const base = (explanation || "").trim();
  const first = actions[0];
  if (!first?.label?.trim()) {
    return (
      base ||
      "Diagnostic synthétique : croisez le score avec les actions proposées ci-dessous."
    );
  }
  const hint = first.rationale?.trim();
  if (hint && hint !== first.label.trim()) {
    return `${base} Priorité lisible dans le teaser : ${first.label.trim()} — ${hint}`;
  }
  return `${base} Priorité lisible dans le teaser : ${first.label.trim()}.`;
}

function buildCreatorPerception(
  dashboard: V2AnalysisResult["dashboard"]
): string {
  const parts = (dashboard || [])
    .slice(0, 4)
    .map((m) => {
      const v =
        typeof m.value === "number" ? String(m.value) : String(m.value ?? "");
      return `${m.label.trim()} (${v})`;
    })
    .filter(Boolean);
  if (parts.length === 0) {
    return "Synthèse des signaux : voir score et actions pour l'essentiel.";
  }
  return `Lecture rapide des leviers : ${parts.join(" · ")}.`;
}

function buildAudienceLossEstimate(scoreDisplay: number): string {
  return `Sans vos statistiques de vues : le score ${scoreDisplay.toFixed(
    1
  )}/${RETENTION_SCORE_DISPLAY_MAX} résume la cohérence perçue (accroche, promesse, clarté, CTA), pas une prédiction d'audience réelle.`;
}

function inferContentKind(result: V2AnalysisResult): "video" | "text" | "image" {
  const key = (result.inputFormat || "video").toLowerCase();
  if (key === "text" || key === "image") return key;
  return "video";
}

function titleForContentKind(kind: "video" | "text" | "image"): string {
  if (kind === "text") return "Diagnostic d'attention (texte)";
  if (kind === "image") return "Diagnostic d'attention (image)";
  return "Diagnostic d'attention (vidéo)";
}

/**
 * Adapte le résultat JSON V2 du backend au modèle « Railway legacy » consommé par l'UI rapport.
 */
export function buildLegacyReportFromV2(result: V2AnalysisResult): AttentiqReport {
  const rawScore01 = Number(result.diagnostic.score);
  const explanation = result.diagnostic.explanation || "";
  const label = (result.diagnostic.label || "").trim();

  const score01 = reconcileDiagnosticScore01(
    Number.isFinite(rawScore01) ? rawScore01 : 0.5,
    explanation,
    label.toLowerCase()
  );

  const rawOn10 = Math.max(
    0,
    Math.min(10, Number((score01 * 10).toFixed(1)))
  );
  const retentionScore =
    clampRetentionScoreForDisplay(rawOn10) ?? rawOn10;

  const actions = result.actions
    .map((action) => action.label?.trim())
    .filter((l): l is string => Boolean(l));

  const contentKind = inferContentKind(result);
  const attentionDrops = mapV2AttentionDropsToLegacy(result);

  const metadata: RailwayResponse["metadata"] = {
    url: result.sourceUrl ?? "",
    platform: result.sourcePlatform ?? contentKind,
    author: "@attentiq",
    title: titleForContentKind(contentKind),
    duration_seconds: result.durationSeconds ?? 0,
    hashtags: [],
  };

  const response: RailwayResponse = {
    request_id: result.id,
    status: "success",
    metadata,
    diagnostic: {
      retention_score: retentionScore,
      global_summary: buildGlobalSummary(explanation, result.actions),
      drop_off_rule: dropOffLine(label),
      creator_perception: buildCreatorPerception(result.dashboard),
      audience_loss_estimate:
        contentKind === "video"
          ? buildAudienceLossEstimate(retentionScore)
          : contentKind === "text"
            ? `Sans analytics natives : le score ${retentionScore.toFixed(
                1
              )}/${RETENTION_SCORE_DISPLAY_MAX} mesure surtout clarté, densité et intention d'action (clic/like/commentaire), pas la performance réelle.`
            : `Sans analytics natives : le score ${retentionScore.toFixed(
                1
              )}/${RETENTION_SCORE_DISPLAY_MAX} mesure surtout lisibilité visuelle, hiérarchie et clarté du message, pas la performance réelle.`,
      corrective_actions: actions.slice(0, 3),
      attention_drops: attentionDrops,
    },
  };

  return {
    text: buildGlobalSummary(explanation, result.actions),
    data: response,
    partial: false,
  };
}
