'use client';

import Link from 'next/link';

export default function PremiumPaywall() {
  return (
    <div className="rounded-2xl overflow-hidden border border-brand-600/50 shadow-xl shadow-brand-900/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-800/80 to-purple-800/80 px-6 py-5 flex items-center gap-3 border-b border-white/10">
        <span className="text-2xl">🔒</span>
        <div>
          <p className="text-white font-bold text-lg leading-tight">
            Rapport complet déverrouillé
          </p>
          <p className="text-brand-300 text-sm">
            Passez à la version premium pour accéder à l&apos;analyse complète
          </p>
        </div>
      </div>

      <div className="bg-white/5 px-6 py-6 space-y-6">
        {/* What's visible */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-medium">
            Inclus dans la version gratuite
          </p>
          <ul className="space-y-2">
            {[
              'État de l\'analyse',
              'Résumé court',
              'Moments de décrochage (max 3)',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-700/60 border border-slate-600/50 flex items-center justify-center shrink-0 text-slate-400 text-xs">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* What's locked */}
        <div>
          <p className="text-xs text-brand-400 uppercase tracking-widest mb-3 font-medium">
            Réservé aux membres premium 🔒
          </p>
          <ul className="space-y-2">
            {[
              'Recommandations détaillées',
              'Moments forts 🔥',
              'Analyse complète',
              'Rapport PDF téléchargeable',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm">
                <span className="w-5 h-5 rounded-full bg-brand-600/30 border border-brand-500/50 flex items-center justify-center shrink-0 text-brand-400 text-xs">
                  ✓
                </span>
                <span className="text-slate-200">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="pt-2 space-y-3">
          <Link
            href="/checkout/rapport-complet"
            className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-brand-900/50 hover:shadow-brand-700/50 hover:-translate-y-0.5"
          >
            <span>🔓</span>
            Obtenir le rapport complet — 19€
          </Link>

          <p className="text-center text-slate-500 text-xs leading-relaxed">
            Ou choisissez{' '}
            <Link
              href="/checkout/5-rapports"
              className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
            >
              49€/mois (5 rapports)
            </Link>{' '}
            ou{' '}
            <Link
              href="/checkout/illimite"
              className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
            >
              99€/mois (illimité)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
