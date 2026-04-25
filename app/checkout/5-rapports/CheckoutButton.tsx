'use client';

import { useState } from 'react';
import { STRIPE_LINKS } from '@/lib/stripe';

export default function CheckoutButton({
  planName,
  price,
  currency,
}: {
  planName: string;
  price: number;
  currency: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const link = STRIPE_LINKS.cinq_rapports;
    if (link) {
      window.location.href = link;
    } else {
      alert('Lien de paiement non disponible');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-brand-900/50 hover:shadow-brand-700/50 hover:-translate-y-0.5"
        onClick={handleClick}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Redirection vers le paiement…
          </span>
        ) : (
          <>Payer {price}{currency} — {planName}</>
        )}
      </button>
      <p className="text-center text-xs text-slate-500">
        Paiement sécurisé · Satisfait ou remboursé 7 jours
      </p>
    </div>
  );
}
