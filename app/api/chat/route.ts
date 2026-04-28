import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  buildOfflineChatReply,
  type ChatDiagnosticContext,
  type ChatTurn,
} from "@/lib/chat-context";

export const runtime = "nodejs";

type ChatRequestBody = {
  message?: unknown;
  history?: unknown;
  diagnostic?: unknown;
};

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
const GROQ_CHAT_MODEL =
  process.env.GROQ_CHAT_MODEL?.trim() || "llama-3.3-70b-versatile";
const MAX_HISTORY_ITEMS = 8;

const SYSTEM_APPENDIX = (process.env.ATTENTIQ_CHAT_SYSTEM_APPENDIX ?? "").trim();

const SYSTEM_PROMPT = `
Tu es l'assistant post-diagnostic Attentiq : même exigence qu'un consultant senior (vidéo courte, texte ou image — selon le rapport fourni).

Objectif fidélisation : le créateur doit repartir avec une prochaine étape claire sur CE média, et l'envie de refaire une analyse sur un autre contenu plus tard — sans flatterie ni promesse de vues.

Règles obligatoires :
- Réponds en français, 5 à 7 lignes maximum ; chaque ligne = une idée exploitable (pas de remplissage).
- Uniquement à partir du diagnostic fourni ; tu ne refais jamais une analyse ni n'inventes de timestamps ou scores absents du rapport.
- Si une information manque dans le diagnostic, dis-le en une courte phrase — ne complète pas par supposition.
- Ne signale un manque d'information QUE s'il bloque réellement la réponse à la question posée.
- N'évoque jamais l'absence d'historique, de contexte ou de sections non demandées si la question peut être traitée avec le diagnostic présent.
- Vidéo : relie hook, rythme, mouvements/cadrage/montage, musique, texte à l'écran, chutes d'attention et intention de suite (si le rapport en parle) aux éléments explicitement présents.
- Si la vidéo est intentionnellement sans voix et/ou sans visage, ne traite pas cela comme un défaut automatique : juge la performance sur les signaux réellement présents (images, rythme visuel, transitions, texte, musique, sound design).
- Texte / image : relie hiérarchie, promesse, friction de lecture ou de regard aux éléments du rapport.
- Actions concrètes et ordonnables (quoi ajuster, où dans le contenu), jamais de listes de platitudes (« sois authentique », « reste naturel »).
- Interdit : jargon marketing, promesses de résultats, viralité garantie.
- Hors périmètre (autre URL, autre fichier, avis médical/légal/financier) : refus poli en 2 lignes max.
- Ton : calme, précis, chirurgical, respectueux de l'intelligence du créateur.
${SYSTEM_APPENDIX ? `\nConsignes additionnelles (prioritaires si conflit avec des généralités ci-dessus) :\n${SYSTEM_APPENDIX}\n` : ""}
`.trim();

function isChatTurn(value: unknown): value is ChatTurn {
  return (
    value !== null &&
    typeof value === "object" &&
    "role" in value &&
    "content" in value &&
    (value as { role: string }).role !== undefined &&
    (value as { content: string }).content !== undefined &&
    ((value as { role: string }).role === "user" ||
      (value as { role: string }).role === "assistant") &&
    typeof (value as { content: string }).content === "string"
  );
}

function isChatDiagnosticContext(
  value: unknown
): value is ChatDiagnosticContext {
  return (
    value !== null &&
    typeof value === "object" &&
    "requestId" in value &&
    "status" in value &&
    "partial" in value &&
    "reportText" in value
  );
}

function sanitizeHistory(history: unknown): ChatTurn[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(isChatTurn)
    .map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-MAX_HISTORY_ITEMS);
}

function buildModelInput(
  message: string,
  history: ChatTurn[],
  diagnostic: ChatDiagnosticContext
): string {
  const historyText =
    history.length > 0
      ? history
          .map(
            (turn) =>
              `${turn.role === "assistant" ? "Assistant" : "Utilisateur"}: ${turn.content}`
          )
          .join("\n")
      : "Aucun historique.";

  const serializedDiagnostic = JSON.stringify(diagnostic, null, 2);

  return [
    "DIAGNOSTIC DE SESSION",
    serializedDiagnostic,
    "",
    "HISTORIQUE RÉCENT",
    historyText,
    "",
    "QUESTION ACTUELLE",
    `Utilisateur: ${message}`,
    "",
    "Réponds maintenant en respectant strictement les règles.",
  ].join("\n");
}

/** Groq a une fenêtre de contexte plus petite : évite d'envoyer tout le rapport texte brut. */
function buildGroqModelInput(
  message: string,
  history: ChatTurn[],
  diagnostic: ChatDiagnosticContext
): string {
  const maxReportChars = 12_000;
  const maxTranscriptSegments = 40;
  const reportText =
    diagnostic.reportText.length > maxReportChars
      ? `${diagnostic.reportText.slice(0, maxReportChars)}\n[... rapport tronqué (limite de contexte) ...]`
      : diagnostic.reportText;
  const transcript = (diagnostic.transcript ?? []).slice(0, maxTranscriptSegments);
  const slim = {
    requestId: diagnostic.requestId,
    status: diagnostic.status,
    partial: diagnostic.partial,
    metadata: diagnostic.metadata,
    diagnostic: diagnostic.diagnostic,
    transcript,
    reportText,
  };
  const historyText =
    history.length > 0
      ? history
          .map(
            (turn) =>
              `${turn.role === "assistant" ? "Assistant" : "Utilisateur"}: ${turn.content}`
          )
          .join("\n")
      : "Aucun historique.";

  return [
    "DIAGNOSTIC DE SESSION (extrait pour le chat)",
    JSON.stringify(slim, null, 2),
    "",
    "HISTORIQUE RÉCENT",
    historyText,
    "",
    "QUESTION ACTUELLE",
    `Utilisateur: ${message}`,
    "",
    "Réponds maintenant en respectant strictement les règles.",
  ].join("\n");
}

function extractResponseText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as {
    output_text?: unknown;
    output?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };

  if (typeof record.output_text === "string" && record.output_text.trim()) {
    return record.output_text.trim();
  }

  const chunks =
    record.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text" && typeof item.text === "string")
      .map((item) => item.text?.trim())
      .filter((item): item is string => Boolean(item)) ?? [];

  return chunks.length > 0 ? chunks.join("\n").trim() : null;
}

async function tryGroqChat(
  message: string,
  history: ChatTurn[],
  diagnostic: ChatDiagnosticContext
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: GROQ_CHAT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: buildGroqModelInput(message, history, diagnostic),
        },
      ],
      max_tokens: 400,
      temperature: 0.35,
    });
    const text = completion.choices[0]?.message?.content?.trim();
    return text || null;
  } catch (error) {
    console.error("[chat] groq error", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", userMessage: "Requête chat invalide." },
      { status: 400 }
    );
  }

  const message =
    typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return NextResponse.json(
      { error: "MISSING_MESSAGE", userMessage: "Ajoutez une question." },
      { status: 400 }
    );
  }

  if (!isChatDiagnosticContext(body.diagnostic)) {
    return NextResponse.json(
      {
        error: "MISSING_DIAGNOSTIC",
        userMessage:
          "Le diagnostic de session est manquant. Revenez depuis votre rapport.",
      },
      { status: 400 }
    );
  }

  const history = sanitizeHistory(body.history);
  const fallbackReply = buildOfflineChatReply(message, body.diagnostic);
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  /** Groq d'abord (coût / latence) ; OpenAI en secours si Groq indisponible ou restreint. */
  const groqReply = await tryGroqChat(message, history, body.diagnostic);
  if (groqReply) {
    return NextResponse.json({
      reply: groqReply,
      provider: "groq",
      model: GROQ_CHAT_MODEL,
    });
  }

  if (openaiKey) {
    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          store: false,
          instructions: SYSTEM_PROMPT,
          input: buildModelInput(message, history, body.diagnostic),
          max_output_tokens: 320,
        }),
      });

      const payload = (await response.json().catch(() => null)) as unknown;

      if (response.ok) {
        const reply = extractResponseText(payload);
        if (reply) {
          return NextResponse.json({
            reply,
            provider: "openai",
            model: OPENAI_MODEL,
          });
        }
      } else {
        console.error("[chat] openai error", payload);
      }
    } catch (error) {
      console.error("[chat] openai unexpected error", error);
    }
  }

  return NextResponse.json({
    reply: fallbackReply,
    provider: "fallback",
  });
}
