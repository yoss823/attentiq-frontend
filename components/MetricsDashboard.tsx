'use client';

import { DiagnosticMetric } from '@/types/v2';

interface Props {
  metrics: DiagnosticMetric[];
}

const trendIcon: Record<string, string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

const trendColor: Record<string, string> = {
  up: 'text-green-400',
  down: 'text-red-400',
  neutral: 'text-gray-400',
};

export default function MetricsDashboard({ metrics }: Props) {
  if (!metrics || metrics.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-4 py-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Métriques clés
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex flex-col gap-1"
          >
            <p className="text-gray-500 text-xs">{metric.label}</p>
            <div className="flex items-center gap-1">
              <span className="text-white font-bold text-sm">
                {metric.value}
                {metric.unit ? ` ${metric.unit}` : ''}
              </span>
              {metric.trend && (
                <span className={`text-xs font-bold ${trendColor[metric.trend]}`}>
                  {trendIcon[metric.trend]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
