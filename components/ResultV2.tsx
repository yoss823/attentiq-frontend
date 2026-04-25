'use client';

import { useState } from 'react';
import { V2AnalysisResult } from '@/lib/v2-types';

interface ResultV2Props {
  result: V2AnalysisResult;
}

export default function ResultV2({ result }: ResultV2Props) {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Votre diagnostic</h1>
          <p className="text-gray-400 text-sm">
            Analysé le {new Date(result.analysedAt).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Diagnostic dominant */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">
              {result.diagnostic.score >= 0.75 ? '✅' : result.diagnostic.score >= 0.5 ? '⚠️' : '❌'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">
                {result.diagnostic.label.replace(/_/g, ' ').toUpperCase()}
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                {result.diagnostic.explanation}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all"
                    style={{ width: `${result.diagnostic.score * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">
                  {Math.round(result.diagnostic.score * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mini-dashboard */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">Métriques clés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.dashboard.map((metric) => (
              <div key={metric.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">{metric.label}</p>
                  <span className="text-xs">
                    {metric.trend === 'up' && '📈'}
                    {metric.trend === 'down' && '📉'}
                    {metric.trend === 'neutral' && '➡️'}
                  </span>
                </div>
                <p className="text-lg font-semibold">
                  {metric.value}
                  {metric.unit && <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">3 actions prioritaires</h3>
          <div className="space-y-3">
            {result.actions.map((action) => (
              <button
                key={action.rank}
                onClick={() => setSelectedAction(selectedAction === action.rank ? null : action.rank)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedAction === action.rank
                    ? 'bg-white text-black border-white'
                    : 'bg-gray-900 text-white border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm">
                    {action.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{action.label}</p>
                    {selectedAction === action.rank && (
                      <p className="text-xs mt-2 text-gray-600">{action.rationale}</p>
                    )}
                  </div>
                  <span className="text-lg">
                    {selectedAction === action.rank ? '▼' : '▶'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Assistant */}
        {result.assistant.active && (
          <div className="mb-8">
            <button
              onClick={() => setAssistantOpen(!assistantOpen)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-gray-500 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Assistant Attentiq</p>
                  <p className="text-xs text-gray-500 mt-1">Posez une question sur ce diagnostic</p>
                </div>
                <span className="text-lg">{assistantOpen ? '▼' : '▶'}</span>
              </div>
            </button>
            {assistantOpen && (
              <div className="mt-4 bg-gray-900 border border-gray-700 rounded-xl p-4">
                <div className="space-y-2">
                  {result.assistant.intents
                    .filter((intent) => intent.available)
                    .map((intent) => (
                      <button
                        key={intent.type}
                        className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm"
                      >
                        <p className="font-semibold capitalize">{intent.type.replace(/-/g, ' ')}</p>
                        <p className="text-xs text-gray-500 mt-1">{intent.description}</p>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-800">
          <a
            href="/analyze"
            className="inline-block bg-white text-black font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors text-sm"
          >
            ← Analyser un autre contenu
          </a>
          <p className="text-xs text-gray-600 mt-4">
            Diagnostic généré par Attentiq • {result.pipelineVersion}
          </p>
        </div>
      </div>
    </main>
  );
}
