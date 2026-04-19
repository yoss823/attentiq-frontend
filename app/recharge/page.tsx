'use client';

import { useState } from 'react';
import Link from 'next/link';
import RechargeCheckoutButton from './CheckoutButton';

const PRESET_AMOUNTS = [10, 25, 50, 100] as const;

export default function RechargePage() {
  const [customAmount, setCustomAmount] = useState('');
  const [customError, setCustomError] = useState('');

  const parsedCustom = parseInt(customAmount, 10);
  const customValid = !isNaN(parsedCustom) && parsedCustom >= 5;

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    if (val && (isNaN(parseInt(val, 10)) || parseInt(val, 10) < 5)) {
      setCustomError('Montant minimum : 5 €');
    } else {
      setCustomError('');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white hover:text-brand-300 transition-colors"
        >
          Attentiq
        </Link>
        <Link
          href="/analyze"
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          ← Retour à l&apos;analyse
        </Link>
      </nav>

      <div className="max-w-xl mx-auto px-6 pt-10 pb-24">
        {/* Urgent warning banner */}
        <div className="bg-amber-500/15 border border-amber-500/50 rounded-2xl px-6 py-5 mb-10 text-center">
          <p className="text-2xl font-extrabold text-amber-400 mb-1">
            ⚠️ Crédit épuisé
          </p>
          <p className="text-amber-300 font-semibold text-lg">
            Recharge immédiate requise
          </p>
          <p className="text-amber-200/70 text-sm mt-2 leading-relaxed">
            Le crédit restant est insuffisant pour maintenir le service. Une
            recharge est nécessaire pour continuer à analyser des vidéos.
          </p>
        </div>

        {/* What credit enables */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-4">
            Le crédit permet de&nbsp;:
          </h2>
          <ul className="space-y-2">
            {[
              '🤖 Faire tourner les modèles d\'IA d\'analyse',
              '📊 Générer les rapports d\'attention seconde par seconde',
              '⚡ Maintenir les temps de réponse rapides',
              '🔒 Garder le service opérationnel pour tous les utilisateurs',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="shrink-0">{item.slice(0, 2)}</span>
                <span>{item.slice(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Preset amounts */}
        <h2 className="text-white font-bold text-xl mb-4">
          Choisissez un montant
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {PRESET_AMOUNTS.map((amt) => (
            <div
              key={amt}
              className="bg-white/5 border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 transition-colors"
            >
              <p className="text-2xl font-extrabold text-white mb-1">
                {amt}&nbsp;€
              </p>
              <p className="text-slate-400 text-xs mb-4">
                {amt === 10 && 'Dépannage rapide'}
                {amt === 25 && 'Recommandé — ~1 semaine'}
                {amt === 50 && 'Confortable — ~2 semaines'}
                {amt === 100 && 'Tranquillité — ~1 mois'}
              </p>
              <RechargeCheckoutButton amountEur={amt} />
            </div>
          ))}
        </div>

        {/* Custom amount */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-3">Montant personnalisé</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                €
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Ex : 30"
                className="w-full bg-white/5 border border-white/10 focus:border-amber-500/60 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
              />
            </div>
          </div>
          {customError && (
            <p className="text-red-400 text-sm mb-3">{customError}</p>
          )}
          {customValid ? (
            <RechargeCheckoutButton
              amountEur={parsedCustom}
              label={`Recharger ${parsedCustom} €`}
            />
          ) : (
            <button
              disabled
              className="w-full bg-amber-500/30 text-amber-200/50 font-bold py-4 rounded-xl text-lg cursor-not-allowed"
            >
              Entrez un montant (min. 5 €)
            </button>
          )}
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Paiement sécurisé via Stripe · Aucune donnée bancaire stockée
        </p>
      </div>
    </main>
  );
}
