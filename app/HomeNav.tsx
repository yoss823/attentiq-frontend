'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPremiumFromCookie } from '@/lib/premium';

export default function HomeNav() {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setIsPremium(getPremiumFromCookie());
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
      <span className="text-xl font-bold tracking-tight text-white">
        Attentiq
      </span>
      <div className="flex items-center gap-4">
        {isPremium && (
          <Link
            href="/recharge"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300 border border-amber-500/40 hover:border-amber-400/60 px-3 py-1.5 rounded-lg transition-all"
          >
            ⚡ Recharge crédit
          </Link>
        )}
        <Link
          href="/analyze"
          className="text-sm font-medium text-brand-300 hover:text-white transition-colors"
        >
          Analyser une vidéo →
        </Link>
      </div>
    </nav>
  );
}
