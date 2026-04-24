'use client';

import DiagnosticHero from './DiagnosticHero';
import MetricsDashboard from './MetricsDashboard';
import ActionsList from './ActionsList';
import BoundedAssistant from './BoundedAssistant';
import { DiagnosticResult } from '@/types/v2';

interface Props {
  result: DiagnosticResult;
}

export default function ResultV2({ result }: Props) {
  const context = JSON.stringify(result.raw || result);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-xl mx-auto pb-20">
        {/* Section 1 — Diagnostic dominant */}
        <DiagnosticHero
          score={result.score}
          headline={result.headline}
          summary={result.summary}
        />

        {/* Section 2 — Mini-dashboard */}
        <MetricsDashboard metrics={result.metrics} />

        {/* Section 3 — 3 actions */}
        <ActionsList actions={result.actions} />

        {/* CTA Analyser une autre vidéo */}
        <div className="px-4 py-6">
          <a
            href="/analyze"
            className="block w-full py-3 text-center rounded-lg border border-gray-700 text-gray-400 text-sm hover:border-white hover:text-white transition"
          >
            ← Analyser une autre vidéo
          </a>
        </div>

        {/* Section 4 — Assistant borné */}
        <BoundedAssistant context={context} />
      </div>
    </main>
  );
}
