'use client';

import { DiagnosticAction } from '@/types/v2';

interface Props {
  actions: [DiagnosticAction, DiagnosticAction, DiagnosticAction];
}

const severityColors: Record<string, string> = {
  high: 'bg-red-500 text-white',
  medium: 'bg-orange-500 text-white',
  low: 'bg-yellow-500 text-black',
};

export default function ActionsList({ actions }: Props) {
  return (
    <section className="w-full px-4 py-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Actions prioritaires
      </h2>
      <div className="flex flex-col gap-4">
        {actions.map((action) => (
          <div
            key={action.id}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4"
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                severityColors[action.severity]
              }`}
            >
              {action.rank}
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-1">
                {action.title}
              </p>
              {action.description && action.description !== action.title && (
                <p className="text-gray-400 text-sm leading-relaxed">
                  {action.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
