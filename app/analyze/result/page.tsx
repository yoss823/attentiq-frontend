'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ResultV2 from '@/components/ResultV2';
import { DiagnosticResult, DiagnosticAction, DiagnosticMetric } from '@/types/v2';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://attentiqbackend-production.up.railway.app';

function mapToV2(raw: Record<string, unknown>): DiagnosticResult {
  const rawScore = (raw.retention_score as number) ?? (raw.score as number) ?? 50;
  const score = rawScore <= 10 ? Math.round(rawScore * 10) : Math.round(rawScore);
  const globalSummary = (raw.global_summary as string) ?? (raw.summary as string) ?? '';
  const headline = globalSummary.split('.')[0].trim() || 'Diagnostic Attentiq';
  const summary = globalSummary || 'Analyse complétée.';
  const drops = (raw.attention_drops as Array<{ timestamp_seconds?: number; severity?: string; cause?: string }>) ?? [];
  const metrics: DiagnosticMetric[] = drops.slice(0, 5).map((drop, i) => ({
    label: `Chute ${i + 1}`,
    value: drop.timestamp_seconds != null ? `${drop.timestamp_seconds}s` : '—',
    trend: 'down' as const,
  }));
  if (metrics.length === 0) {
    metrics.push(
      { label: 'Score rétention', value: score, unit: '/100' },
      { label: 'Statut', value: (raw.status as string) === 'partial' ? 'Partiel' : 'Complet' },
    );
  }
  const correctiveActions = (raw.corrective_actions as string[]) ?? [];
  const makeAction = (index: number): DiagnosticAction => ({
    id: `action-${index}`,
    rank: (index + 1) as 1 | 2 | 3,
    title: correctiveActions[index] ?? `Action ${index + 1}`,
    description: '',
    severity: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
    effort: 'medium',
  });
  const actions: [DiagnosticAction, DiagnosticAction, DiagnosticAction] = [
    makeAction(0),
    makeAction(1),
    makeAction(2),
  ];
  return {
    format: 'video',
    score,
    headline,
    summary,
    metrics,
    actions,
    raw,
  };
}

function ResultContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('attentiq_result');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResult(mapToV2(parsed));
        return;
      } catch {
        // ignore parse error
      }
    }
    const jobId = searchParams.get('job_id');
    if (jobId) {
      const poll = async (attempts = 0) => {
        if (attempts > 20) {
          setError('L\'analyse a pris trop de temps. Retournez à /analyze et réessayez.');
          return;
        }
        try {
          const res = await fetch(`${BACKEND_URL}/analyze/${jobId}`);
          const data = await res.json();
          if (data.status === 'success' && data.result) {
            setResult(mapToV2(data.result));
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
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <a href="/analyze" className="text-white text-sm underline hover:text-gray-300">
          ← Retourner à l'analyse
        </a>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Chargement du diagnostic...</p>
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
            <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm animate-pulse">Chargement du diagnostic...</p>
          </div>
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
