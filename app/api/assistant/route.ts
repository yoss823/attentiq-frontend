import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';
export const maxDuration = 25;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const intentMap: Record<string, string> = {
  clarify: "Clarifie le point principal de ce diagnostic en 5 lignes max.",
  explain: "Explique pourquoi l'attention chute à ces moments précis selon ce diagnostic.",
  expand: "Développe les recommandations principales avec des exemples concrets.",
  prioritize: "Priorise les 3 actions les plus importantes et explique pourquoi.",
};

export async function POST(req: NextRequest) {
  try {
    const { intent, context, user_input } = await req.json();

    if (!context) {
      return NextResponse.json({ response: 'Aucun diagnostic disponible.', intent_used: intent, refused: false });
    }

    const systemPrompt = `Tu es l'assistant Attentiq. Tu réponds UNIQUEMENT à partir du diagnostic de rétention fourni ci-dessous.
Règles strictes :
- Réponses 5 à 7 lignes maximum
- Orientées action uniquement
- Toujours partir du diagnostic fourni — jamais de généralités
- Zéro jargon marketing, zéro promesses garanties
- Si la question sort du périmètre, refuser poliment
DIAGNOSTIC :
${context}`;

    const userMessage = user_input?.trim() || intentMap[intent] || "Explique ce diagnostic.";

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content || 'Désolé, je ne peux pas répondre pour l\'instant.';

    return NextResponse.json({ response, intent_used: intent, refused: false });
  } catch (error) {
    console.error('Assistant error:', error);
    return NextResponse.json(
      { response: 'L\'assistant est temporairement indisponible. Réessayez dans un instant.', intent_used: 'error', refused: false },
      { status: 200 }
    );
  }
}
