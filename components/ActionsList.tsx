'use client';
import { DiagnosticAction } from '@/types/v2';

interface ActionsListProps {
  actions: [DiagnosticAction, DiagnosticAction, DiagnosticAction];
}

export default function ActionsList({ actions }: ActionsListProps) {
  const severityStyle = (severity: string) => {
    if (severity === 'high') return 'bg-red-500 text-white';
    if (severity === 'medium') return 'bg-orange-500 text-white';
    return 'bg-yellow-500 text-black';
  };
  return (
    <div className="px-4 pb-6">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Actions prioritaires</h2>
      <div className="space-y-3">
        {actions.map((action, i) => (
          <div key={action.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${severityStyle(action.severity)}`}>
              {i + 1}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{action.title}</p>
              {action.description && <p className="text-gray-400 text-xs mt-1 leading-relaxed">{action.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
