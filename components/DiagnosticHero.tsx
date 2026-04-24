'use client';

interface Props {
  score: number;
  headline: string;
  summary: string;
}

export default function DiagnosticHero({ score, headline, summary }: Props) {
  const color =
    score >= 70
      ? 'text-green-400'
      : score >= 40
      ? 'text-orange-400'
      : 'text-red-400';

  const barColor =
    score >= 70
      ? 'bg-green-400'
      : score >= 40
      ? 'bg-orange-400'
      : 'bg-red-400';

  return (
    <section className="w-full px-4 pt-10 pb-6">
      <div className="text-center mb-6">
        <span className={`text-8xl font-black tabular-nums ${color}`}>
          {score}
        </span>
        <span className="text-gray-500 text-2xl font-light">/100</span>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>

      <h1 className="text-2xl font-bold text-white mb-3 leading-tight">
        {headline}
      </h1>
      <p className="text-gray-300 text-base leading-relaxed">{summary}</p>
    </section>
  );
}
