'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://attentiqbackend-production.up.railway.app';

const STEPS = [
  '📥 Téléchargement de la vidéo…',
  '🎙 Transcription de l\'audio…',
  '🔍 Analyse image par image…',
  '🧠 Génération du diagnostic…',
];

function isValidTikTokUrl(url: string): boolean {
  return /tiktok\.com\/.+\/video\/\d+/.test(url) || /vm\.tiktok\.com\//.test(url);
}

export default function AnalyzePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === 'loading') {
      intervalRef.current = setInterval(() => {
        setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
      }, 20000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!url.trim()) {
      setErrorMsg('Colle une URL TikTok valide.');
      return;
    }
    if (!isValidTikTokUrl(url.trim())) {
      setErrorMsg('Seules les URLs TikTok sont supportées pour l\'instant.');
      return;
    }

    setStatus('loading');
    setStepIndex(0);

    // Timeout global 150s
    timeoutRef.current = setTimeout(() => {
      setStatus('error');
      setErrorMsg('L\'analyse prend plus longtemps que prévu. Réessaie dans quelques instants.');
      if (intervalRef.current) clearInterval(intervalRef.current);
    }, 150000);

    try {
      // POST /analyze → job_id
      const postRes = await fetch(`${BACKEND_URL}/analyze`, {
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

      if (!postRes.ok) {
        throw new Error(`Erreur backend: ${postRes.status}`);
      }

      const postData = await postRes.json();
      const jobId: string = postData.job_id;

      if (!jobId) {
        throw new Error('Pas de job_id dans la réponse backend.');
      }

      // Polling GET /analyze/{job_id}
      const poll = async (): Promise<void> => {
        const pollRes = await fetch(`${BACKEND_URL}/analyze/${jobId}`);
        if (!pollRes.ok) throw new Error(`Polling erreur: ${pollRes.status}`);
        const data = await pollRes.json();

        if (data.status === 'success') {
          clearTimeout(timeoutRef.current!);
          clearInterval(intervalRef.current!);
          sessionStorage.setItem(
            'attentiq_result',
            JSON.stringify(data.result || data)
          );
          router.push('/analyze/result');
          return;
        }

        if (data.status === 'error') {
          throw new Error(data.error_message || 'Erreur inconnue du pipeline.');
        }

        // Encore en cours → réessayer dans 5s
        await new Promise((r) => setTimeout(r, 5000));
        return poll();
      };

      await poll();
    } catch (err: unknown) {
      clearTimeout(timeoutRef.current!);
      clearInterval(intervalRef.current!);
      setStatus('error');
      setErrorMsg(
        err instanceof Error ? err.message : 'Une erreur est survenue. Réessaie.'
      );
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-2">
          Analysez votre vidéo TikTok
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Collez l'URL. Le diagnostic arrive en 60 à 90 secondes.
        </p>

        {status === 'idle' || status === 'error' ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@..."
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-white text-base"
              disabled={status === 'loading'}
            />
            {errorMsg && (
              <p className="text-red-400 text-sm">{errorMsg}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-white text-black font-semibold text-base hover:bg-gray-100 transition"
            >
              Lancer l'analyse →
            </button>
          </form>
        ) : null}

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-base font-medium text-center">
              {STEPS[stepIndex]}
            </p>
            <p className="text-gray-500 text-xs text-center">
              L'analyse prend généralement 60 à 90 secondes.
            </p>
          </div>
        )}

        <p className="text-center text-gray-600 text-xs mt-10">
          Vos données ne sont pas stockées. La vidéo est analysée puis supprimée.{' '}
          <a href="/transparence" className="underline">En savoir plus</a>
        </p>
      </div>
    </main>
  );
}
