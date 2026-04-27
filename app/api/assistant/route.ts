import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';
export const maxDuration = 25;

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
const GROQ_ASSISTANT_MODEL =
  process.env.GROQ_CHAT_MODEL?.trim() || 'llama-3.1-8b-instant';
const OPENAI_ASSISTANT_MODEL =
  process.env.OPENAI_ASSISTANT_MODEL?.trim() ||
  process.env.OPENAI_CHAT_MODEL?.trim() ||
  'gpt-4o-mini';

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  return new Groq({ apiKey });
}

const intentMap: Record<string, string> = {
  clarify: 'Clarifie le point principal de ce diagnostic en 5 lignes max.',
  explain: "Explique pourquoi l'attention chute à ces moments précis selon ce diagnostic.",
  expand: 'Développe les recommandations principales avec des exemples concrets.',
  prioritize: 'Priorise les 3 actions les plus importantes et explique pourquoi.',
};

async function tryOpenAiAssistant(
  systemPrompt: string,
  userMessage: string
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  try {
    const res = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_ASSISTANT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 300,
        temperature: 0.35,
      }),
    });
    const data = (await res.json().catch(() => null)) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    if (!res.ok) {
      console.error('[assistant] openai error', data);
      return null;
    }
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (e) {
    console.error('[assistant] openai unexpected', e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { intent, context, user_input } = await req.json();

    if (!context) {
      return NextResponse.json({
        response: 'Aucun diagnostic disponible.',
        intent_used: intent,
        refused: false,
      });
    }

    const systemPrompt = `Tu es l'assistant Attentiq. Tu réponds UNIQUEMENT à partir du diagnostic de rétention fourni ci-dessous.
Règles strictes :
- Réponses 5 à 7 lignes maximum
- Orientées action uniquement
- Toujours partir du diagnostic fourni — jamais de généralités
- Si le contexte est une vidéo courte, ancre-toi sur hook, rythme, chutes d'attention et CTA du diagnostic
- Zéro jargon marketing, zéro promesses garanties
- Si la question sort du périmètre, refuser poliment
DIAGNOSTIC :
${context}`;

    const userMessage =
      user_input?.trim() || intentMap[intent] || 'Explique ce diagnostic.';

    let responseText: string | null = null;

    const groq = getGroqClient();
    if (groq) {
      try {
        const completion = await groq.chat.completions.create({
          model: GROQ_ASSISTANT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 300,
        });
        responseText =
          completion.choices[0]?.message?.content?.trim() || null;
      } catch (e) {
        console.error('[assistant] groq error', e);
      }
    }

    if (!responseText) {
      responseText = await tryOpenAiAssistant(systemPrompt, userMessage);
    }

    if (!responseText) {
      const hasAny =
        Boolean(process.env.GROQ_API_KEY?.trim()) ||
        Boolean(process.env.OPENAI_API_KEY?.trim());
      if (!hasAny) {
        return NextResponse.json({
          response:
            "L'assistant est temporairement indisponible (configuration manquante).",
          intent_used: 'config_missing',
          refused: false,
        });
      }
      return NextResponse.json({
        response:
          "L'assistant est temporairement indisponible. Réessayez dans un instant.",
        intent_used: 'error',
        refused: false,
      });
    }

    return NextResponse.json({
      response: responseText,
      intent_used: intent,
      refused: false,
    });
  } catch (error) {
    console.error('Assistant error:', error);
    return NextResponse.json(
      {
        response:
          "L'assistant est temporairement indisponible. Réessayez dans un instant.",
        intent_used: 'error',
        refused: false,
      },
      { status: 200 }
    );
  }
}
