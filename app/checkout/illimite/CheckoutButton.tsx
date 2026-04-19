'use client';

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
  return (
    <div className="space-y-3">
      <button
        type="button"
        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-purple-900/50 hover:shadow-purple-700/50 hover:-translate-y-0.5"
        onClick={() => {
          // TODO: integrate Stripe / payment provider
          alert(
            `Abonnement ${planName} — ${price}${currency}/${period} (à intégrer)`
          );
        }}
      >
        Démarrer pour {price}{currency}/{period}
      </button>
      <p className="text-center text-xs text-slate-500">
        Paiement sécurisé · Annulation à tout moment
      </p>
    </div>
  );
}
