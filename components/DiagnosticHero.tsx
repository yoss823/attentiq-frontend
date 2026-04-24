// components/DiagnosticHero.tsx
'use client';

import { DiagnosticResult } from '@/types/v2';

interface Props {
  result: DiagnosticResult;
}

const scoreColor = (score: number) => {
  if (score >= 70) return 'text-green-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
};

const scoreBg = (score: number) => {
  if (score >= 70) return 'bg-green-400';
  if (score >= 40) return 'bg-yellow-400';
  return 'bg-red-400';
};

export default function DiagnosticHero({ result }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4 text-center">
      {/* Score ring */}
      <div className="relative flex items-center justify-center w-36 h-36">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#1f2937" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${(result.score / 100) * 276.5} 276.5`}
            strokeLinecap="round"
            className={scoreColor(result.score)}
          />
        </svg>
        <span className={`text-4xl font-black ${scoreColor(result.score)}`}>
          {result.score}
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-2xl md:text-3xl font-bold text-white max-w-2xl leading-tight">
        {result.headline}
      </h1>

      {/* Summary */}
      <p className="text-gray-400 text-base max-w-xl leading-relaxed">
        {result.summary}
      </p>

      {/* Format badge */}
      <span className="text-xs uppercase tracking-widest text-gray-500 border border-gray-700 rounded-full px-3 py-1">
        {result.format}
      </span>
    </div>
  );
}
