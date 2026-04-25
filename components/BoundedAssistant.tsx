'use client';
import { useState } from 'react';

interface BoundedAssistantProps {
  context: string;
  jobId?: string;
}

const INTENTS = [
  { id: 'clarify', label: 'Clarifier' },
  { id: 'explain', label: 'Expliquer' },
  { id: 'expand', label: 'Développer' },
  { id: 'prioritize', label: 'Prioriser' },
];

export default function BoundedAssistant({ context }: BoundedAssistantProps) {
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!selectedIntent) return;
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: selectedIntent, context, user_input: userInput }),
      });
      const data = await res.json();
      setResponse(data.response || 'Aucune réponse disponible.');
    } catch {
      setResponse('Erreur lors de la connexion à l\'assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedIntent(null);
    setUserInput('');
    setResponse('');
  };

  return (
    <div className="mx-4 mb-8 border border-gray-800 rounded-xl overflow-hidden">
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-800">
        <p className="text-sm font-semibold text-white">Posez une question sur ce diagnostic</p>
      </div>
      <div className="p-4">
        {!selectedIntent ? (
          <div className="grid grid-cols-2 gap-2">
            {INTENTS.map((intent) => (
              <button key={intent.id} onClick={() => setSelectedIntent(intent.id)} className="py-2 px-3 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors text-left">
                {intent.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Intent :</span>
              <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">{INTENTS.find(i => i.id === selectedIntent)?.label}</span>
              <button onClick={handleReset} className="text-gray-500 text-xs hover:text-white ml-auto">← Changer</button>
            </div>
            <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Précisez votre question (optionnel)..." className="w-full bg-gray-800 text-white text-sm rounded-lg p-3 border border-gray-700 focus:border-gray-500 focus:outline-none resize-none" rows={2} />
            <button onClick={handleSend} disabled={loading} className="w-full bg-white text-black font-semibold text-sm py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
              {loading ? 'En cours...' : 'Envoyer →'}
            </button>
            {response && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{response}</p>
                <button onClick={handleReset} className="mt-3 text-xs text-gray-500 hover:text-white">Poser une autre question</button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="px-4 py-2 border-t border-gray-800">
        <p className="text-xs text-gray-600">Cet assistant répond uniquement à partir de votre diagnostic.</p>
      </div>
    </div>
  );
}
