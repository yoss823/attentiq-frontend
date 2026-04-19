'use client';

import { useState } from 'react';
import { stripePromise } from '@/lib/stripe';

interface Props {
  /** Amount in euros (e.g. 25 → €25) */
  amountEur: number;
  label?: string;
}

export default function RechargeCheckoutButton({ amountEur, label }: Props) {
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
          intent: 'recharge',
          amount: amountEur * 100, // convert to cents
          successUrl: `${baseUrl}/merci`,
          cancelUrl: `${baseUrl}/recharge`,
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
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={loading}
        onClick={handleClick}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-amber-900/40 hover:shadow-amber-600/40 hover:-translate-y-0.5"
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
          <>{label ?? `Recharger ${amountEur} €`}</>
        )}
      </button>
      {error && <p className="text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}
