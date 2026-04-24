// components/ActionsList.tsx
'use client';

import { Action } from '@/types/v2';

interface Props {
  actions: [Action, Action, Action];
}

const severityStyles: Record<string, string> = {
  critical: 'border-red-500 bg-red-950/30',
  high:     'border-orange-500 bg-orange-950/30',
  medium:   'border-yellow-500 bg-yellow-950/30',
  low:      'border-gray-600 bg-gray-900',
};

const effortLabel: Record<string, string> = {
  low: 'Effort faible',
  medium: 'Effort moyen',
  high: 'Effort élevé',
};

export default function ActionsList({ actions }: Props) {
  return (
    <div className="flex flex-col gap-3 px-4 max-w-2xl mx-auto w-full">
      <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-1">3 actions prioritaires</h2>
      {actions.map((action) => (
        <div
          key={action.id}
          className={`border rounded-xl p-4 flex flex-col gap-2 ${severityStyles[action.severity]}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">#{action.rank}</span>
            <span className="text-xs text-gray-500">{effortLabel[action.effort]}</span>
          </div>
          <p className="text-white font-semibold text-sm">{action.title}</p>
          <p className="text-gray-400 text-xs leading-relaxed">{action.description}</p>
        </div>
      ))}
    </div>
  );
}
