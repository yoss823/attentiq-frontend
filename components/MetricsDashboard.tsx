'use client';
import { V2DashboardMetric } from '@/lib/v2-types';

interface MetricsDashboardProps {
  metrics: V2DashboardMetric[];
}

function TrendIcon({ trend }: { trend: V2DashboardMetric['trend'] }) {
  if (trend === 'up') return <span className="text-green-400 text-xs ml-1">↑</span>;
  if (trend === 'down') return <span className="text-red-400 text-xs ml-1">↓</span>;
  return <span className="text-gray-500 text-xs ml-1">→</span>;
}

export default function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  const displayed = metrics.slice(0, 6);
  return (
    <div className="px-4 pb-6">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Métriques clés</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayed.map((metric) => (
          <div key={metric.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
            <p className="text-white font-bold text-lg">
              {metric.value}
              {metric.unit && (
                <span className="text-gray-500 text-sm font-normal ml-1">{metric.unit}</span>
              )}
              <TrendIcon trend={metric.trend} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
