'use client';

import { useState } from 'react';

interface Props {
  context: string;
  jobId?: string;
}

const INTENTS = [
  { id: 'clarify', label: 'Clarifier' },
  { id: 'explain', label: 'Expliquer' },
  { id: 'expand', label: 'Développer' },
  { id: 'prioritize', label: 'Prioriser' },
];

export default function BoundedAssistant({ context }: Props) {
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    if (!selectedIntent) return;
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: selectedIntent,
          context,
          user_input: userInput || '',
        }),
      });

      if (!res.ok) throw new Error('Erreur de l\'assistant');
      const data = await res.json();
      setResponse(data.response || 'Pas de réponse.');
    } catch (err) {
      setError('Erreur lors de la génération de la réponse. Réessaie.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSelectedIntent(null);
    setUserInput('');
    setResponse('');
    setError('');
  }

  return (
    <section className="w-full px-4 py-6 border-t border-gray-800 mt-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Posez une question sur ce diagnostic
      </h2>

      {!selectedIntent && (
        <div className="flex flex-wrap gap-2">
          {INTENTS.map((intent) => (
            <button
              key={intent.id}
              onClick={() => setSelectedIntent(intent.id)}
              className="px-4 py-2 rounded-full bg-gray-800 text-white text-sm hover:bg-gray-700 transition border border-gray-700"
            >
              {intent.label}
            </button>
          ))}
        </div>
      )}

      {selectedIntent && !response && (
        <div className="flex flex-col gap-3">
          <p className="text-gray-300 text-sm">
            Intent sélectionné :{' '}
            <span className="font-semibold text-white">
              {INTENTS.find((i) => i.id === selectedIntent)?.label}
            </span>
          </p>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Précise ta question (optionnel)…"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSend}
              disabled={loading}
              className="flex-1 py-2 bg-white text-black rounded-lg font-semibold text-sm hover:bg-gray-100 transition disabled:opacity-50"
            >
              {loading ? 'En cours…' : 'Envoyer →'}
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm hover:bg-gray-700 transition"
            >
              Annuler
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      )}

      {response && (
        <div className="flex flex-col gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {response}
            </p>
          </div>
          <button
            onClick={reset}
            className="self-start px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm hover:bg-gray-700 transition"
          >
            Nouvelle question
          </button>
        </div>
      )}

      <p className="text-gray-600 text-xs mt-6">
        Cet assistant répond uniquement à partir de votre diagnostic actuel.{' '}
        <a href="/analyze" className="underline">Analyser une autre vidéo</a>
      </p>
    </section>
  );
}
