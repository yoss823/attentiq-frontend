'use client';

import { useState } from 'react';
import { stripePromise, STRIPE_PRICES } from '@/lib/stripe';

export default function CheckoutButton({
  planName,
  price,
  currency,
  period,
}: {
  planName: string;
  price: number;
  currency: string;
  period: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = window.location.origin;

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: STRIPE_PRICES.illimite,
          successUrl: `${baseUrl}/merci`,
          cancelUrl: `${baseUrl}/checkout/illimite`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Erreur lors de la création du paiement');
      }

      const { sessionId } = await res.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe non disponible');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Une erreur est survenue'
      );
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-purple-900/50 hover:shadow-purple-700/50 hover:-translate-y-0.5"
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
          <>Démarrer pour {price}{currency}{period ? `/${period}` : ''}</>
        )}
      </button>
      {error && (
        <p className="text-center text-sm text-red-400">{error}</p>
      )}
      <p className="text-center text-xs text-slate-500">
        Paiement sécurisé · Annulation à tout moment
      </p>
    </div>
  );
}
