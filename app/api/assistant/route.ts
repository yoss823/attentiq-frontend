import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const intentMap: Record<string, string> = {
  clarify: 'Clarifie le point principal du diagnostic en une réponse courte et directe.',
  explain: 'Explique pourquoi l\'attention chute selon ce diagnostic. Sois précis et concret.',
  expand: 'Développe les recommandations principales avec des exemples pratiques.',
  prioritize: 'Priorise les 3 actions les plus importantes et explique pourquoi.',
};

export async function POST(req: NextRequest) {
  try {
    const { intent, context, user_input } = await req.json();

    if (!context) {
      return NextResponse.json(
        { response: 'Aucun diagnostic en contexte.', intent_used: intent, refused: false },
        { status: 400 }
      );
    }

    const systemPrompt = `Tu es l'assistant Attentiq. Tu réponds UNIQUEMENT à partir du diagnostic de rétention fourni ci-dessous.

Règles strictes :
- Réponses 5 à 7 lignes maximum
- Orientées action uniquement
- Toujours partir du diagnostic fourni — jamais de généralités
- Zéro jargon marketing, zéro promesses garanties
- Refuser poliment les questions hors périmètre (ex: "écris-moi un poème", "analyse une autre vidéo")
- Ton : calme, consultant, non infantilisant

DIAGNOSTIC :
${context}`;

    const userMessage =
      user_input?.trim() ||
      intentMap[intent] ||
      'Explique ce diagnostic.';

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 350,
      temperature: 0.4,
    });

    const response =
      completion.choices[0]?.message?.content ||
      'Désolé, je ne peux pas répondre pour l\'instant.';

    return NextResponse.json({
      response,
      intent_used: intent,
      refused: false,
    });
  } catch (err) {
    console.error('[assistant] error:', err);
    return NextResponse.json(
      {
        response: 'Erreur lors de la génération de la réponse. Réessaie.',
        intent_used: 'error',
        refused: false,
      },
      { status: 500 }
    );
  }
}
