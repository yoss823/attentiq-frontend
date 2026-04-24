// components/ResultV2.tsx
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
  return (
    <main className="min-h-screen bg-black text-white flex flex-col gap-10">
      <DiagnosticHero result={result} />
      <MetricsDashboard metrics={result.metrics} />
      <ActionsList actions={result.actions} />
      <BoundedAssistant result={result} />
    </main>
  );
}
