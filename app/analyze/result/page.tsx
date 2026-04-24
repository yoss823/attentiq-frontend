'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ResultV2 from '@/components/ResultV2';
import { DiagnosticResult, DiagnosticAction, DiagnosticMetric } from '@/types/v2';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://attentiqbackend-production.up.railway.app';

function mapToV2(raw: Record<string, unknown>): DiagnosticResult {
  // Score : retention_score peut être sur 10 ou 100
  const rawScore =
    typeof raw.retention_score === 'number'
      ? raw.retention_score
      : typeof raw.score === 'number'
      ? raw.score
      : 50;
  const score = rawScore <= 10 ? Math.round(rawScore * 10) : Math.round(rawScore);

  // Headline = première phrase du summary
  const rawSummary = (raw.global_summary as string) || (raw.summary as string) || '';
  const headline =
    (raw.headline as string) ||
    rawSummary.split(/[.!?]/)[0]?.trim() ||
    'Diagnostic Attentiq';
  const summary = rawSummary || 'Analyse complétée.';

  // Métriques depuis attention_drops
  const drops = (raw.attention_drops as Array<{ timestamp_seconds: number; severity: string; cause: string }>) || [];
  const metrics: DiagnosticMetric[] = drops.slice(0, 5).map((d, i) => ({
    label: `Chute à ${d.timestamp_seconds}s`,
    value: d.severity,
    trend: d.severity === 'high' ? 'down' : d.severity === 'medium' ? 'down' : 'neutral',
  }));

  if (metrics.length === 0) {
    metrics.push(
      { label: 'Score', value: `${score}/100` },
      { label: 'Audience perdue', value: (raw.audience_loss_estimate as string) || '—' },
      { label: 'Règle clé', value: (raw.drop_off_rule as string)?.slice(0, 30) || '—' }
    );
  }

  // Actions depuis corrective_actions
  const corrective = (raw.corrective_actions as string[]) || [];
  const buildAction = (i: number, rank: 1 | 2 | 3): DiagnosticAction => ({
    id: `action-${rank}`,
    rank,
    title: corrective[i]?.slice(0, 60) || `Action prioritaire ${rank}`,
    description: corrective[i] || '',
    severity: rank === 1 ? 'high' : rank === 2 ? 'medium' : 'low',
    effort: 'medium',
  });

  const actions: [DiagnosticAction, DiagnosticAction, DiagnosticAction] = [
    buildAction(0, 1),
    buildAction(1, 2),
    buildAction(2, 3),
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

// ── Composant interne (utilise useSearchParams dans Suspense) ──
function ResultContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Lire depuis sessionStorage
    const stored = sessionStorage.getItem('attentiq_result');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResult(mapToV2(parsed));
        return;
      } catch {
        /* ignore */
      }
    }

    // 2. Fallback : poller via job_id dans les params
    const jobId = searchParams.get('job_id');
    if (jobId) {
      const poll = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/analyze/${jobId}`);
          const data = await res.json();
          if (data.status === 'success' && data.result) {
            setResult(mapToV2(data.result));
          } else if (data.status === 'error') {
            setError('Le diagnostic a échoué. Retourne à /analyze.');
          } else {
            setTimeout(poll, 3000);
          }
        } catch {
          setError('Impossible de contacter le backend.');
        }
      };
      poll();
      return;
    }

    setError('Aucun résultat trouvé. Retourne à /analyze.');
  }, [searchParams]);

  if (error) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <a
          href="/analyze"
          className="px-6 py-3 bg-white text-black rounded-lg font-semibold text-sm hover:bg-gray-100"
        >
          ← Analyser une vidéo
        </a>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-500 text-sm animate-pulse">
          Chargement du diagnostic…
        </p>
      </main>
    );
  }

  return <ResultV2 result={result} />;
}

// ── Export page avec Suspense ──
export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-gray-500 text-sm animate-pulse">
            Chargement du diagnostic…
          </p>
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
