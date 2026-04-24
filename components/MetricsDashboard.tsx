// components/MetricsDashboard.tsx
'use client';

import { Metric } from '@/types/v2';

interface Props {
  metrics: Metric[];
}

export default function MetricsDashboard({ metrics }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-4 max-w-2xl mx-auto w-full">
      {metrics.map((m, i) => (
        <div
          key={i}
          className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-1"
        >
          <span className="text-xs text-gray-500 uppercase tracking-wide">{m.label}</span>
          <span className="text-xl font-bold text-white">
            {m.value}
            {m.unit && <span className="text-sm text-gray-400 ml-1">{m.unit}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
