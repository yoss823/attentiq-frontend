// components/BoundedAssistant.tsx
'use client';

import { useState } from 'react';
import { DiagnosticResult, Intent } from '@/types/v2';

interface Props {
  result: DiagnosticResult;
}

const INTENTS: { id: Intent; label: string }[] = [
  { id: 'clarify',              label: '❓ Clarifier' },
  { id: 'explain',              label: '💡 Expliquer' },
  { id: 'expand',               label: '🔍 Approfondir' },
  { id: 'rewrite-within-scope', label: '✏️ Réécrire' },
  { id: 'prioritize',           label: '🎯 Prioriser' },
];

export default function BoundedAssistant({ result }: Props) {
  const [intent, setIntent] = useState<Intent>('clarify');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, question, context: result }),
      });
      const data = await res.json();
      setAnswer(data.answer ?? data.error ?? 'Aucune réponse.');
    } catch {
      setAnswer('Erreur de connexion à l\'assistant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 max-w-2xl mx-auto w-full pb-16">
      <div className="border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 bg-gray-950">
        <h2 className="text-sm uppercase tracking-widest text-gray-500">Assistant — borné au diagnostic</h2>

        {/* Intent pills */}
        <div className="flex flex-wrap gap-2">
          {INTENTS.map((i) => (
            <button
              key={i.id}
              onClick={() => setIntent(i.id)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                intent === i.id
                  ? 'bg-white text-black border-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <textarea
          rows={3}
          placeholder="Pose une question sur ce diagnostic..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-gray-500 placeholder-gray-600"
        />

        <button
          onClick={ask}
          disabled={loading || !question.trim()}
          className="self-end text-sm px-4 py-2 rounded-lg bg-white text-black font-semibold disabled:opacity-40 hover:bg-gray-200 transition-all"
        >
          {loading ? 'Analyse...' : 'Envoyer'}
        </button>

        {/* Answer */}
        {answer && (
          <div className="border border-gray-800 rounded-lg p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-900">
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}
