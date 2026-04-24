// app/analyze/result/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ResultV2 from '@/components/ResultV2';
import { DiagnosticResult } from '@/types/v2';

// Mapper le payload brut du backend vers DiagnosticResult V2
function mapToV2(raw: Record<string, unknown>): DiagnosticResult {
  const score = typeof raw.attention_score === 'number'
    ? Math.round(raw.attention_score)
    : typeof raw.score === 'number'
    ? Math.round(raw.score)
    : 50;

  const headline = (raw.headline as string)
    ?? (raw.summary as string)?.split('.')[0]
    ?? 'Diagnostic Attentiq';

  const summary = (raw.summary as string)
    ?? (raw.description as string)
    ?? 'Analyse complétée.';

  // Métriques secondaires — adapte selon ton vrai payload
  const metrics = (raw.metrics as { label: string; value: string | number; unit?: string }[])
    ?? [
      { label: 'Clarté', value: raw.clarity_score ?? '—' },
      { label: 'Accroche', value: raw.hook_score ?? '—' },
      { label: 'Rétention', value: raw.retention_score ?? '—' },
    ];

  // Actions — le backend doit renvoyer un tableau actions[]; sinon fallback
  const rawActions = (raw.actions as { title: string; description: string; severity?: string; effort?: string }[]) ?? [];

  const actions: [DiagnosticResult['actions'][0], DiagnosticResult['actions'][1], DiagnosticResult['actions'][2]] = [
    {
      id: 'a1',
      rank: 1,
      title: rawActions[0]?.title ?? 'Action prioritaire 1',
      description: rawActions[0]?.description ?? '',
      severity: (rawActions[0]?.severity as any) ?? 'high',
      effort: (rawActions[0]?.effort as any) ?? 'medium',
    },
    {
      id: 'a2',
      rank: 2,
      title: rawActions[1]?.title ?? 'Action prioritaire 2',
      description: rawActions[1]?.description ?? '',
      severity: (rawActions[1]?.severity as any) ?? 'medium',
      effort: (rawActions[1]?.effort as any) ?? 'medium',
    },
    {
      id: 'a3',
      rank: 3,
      title: rawActions[2]?.title ?? 'Action prioritaire 3',
      description: rawActions[2]?.description ?? '',
      severity: (rawActions[2]?.severity as any) ?? 'low',
      effort: (rawActions[2]?.effort as any) ?? 'low',
    },
  ];

  return {
    format: (raw.format as any) ?? 'video',
    score,
    headline,
    summary,
    metrics,
    actions,
    raw,
  };
}

export default function ResultPage() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Cas 1 : résultat passé via sessionStorage (depuis /analyze)
    const stored = sessionStorage.getItem('attentiq_result');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResult(mapToV2(parsed));
        return;
      } catch {
        // ignore
      }
    }

    // Cas 2 : job_id dans l'URL → polling backend
    const jobId = searchParams.get('job_id');
    if (jobId) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
      const poll = async () => {
        try {
          const res = await fetch(`${backendUrl}/jobs/${jobId}`);
          const data = await res.json();
          if (data.status === 'completed' && data.result) {
            setResult(mapToV2(data.result));
          } else if (data.status === 'failed') {
            setError('Le diagnostic a échoué. Réessaie.');
          } else {
            setTimeout(poll, 2000);
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
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-500 text-sm animate-pulse">Chargement du diagnostic...</p>
      </main>
    );
  }

  return <ResultV2 result={result} />;
}
