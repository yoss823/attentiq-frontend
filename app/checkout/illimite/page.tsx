import Link from 'next/link';
import type { Metadata } from 'next';
import { PRICING_PLANS } from '@/lib/constants';
import CheckoutButton from './CheckoutButton';

export const metadata: Metadata = {
  title: 'Illimité — 199€/mois',
  description:
    'Analyses TikTok illimitées pour les créateurs et agences sérieux. API access, tableau de bord analytique, support dédié.',
};

const plan = PRICING_PLANS.find((p) => p.id === 'illimite')!;

const faqs = [
  {
    q: 'Puis-je annuler à tout moment ?',
    a: 'Oui, sans engagement. Vous pouvez annuler votre abonnement à tout moment depuis votre espace client.',
  },
  {
    q: "Qu'est-ce que l'accès API ?",
    a: 'Vous pouvez intégrer Attentiq directement dans vos outils via notre API REST documentée.',
  },
  {
    q: 'Y a-t-il une limite de vidéos ?',
    a: "Non, le plan Illimité vous donne accès à un nombre illimité d'analyses par mois.",
  },
];

export default function CheckoutIllimitePage() {
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
          className="text-sm font-medium text-brand-300 hover:text-white transition-colors"
        >
          ← Retour à l&apos;analyse
        </Link>
      </nav>

      <div className="max-w-lg mx-auto px-6 pt-16 pb-24">
        {/* Pro badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 bg-purple-700 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
            🚀 Pour les pros
          </span>
        </div>

        {/* Plan card */}
        <div className="bg-white/5 border border-purple-500/40 rounded-3xl p-8 mb-8">
          <div className="text-center mb-8">
            <p className="text-sm text-purple-300 uppercase tracking-widest mb-2">
              {plan.name}
            </p>
            <div className="flex items-end justify-center gap-1 mb-1">
              <span className="text-6xl font-extrabold text-white">
                {plan.price}
              </span>
              <span className="text-2xl text-slate-300 mb-2">{plan.currency}</span>
            </div>
            <p className="text-slate-400 text-sm mb-1">
              par {plan.period} · sans engagement
            </p>
            <p className="text-slate-400 text-sm">{plan.description}</p>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center shrink-0">
                  <svg
                    className="w-3 h-3 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <CheckoutButton planName={plan.name} price={plan.price} currency={plan.currency} period={plan.period} />
        </div>

        {/* Trust signals */}
        <TrustSignals />

        {/* FAQ */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Questions fréquentes</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm font-medium text-white mb-1">{faq.q}</p>
                <p className="text-sm text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compare plans */}
        <ComparePlans currentPlanId={plan.id} />
      </div>
    </main>
  );
}

function TrustSignals() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8 text-center">
      {[
        { icon: '🔒', label: 'Paiement sécurisé' },
        { icon: '🔄', label: 'Sans engagement' },
        { icon: '⚡', label: 'Accès immédiat' },
      ].map((item) => (
        <div key={item.label} className="bg-white/5 rounded-xl p-3">
          <div className="text-2xl mb-1">{item.icon}</div>
          <p className="text-xs text-slate-400">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function ComparePlans({ currentPlanId }: { currentPlanId: string }) {
  const otherPlans = PRICING_PLANS.filter((p) => p.id !== currentPlanId);
  return (
    <div className="text-center">
      <p className="text-slate-500 text-sm mb-4">Voir les autres offres</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {otherPlans.map((p) => (
          <Link
            key={p.id}
            href={`/checkout/${p.slug}`}
            className="text-sm text-brand-400 hover:text-white border border-brand-800 hover:border-brand-500 rounded-xl px-4 py-2 transition-all"
          >
            {p.name} — {p.price}{p.currency}
            {p.period ? `/${p.period}` : ''}
          </Link>
        ))}
      </div>
    </div>
  );
}
