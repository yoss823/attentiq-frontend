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
  process.env.GROQ_CHAT_MODEL?.trim() || "llama-3.1-8b-instant";
const MAX_HISTORY_ITEMS = 8;

const SYSTEM_PROMPT = `
Tu es l'assistant post-diagnostic RetentionScan d'Attentiq.

Règles obligatoires :
- Réponds en français.
- Réponds en 5 à 7 lignes maximum.
- Réponds uniquement à partir du diagnostic fourni.
- Tu n'effectues jamais une nouvelle analyse.
- Si une information n'est pas dans le diagnostic, dis-le clairement.
- Réponds avec des actions concrètes et immédiates, jamais avec des généralités.
- N'utilise jamais de jargon marketing.
- Ne fais jamais de promesse garantie.
- Refuse poliment toute demande hors périmètre, notamment l'analyse d'une autre vidéo.
- Ton : calme, consultant, non infantilisant.
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
      ? `${diagnostic.reportText.slice(0, maxReportChars)}\n[... rapport tronque pour limite de contexte ...]`
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

  const groqReply = await tryGroqChat(message, history, body.diagnostic);
  if (groqReply) {
    return NextResponse.json({
      reply: groqReply,
      provider: "groq",
      model: GROQ_CHAT_MODEL,
    });
  }

  return NextResponse.json({
    reply: fallbackReply,
    provider: "fallback",
  });
}
