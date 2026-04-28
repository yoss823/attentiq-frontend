import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';
export const maxDuration = 25;

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
const GROQ_ASSISTANT_MODEL =
  process.env.GROQ_CHAT_MODEL?.trim() || 'llama-3.3-70b-versatile';
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
  clarify:
    "Synthétise en 5 lignes max : levier principal, score, ce qui tient déjà — sans répéter le JSON ; fais sentir ce que le complet apporte sans mentir sur ce qui manque.",
  explain:
    "Explique pourquoi l'attention chute aux timestamps ou étapes cités ; relie parole, image, texte à l'écran et rythme quand c'est dans le rapport (pas seulement CTA).",
  expand:
    "Transforme les actions présentes dans le diagnostic en micro-plan (quoi changer, où, en une phrase) — exemples ancrés dans ce contenu ; ne crée pas d'action supplémentaire.",
  prioritize:
    "Classe exactement les 3 actions du diagnostic par impact/effort (1 = à faire en premier) ; une phrase de justification chacune, tirée du rapport ; n'ajoute pas de 4e action.",
};

function extractActionLabelsFromContext(context: string): string[] {
  try {
    const parsed = JSON.parse(context) as {
      actions?: Array<{ label?: string } | string>;
      diagnostic?: { corrective_actions?: string[] };
    };
    const fromActions = Array.isArray(parsed.actions)
      ? parsed.actions
          .map((a) =>
            typeof a === 'string'
              ? a.trim()
              : typeof a?.label === 'string'
                ? a.label.trim()
                : ''
          )
          .filter(Boolean)
      : [];
    const fromCorrective = Array.isArray(parsed.diagnostic?.corrective_actions)
      ? parsed.diagnostic!.corrective_actions
          .map((a) => (typeof a === 'string' ? a.trim() : ''))
          .filter(Boolean)
      : [];
    return (fromActions.length > 0 ? fromActions : fromCorrective).slice(0, 3);
  } catch {
    return [];
  }
}

function enforceIntentResponseShape(
  intent: string,
  context: string,
  llmText: string
): string {
  const actions = extractActionLabelsFromContext(context);
  if (actions.length === 0) {
    return llmText;
  }

  if (intent === 'prioritize') {
    return actions
      .slice(0, 3)
      .map((action, idx) => `${idx + 1}. ${action}`)
      .join('\n');
  }

  if (intent === 'expand') {
    return actions
      .slice(0, 3)
      .map(
        (action, idx) =>
          `${idx + 1}. ${action} — exécution: appliquez cette correction précisément au passage concerné du diagnostic.`
      )
      .join('\n');
  }

  return llmText;
}

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
        max_tokens: 420,
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

    const appendix = (process.env.ATTENTIQ_ASSISTANT_APPENDIX ?? '').trim();

    const systemPrompt = `Tu es l'assistant Attentiq : expert en attention pour formats courts, ton calme et chirurgical.
Tu réponds UNIQUEMENT à partir du diagnostic ci-dessous (chiffres, labels, chutes d'attention, actions).
Règles strictes :
- 5 à 7 lignes maximum ; chaque ligne doit apporter une décision ou une lecture nette du rapport.
- Zéro généralité (« sois authentique », « améliore le hook » sans lien au diagnostic) ; cite implicitement ce que dit déjà le rapport (sans inventer de timestamps absents).
- Vidéo / texte / image : relie hook, rythme ou hiérarchie, chutes d'attention, parcours du regard — intention de suite seulement si le diagnostic en parle.
- Zéro jargon marketing, zéro promesse de vues ou de viralité ; si l'info manque dans le diagnostic, dis-le en une courte phrase.
- Ne crée jamais d'actions, de timestamps, d'exemples ou de priorités absents du diagnostic.
- Si l'intent est "prioritize" : retourne exactement 3 priorités (1, 2, 3), pas plus.
- Si l'intent est "expand" : développe uniquement les actions déjà présentes dans le diagnostic.
- Fidélisation : n'évoque une prochaine analyse que si l'utilisateur le demande explicitement.
- Hors périmètre (autre URL, autre contenu, avis médical/légal) : refus poli en 2 lignes.
${appendix ? `Consignes additionnelles :\n${appendix}\n` : ''}
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
          max_tokens: 420,
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

    const safeResponse = enforceIntentResponseShape(intent, String(context), responseText);

    return NextResponse.json({
      response: safeResponse,
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
