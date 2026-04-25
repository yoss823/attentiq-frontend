'use client';
import { V2Action } from '@/lib/v2-types';

interface ActionsListProps {
  actions: [V2Action, V2Action, V2Action];
}

const RANK_STYLE: Record<number, string> = {
  1: 'bg-red-500 text-white',
  2: 'bg-orange-500 text-white',
  3: 'bg-yellow-500 text-black',
};

export default function ActionsList({ actions }: ActionsListProps) {
  return (
    <div className="px-4 pb-6">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Actions prioritaires</h2>
      <div className="space-y-3">
        {actions.map((action) => (
          <div key={action.rank} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${RANK_STYLE[action.rank] ?? 'bg-gray-700 text-white'}`}
            >
              {action.rank}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{action.label}</p>
              {action.rationale && (
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">{action.rationale}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
