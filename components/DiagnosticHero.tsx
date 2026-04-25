'use client';

const LABEL_MAP: Record<string, { emoji: string; color: string }> = {
  retention_high:  { emoji: '🟢', color: 'text-green-400' },
  retention_low:   { emoji: '🔴', color: 'text-red-400' },
  pacing_off:      { emoji: '🟡', color: 'text-yellow-400' },
  hook_weak:       { emoji: '🟠', color: 'text-orange-400' },
  hook_strong:     { emoji: '🟢', color: 'text-green-400' },
  cta_missing:     { emoji: '🟠', color: 'text-orange-400' },
  audio_mismatch:  { emoji: '🟡', color: 'text-yellow-400' },
};

function labelToDisplay(label: string): string {
  return label
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface DiagnosticHeroProps {
  label: string;
  explanation: string;
}

export default function DiagnosticHero({ label, explanation }: DiagnosticHeroProps) {
  const style = LABEL_MAP[label] ?? { emoji: '⚪', color: 'text-gray-300' };
  return (
    <div className="px-6 py-10 text-center">
      <div className="text-5xl mb-4">{style.emoji}</div>
      <h1 className={`text-2xl font-black mb-4 leading-tight ${style.color}`}>
        {labelToDisplay(label)}
      </h1>
      <p className="text-gray-300 text-base leading-relaxed max-w-md mx-auto">
        {explanation}
      </p>
    </div>
  );
}
