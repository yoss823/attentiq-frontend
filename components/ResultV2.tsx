'use client';
import DiagnosticHero from './DiagnosticHero';
import MetricsDashboard from './MetricsDashboard';
import ActionsList from './ActionsList';
import BoundedAssistant from './BoundedAssistant';
import { V2AnalysisResult } from '@/lib/v2-types';

interface ResultV2Props {
  result: V2AnalysisResult;
}

const FORMAT_LABEL: Record<string, string> = {
  video: '🎬 Vidéo',
  image: '🖼 Image',
  text: '📝 Texte',
};

export default function ResultV2({ result }: ResultV2Props) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between px-4 pt-6 pb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Attentiq — Diagnostic</span>
          <span className="text-xs text-gray-600 bg-gray-900 px-2 py-1 rounded-full">
            {FORMAT_LABEL[result.inputFormat] ?? result.inputFormat}
          </span>
        </div>

        <DiagnosticHero
          label={result.diagnostic.label}
          explanation={result.diagnostic.explanation}
        />

        <div className="mx-4 border-t border-gray-900 mb-6" />

        {result.dashboard.length > 0 && (
          <MetricsDashboard metrics={result.dashboard} />
        )}

        <ActionsList actions={result.actions} />

        {result.assistant.active && result.assistant.intents.length > 0 && (
          <>
            <div className="mx-4 border-t border-gray-900 my-6" />
            <BoundedAssistant
              context={JSON.stringify(result)}
              intents={result.assistant.intents}
            />
          </>
        )}

        <div className="px-4 pb-8 text-center">
          <a href="/analyze" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ← Analyser une autre vidéo
          </a>
        </div>
      </div>
    </main>
  );
}
