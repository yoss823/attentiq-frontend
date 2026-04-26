'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ResultV2 from '@/components/ResultV2';
import { V2AnalysisResult } from '@/lib/v2-types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://attentiq-backend-prod-production.up.railway.app';

function ResultContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<V2AnalysisResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('attentiq_result');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as V2AnalysisResult;
        setResult(parsed);
        return;
      } catch {
        // ignore parse error, fall through to job_id polling
      }
    }

    const jobId = searchParams.get('jobId') || searchParams.get('job_id');
    if (jobId) {
      const poll = async (attempts = 0) => {
        if (attempts > 20) {
          setError("L'analyse a pris trop de temps. Retournez à /analyze et réessayez.");
          return;
        }
        try {
          const res = await fetch(`${BACKEND_URL}/analyze/${jobId}`);
          const data = await res.json();
          if (data.status === 'success' && data.result) {
            sessionStorage.setItem('attentiq_result', JSON.stringify(data.result));
            setResult(data.result as V2AnalysisResult);
          } else if (data.status === 'error') {
            setError(data.error_message || 'Analyse échouée.');
          } else {
            setTimeout(() => poll(attempts + 1), 3000);
          }
        } catch {
          setError('Impossible de contacter le backend.');
        }
      };
      poll();
      return;
    }

    setError('Aucun résultat trouvé. Retournez à /analyze pour lancer une analyse.');
  }, [searchParams]);

  if (error) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
        <p className="text-sm mb-4 text-red-400">{error}</p>
        <a
          href="/analyze"
          className="text-sm underline transition-colors text-brand-300 hover:text-brand-200"
        >
          ← Retourner à l'analyse
        </a>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-brand-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Chargement du diagnostic...</p>
        </div>
      </main>
    );
  }

  return <ResultV2 result={result} />;
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-brand-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm animate-pulse text-slate-400">Chargement du diagnostic...</p>
          </div>
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
