/**
 * Attentiq — Railway Integration Worker
 *
 * Handles:
 *  1. Outbound HTTP POST to Railway /analyze
 *  2. JSON response parsing & typed models
 *  3. Attentiq report formatting
 *  4. Full error & status handling
 */

// Uses built-in crypto.randomUUID() — no external dependency needed

import { detectVideoPlatformFromUrl } from "@/lib/url-intake";

// ─── Outbound request ──────────────────────────────────────────────────────

export interface AnalyzeRequest {
  request_id: string;
  url: string;
  platform: string;
  max_duration_seconds: number;
  requested_at: string;
}

// ─── Railway response models ───────────────────────────────────────────────

export interface VideoMetadata {
  url: string;
  platform: string;
  author: string;
  title: string;
  duration_seconds: number;
  hashtags: string[];
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface VisualSignal {
  timestamp_seconds: number;
  face_expression: string;
  body_position: string;
  on_screen_text: string;
  motion_level: number;
  scene_change: boolean;
}

export interface AttentionDrop {
  timestamp_seconds: number;
  severity: "low" | "medium" | "high" | "critical";
  cause: string;
}

export type AnalysisMode = "video" | "audio_only";

export interface Diagnostic {
  retention_score: number;
  global_summary: string;
  drop_off_rule: string;
  creator_perception: string;
  mode?: AnalysisMode | null;
  warning?: string | null;
  attention_drops?: AttentionDrop[] | null;
  audience_loss_estimate: string;
  corrective_actions: string[];
}

export type AnalysisStatus = "success" | "partial" | "error";

export interface RailwayResponse {
  request_id: string;
  status: AnalysisStatus;
  error_code?: string;
  error_message?: string;
  metadata?: VideoMetadata;
  transcript?: TranscriptSegment[];
  visual_signals?: VisualSignal[];
  diagnostic?: Diagnostic;
}

// ─── Formatted report ─────────────────────────────────────────────────────

export interface AttentiqReport {
  /** The fully formatted text report ready for delivery. */
  text: string;
  /** Structured data for UI rendering. */
  data: RailwayResponse;
  /** Whether the report is a full or partial result. */
  partial: boolean;
}

// ─── Error types ──────────────────────────────────────────────────────────

export class RailwayError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly userMessage: string
  ) {
    super(message);
    this.name = "RailwayError";
  }
}

export class TimeoutError extends Error {
  constructor() {
    super("Railway request timed out after 120s");
    this.name = "TimeoutError";
  }
}

// ─── Railway HTTP worker ───────────────────────────────────────────────────

/**
 * Sends a POST /analyze request to the Railway backend and returns the
 * parsed response. Throws RailwayError or TimeoutError on failure.
 *
 * @param videoUrl  Public URL of the video to analyse
 * @param options   Optional overrides (max_duration_seconds)
 */
export async function callRailwayAnalyze(
  videoUrl: string,
  options: { max_duration_seconds?: number } = {}
): Promise<RailwayResponse> {
  const baseUrl = process.env.RAILWAY_BASE_URL;
  if (!baseUrl) {
    throw new RailwayError(
      "MISSING_CONFIG",
      "RAILWAY_BASE_URL env var is not set",
      "Service temporairement indisponible. Réessayez dans quelques instants."
    );
  }

  const apiKey = process.env.RAILWAY_API_KEY;
  const payload: AnalyzeRequest = {
    request_id: crypto.randomUUID(),
    url: videoUrl,
    platform: detectVideoPlatformFromUrl(videoUrl),
    max_duration_seconds: options.max_duration_seconds ?? 60,
    requested_at: new Date().toISOString(),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new TimeoutError();
    }
    throw new RailwayError(
      "NETWORK_ERROR",
      `Network error: ${err instanceof Error ? err.message : String(err)}`,
      "Impossible de joindre le service d'analyse. Vérifiez votre connexion."
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new RailwayError(
      `HTTP_${response.status}`,
      `Railway returned ${response.status}`,
      `Erreur du service d'analyse (${response.status}). Réessayez dans quelques instants.`
    );
  }

  const data: RailwayResponse = await response.json();
  return data;
}

// ─── Error → user message ─────────────────────────────────────────────────

function resolveErrorMessage(data: RailwayResponse): string {
  const code = data.error_code ?? "";
  const rawError = (data.error_message ?? "").toLowerCase();
  if (code === "VIDEO_UNAVAILABLE") {
    return "Vidéo inaccessible ou supprimée. Vérifiez l'URL.";
  }
  if (code === "DURATION_EXCEEDED") {
    const dur = data.metadata?.duration_seconds;
    const durStr = dur != null ? `${dur}s` : "inconnue";
    return `Vidéo trop longue (${durStr}). Maximum : 60 secondes.`;
  }
  if (
    rawError.includes("[instagram]") &&
    (rawError.includes("login required") ||
      rawError.includes("rate-limit") ||
      rawError.includes("rate limit reached") ||
      rawError.includes("requested content is not available"))
  ) {
    return "Certaines plateformes bloquent parfois le media via URL. Pas d'inquietude: testez en upload, le resultat sera souvent meilleur.";
  }
  return (
    data.error_message ??
    "Une erreur est survenue lors de l'analyse. Réessayez."
  );
}

// ─── Report formatter ─────────────────────────────────────────────────────

/**
 * Builds the final Attentiq retention-diagnostic report from a Railway
 * response. Never uses pre-filled templates — all values come from `data`.
 */
export function formatAttentiqReport(data: RailwayResponse): AttentiqReport {
  // ── Error status ──────────────────────────────────────────────────────
  if (data.status === "error") {
    const msg = resolveErrorMessage(data);
    return {
      text: msg,
      data,
      partial: false,
    };
  }

  const d = data.diagnostic!;
  const m = data.metadata!;
  const drops = d.attention_drops ?? [];
  const actions = d.corrective_actions ?? [];
  const score = d.retention_score?.toFixed(1) ?? "N/A";
  const audioOnlyWarning =
    d.warning?.trim() ||
    "Analyse audio uniquement — signaux visuels indisponibles";
  const isAudioOnly = d.mode === "audio_only";

  // ── Drop-off section ──────────────────────────────────────────────────
  const dropsText =
    isAudioOnly
      ? `  ${audioOnlyWarning}\n`
      : drops.length === 0
      ? "  Aucune chute significative détectée.\n"
      : drops
          .map(
            (drop) =>
              `• ${drop.timestamp_seconds}s — Sévérité : ${drop.severity}\n  Cause : ${drop.cause}`
          )
          .join("\n");

  // ── Corrective actions ────────────────────────────────────────────────
  const actionsText =
    actions.length === 0
      ? "  Aucune recommandation disponible.\n"
      : actions.map((a, i) => `${i + 1}. ${a}`).join("\n");

  // ── Partial notice ────────────────────────────────────────────────────
  const partialNotice =
    data.status === "partial"
      ? "\n⚠️  Analyse partielle — données visuelles indisponibles\n"
      : "";

  const text = [
    "═══════════════════════════════════════",
    "ATTENTIQ — DIAGNOSTIC DE RÉTENTION",
    `${m.author} · ${m.duration_seconds}s · Score : ${score}/10`,
    "═══════════════════════════════════════",
    "",
    "📊 ÉVALUATION GLOBALE",
    d.global_summary,
    "",
    "⚡ RÈGLE DE DÉCROCHAGE",
    d.drop_off_rule,
    "",
    "👁 PERCEPTION DU CRÉATEUR",
    d.creator_perception,
    "",
    "📉 POINTS DE CHUTE D'ATTENTION",
    dropsText,
    "",
    "💸 ATTENTION PERDUE",
    d.audience_loss_estimate,
    "",
    "✅ ACTIONS CORRECTIVES (prochaines vidéos)",
    actionsText,
    partialNotice,
  ].join("\n");

  return {
    text,
    data,
    partial: data.status === "partial",
  };
}

// ─── High-level entry point ────────────────────────────────────────────────

/**
 * Full pipeline: call Railway, parse response, format report.
 * Returns a structured AttentiqReport or throws a typed error.
 */
export async function analyzeVideo(
  videoUrl: string,
  options: { max_duration_seconds?: number } = {}
): Promise<AttentiqReport> {
  const railwayData = await callRailwayAnalyze(videoUrl, options);
  return formatAttentiqReport(railwayData);
}

// ─── Mock for local development ────────────────────────────────────────────

/**
 * Réponse fictive pour démo locale / absence de backend (UI, chat, route analyze mock).
 */
export function mockAttentiqDemoAnalyzeResponse(): RailwayResponse {
  return {
    request_id: "mock-attentiq-demo-001",
    status: "success",
    metadata: {
      url: "https://www.tiktok.com/@attentiq_demo/video/7380000000000000000",
      platform: "tiktok",
      author: "@attentiq_demo",
      title: "Comment doubler ses ventes en 30 jours sans publicité",
      duration_seconds: 47,
      hashtags: ["#sales", "#entrepreneur", "#tiktokbusiness"],
    },
    transcript: [
      { start: 0, end: 4, text: "Vous voulez doubler vos ventes ce mois-ci ?" },
      {
        start: 4,
        end: 11,
        text: "La plupart des créateurs font cette erreur fatale...",
      },
      {
        start: 11,
        end: 23,
        text: "Ils parlent de leur produit, pas du problème de leur audience.",
      },
      {
        start: 23,
        end: 35,
        text: "Voici la méthode exacte que j'utilise pour mes clients.",
      },
      {
        start: 35,
        end: 47,
        text: "Sauvegardez cette vidéo, vous en aurez besoin.",
      },
    ],
    visual_signals: [
      {
        timestamp_seconds: 0,
        face_expression: "direct_eye_contact",
        body_position: "centered_close_up",
        on_screen_text: "Doublez vos ventes",
        motion_level: 0.3,
        scene_change: false,
      },
      {
        timestamp_seconds: 11,
        face_expression: "neutral",
        body_position: "slight_lean_back",
        on_screen_text: "",
        motion_level: 0.1,
        scene_change: false,
      },
      {
        timestamp_seconds: 23,
        face_expression: "engaged",
        body_position: "forward_lean",
        on_screen_text: "La méthode",
        motion_level: 0.5,
        scene_change: true,
      },
    ],
    diagnostic: {
      retention_score: 6.4,
      global_summary:
        "La vidéo ouvre fort avec une promesse claire mais perd 38% de l'audience avant la démonstration concrète. Le hook verbal est solide ; le problème vient du manque de tension narrative entre la 4e et la 23e seconde.",
      drop_off_rule:
        "Toute vidéo qui tarde plus de 8 secondes à montrer une preuve concrète perd plus de 30% de ses spectateurs avant la moitié.",
      creator_perception:
        "Perçue comme experte et directe dans les 4 premières secondes, puis comme trop théorique entre 11s et 23s. Le retour à la valeur concrète à 23s stabilise la rétention mais ne récupère pas les décrochages précédents.",
      attention_drops: [
        {
          timestamp_seconds: 4,
          severity: "medium",
          cause:
            "La promesse reste abstraite — pas encore de preuve ou de gain tangible visible.",
        },
        {
          timestamp_seconds: 11,
          severity: "high",
          cause:
            "Rythme verbal plat, aucun changement de cadre, tension narrative inexistante.",
        },
        {
          timestamp_seconds: 23,
          severity: "medium",
          cause:
            "Démonstration tardive — le spectateur attend une preuve depuis 19 secondes.",
        },
      ],
      audience_loss_estimate:
        "38% de perte cumulée avant la démonstration clé (23s). Sur 10 000 vues, ~3 800 spectateurs ont quitté avant de voir la méthode.",
      corrective_actions: [
        "Placer une preuve concrète (chiffre, résultat client, capture d'écran) dans les 4 premières secondes.",
        "Alterner rythme/cadre toutes les 5-7 secondes pour maintenir l'attention prédictive.",
        "Utiliser un re-hook à 10-12s : une question ou affirmation qui force le cerveau à rester pour la réponse.",
      ],
    },
  };
}
