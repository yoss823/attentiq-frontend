import {
  formatAttentiqReport,
  mockSalesWithEvaResponse,
  type AttentiqReport,
  type Diagnostic,
  type TranscriptSegment,
  type VideoMetadata,
} from "@/lib/railway-client";

export const CHAT_SESSION_STORAGE_KEY = "attentiq.chat.diagnostic.v1";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatDiagnosticContext {
  requestId: string;
  status: "success" | "partial" | "error";
  partial: boolean;
  metadata: VideoMetadata | null;
  diagnostic: Diagnostic | null;
  transcript: TranscriptSegment[];
  reportText: string;
}

export function buildChatDiagnosticContext(
  report: AttentiqReport
): ChatDiagnosticContext {
  return {
    requestId: report.data.request_id,
    status: report.data.status,
    partial: report.partial,
    metadata: report.data.metadata ?? null,
    diagnostic: report.data.diagnostic ?? null,
    transcript: report.data.transcript ?? [],
    reportText: report.text,
  };
}

export function getDemoChatDiagnosticContext(): ChatDiagnosticContext {
  return buildChatDiagnosticContext(
    formatAttentiqReport(mockSalesWithEvaResponse())
  );
}

export function getPrimaryIssue(context: ChatDiagnosticContext): string {
  const diagnostic = context.diagnostic;

  return (
    diagnostic?.attention_drops?.[0]?.cause?.trim() ||
    diagnostic?.drop_off_rule?.trim() ||
    diagnostic?.global_summary?.trim() ||
    "Le diagnostic ne contient pas encore de problème principal exploitable."
  );
}

export function getScoreLabel(score: number | null | undefined): string {
  if (score == null) return "Score indisponible";
  if (score >= 7) return "Solide";
  if (score >= 5) return "À reprendre";
  return "Urgent";
}

export function buildWelcomeMessage(
  context: ChatDiagnosticContext
): string {
  const diagnostic = context.diagnostic;
  const score = diagnostic?.retention_score;
  const action = diagnostic?.corrective_actions?.[0];

  const lines = [
    "J'ai votre diagnostic actuel en contexte.",
    `Le point le plus sensible relevé ici est : ${getPrimaryIssue(context)}`,
    score != null
      ? `Votre score de rétention est ${score.toFixed(1)}/10, donc la priorité est d'agir avant d'élargir le plan.`
      : "Je vais rester strictement sur ce qui est présent dans le rapport.",
    action
      ? `Première action déjà visible dans le rapport : ${action}`
      : "Posez votre question et je vous répondrai uniquement à partir du rapport.",
  ];

  return lines.join("\n");
}

function firstTranscriptLine(transcript: TranscriptSegment[]): string | null {
  const line = transcript[0]?.text?.trim();
  return line ? line.replace(/\s+/g, " ") : null;
}

function formatLines(lines: Array<string | null | undefined>): string {
  return lines
    .filter((line): line is string => Boolean(line && line.trim()))
    .slice(0, 6)
    .join("\n");
}

export function buildOfflineChatReply(
  question: string,
  context: ChatDiagnosticContext
): string {
  const q = question.toLowerCase();
  const diagnostic = context.diagnostic;
  const metadata = context.metadata;
  const firstDrop = diagnostic?.attention_drops?.[0];
  const secondDrop = diagnostic?.attention_drops?.[1];
  const actions = diagnostic?.corrective_actions ?? [];
  const intro = firstTranscriptLine(context.transcript);
  const score = diagnostic?.retention_score;
  const scoreLabel = getScoreLabel(score);

  if (!diagnostic) {
    return formatLines([
      "Je peux seulement répondre à partir du diagnostic actuel.",
      "Or le diagnostic n'est pas disponible dans cette session.",
      "Revenez depuis votre rapport ou relancez une analyse pour charger le bon contexte.",
    ]);
  }

  if (
    /autre vid[eé]o|autre rapport|nouvelle analyse|analyse cette|analyser cette|regarde cette/i.test(
      q
    )
  ) {
    return formatLines([
      "Je suis limité à votre diagnostic actuel.",
      "Je ne peux pas analyser une autre vidéo ni produire un nouveau diagnostic ici.",
      "Si vous voulez repartir sur un autre contenu, utilisez plutôt la page d'analyse dédiée.",
    ]);
  }

  if (/plan|3 points|trois points/.test(q)) {
    return formatLines([
      "Voici le plan le plus court à partir du rapport actuel.",
      `1. Corrigez d'abord ${getPrimaryIssue(context).toLowerCase()}.`,
      `2. Appliquez ensuite : ${actions[0] ?? "reprendre la première action listée dans le rapport"}.`,
      `3. Puis testez : ${actions[1] ?? actions[0] ?? "resserrer le script sur le moment de décrochage"}.`,
      "Ne changez pas tout à la fois, sinon vous ne saurez pas ce qui a réellement amélioré la rétention.",
    ]);
  }

  if (/pourquoi|d[ée]croch|si vite|drop/.test(q)) {
    return formatLines([
      firstDrop
        ? `Le décrochage le plus net apparaît vers ${firstDrop.timestamp_seconds}s.`
        : "Le rapport signale surtout une perte d'attention rapide au début.",
      `La cause retenue dans le diagnostic est : ${getPrimaryIssue(context)}`,
      diagnostic.drop_off_rule
        ? `La règle observée est : ${diagnostic.drop_off_rule}`
        : null,
      actions[0]
        ? `Action prioritaire : ${actions[0]}`
        : "La priorité est de corriger ce point avant d'ajouter de nouvelles idées.",
    ]);
  }

  if (/par quoi commencer|commencer|priorit/.test(q)) {
    return formatLines([
      "Commencez par le levier le plus proche du premier décrochage.",
      `Ici, votre priorité est : ${getPrimaryIssue(context)}`,
      actions[0]
        ? `Première correction à exécuter : ${actions[0]}`
        : "Reprenez la première action corrective du rapport.",
      secondDrop
        ? `Ne passez au deuxième sujet qu'après avoir traité la chute relevée vers ${secondDrop.timestamp_seconds}s.`
        : "N'ouvrez pas un deuxième chantier tant que ce premier point n'est pas corrigé.",
    ]);
  }

  if (/grave|normal/.test(q)) {
    return formatLines([
      score != null
        ? `Avec un score de ${score.toFixed(1)}/10, la situation est ${scoreLabel.toLowerCase()}.`
        : "Le rapport ne donne pas de score exploitable, donc je reste sur les symptômes observés.",
      diagnostic.audience_loss_estimate
        ? `Le rapport estime : ${diagnostic.audience_loss_estimate}`
        : null,
      `Le vrai sujet n'est pas d'étiqueter la vidéo, mais de corriger ${getPrimaryIssue(context).toLowerCase()}.`,
      actions[0]
        ? `La bonne prochaine étape est : ${actions[0]}`
        : "La bonne prochaine étape est de reprendre l'action corrective principale du rapport.",
    ]);
  }

  if (/probl[èe]me principal|principal/.test(q)) {
    return formatLines([
      `Votre problème principal, selon le diagnostic, est : ${getPrimaryIssue(context)}`,
      firstDrop
        ? `C'est aussi le premier point de rupture repéré vers ${firstDrop.timestamp_seconds}s.`
        : null,
      diagnostic.global_summary
        ? `Le résumé global va dans le même sens : ${diagnostic.global_summary}`
        : null,
      actions[0]
        ? `Traitez-le d'abord avec : ${actions[0]}`
        : "Traitez-le avant d'optimiser le reste de la vidéo.",
    ]);
  }

  if (/exemple concret|concret|changer/.test(q)) {
    return formatLines([
      "Exemple concret à tester sur la prochaine version :",
      intro
        ? `Votre ouverture actuelle démarre par : "${intro}".`
        : metadata?.title
          ? `Prenez l'ouverture de "${metadata.title}" comme zone à retravailler en priorité.`
          : "Prenez les toutes premières secondes comme zone à retravailler en priorité.",
      firstDrop
        ? `Réécrivez cette entrée pour prévenir la chute observée vers ${firstDrop.timestamp_seconds}s.`
        : "Réécrivez cette entrée pour faire disparaître la première friction mentionnée dans le rapport.",
      actions[0]
        ? `Gardez comme garde-fou cette action : ${actions[0]}`
        : "Gardez le rapport comme garde-fou et ne sortez pas de son périmètre.",
    ]);
  }

  return formatLines([
    "Je reste strictement sur votre diagnostic actuel.",
    `Le point central que je retiens ici est : ${getPrimaryIssue(context)}`,
    diagnostic.global_summary
      ? `Le rapport le résume ainsi : ${diagnostic.global_summary}`
      : null,
    actions[0]
      ? `Si vous voulez avancer vite, commencez par : ${actions[0]}`
      : "Si vous voulez avancer vite, commencez par la première action corrective du rapport.",
    "Si vous voulez, posez ensuite une question plus ciblée sur la priorité, le niveau de gravité ou le plan d'action.",
  ]);
}
