'use client';

interface DiagnosticHeroProps {
  score: number;
  headline: string;
  summary: string;
}

export default function DiagnosticHero({ score, headline, summary }: DiagnosticHeroProps) {
  const scoreColor = score >= 70 ? 'text-green-400' : score >= 40 ? 'text-orange-400' : 'text-red-400';
  const barColor = score >= 70 ? 'bg-green-400' : score >= 40 ? 'bg-orange-400' : 'bg-red-400';
  return (
    <div className="px-6 py-10 text-center">
      <div className={`text-8xl font-black mb-2 ${scoreColor}`}>
        {score}
        <span className="text-3xl font-normal text-gray-500">/100</span>
      </div>
      <div className="w-full max-w-xs mx-auto h-2 bg-gray-800 rounded-full mb-8">
        <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3 leading-tight">{headline}</h1>
      <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">{summary}</p>
    </div>
  );
}
