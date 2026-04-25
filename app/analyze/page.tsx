'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://attentiq-backend-prod-production.up.railway.app';

const LOADING_STEPS = [
  { message: '📥 Téléchargement de la vidéo...', duration: 15000 },
  { message: '🎙 Transcription de l\'audio...', duration: 20000 },
  { message: '🔍 Analyse image par image...', duration: 30000 },
  { message: '🧠 Génération du diagnostic...', duration: 25000 },
];

function isValidTikTokUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('tiktok.com') || parsed.hostname.includes('vm.tiktok.com');
  } catch {
    return false;
  }
}

export default function AnalyzePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  const advanceStep = (index: number) => {
    if (index < LOADING_STEPS.length - 1) {
      stepTimerRef.current = setTimeout(() => {
        setStepIndex(index + 1);
        advanceStep(index + 1);
      }, LOADING_STEPS[index].duration);
    }
  };

  const pollJob = async (jobId: string, attempts = 0) => {
    if (attempts > 30) {
      setError("L'analyse prend plus longtemps que prévu. Réessayez dans quelques instants.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/analyze/${jobId}`);
      const data = await res.json();
      if (data.status === 'success' && data.result) {
        sessionStorage.setItem('attentiq_result', JSON.stringify(data.result));
        router.push('/analyze/result');
        return;
      }
      if (data.status === 'error') {
        setError(data.error_message || 'Une erreur est survenue lors de l\'analyse.');
        setLoading(false);
        return;
      }
      pollingRef.current = setTimeout(() => pollJob(jobId, attempts + 1), 5000);
    } catch {
      pollingRef.current = setTimeout(() => pollJob(jobId, attempts + 1), 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!url.trim()) {
      setError('Veuillez entrer une URL TikTok.');
      return;
    }
    if (!isValidTikTokUrl(url.trim())) {
      setError('Seules les URLs TikTok sont supportées pour l\'instant. Exemple : https://www.tiktok.com/@username/video/...');
      return;
    }
    setLoading(true);
    setStepIndex(0);
    setElapsedSeconds(0);
    elapsedRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    advanceStep(0);
    try {
      const res = await fetch(`${BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: crypto.randomUUID(),
          url: url.trim(),
          platform: 'tiktok',
          max_duration_seconds: 60,
          requested_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`);
      }
      const data = await res.json();
      if (!data.job_id) {
        throw new Error('Réponse invalide du serveur.');
      }
      pollJob(data.job_id);
    } catch (err: unknown) {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Analysez votre vidéo TikTok</h1>
          <p className="text-gray-400 text-sm">
            Collez l'URL. Le diagnostic arrive en 60 à 90 secondes.
          </p>
        </div>
        {!loading ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                placeholder="https://www.tiktok.com/@username/video/..."
                className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                disabled={loading}
              />
              {error && (
                <p className="mt-2 text-red-400 text-xs leading-relaxed">{error}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-white text-black font-semibold py-4 rounded-xl hover:bg-gray-100 transition-colors text-sm"
            >
              Lancer l'analyse →
            </button>
            <p className="text-center text-xs text-gray-600">
              Vos données ne sont pas stockées. La vidéo est analysée puis supprimée.
            </p>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
            </div>
            <div>
              <p className="text-white font-medium text-lg">
                {LOADING_STEPS[stepIndex].message}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {elapsedSeconds}s écoulées
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {LOADING_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full transition-colors ${
                    i <= stepIndex ? 'bg-white' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600 text-xs">
              L'analyse prend généralement 60 à 90 secondes.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
