'use client';

export default function CheckoutButton({
  planName,
  price,
  currency,
}: {
  planName: string;
  price: number;
  currency: string;
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-brand-900/50 hover:shadow-brand-700/50 hover:-translate-y-0.5"
        onClick={() => {
          // TODO: integrate Stripe / payment provider
          alert(`Paiement pour ${planName} — ${price}${currency} (à intégrer)`);
        }}
      >
        Payer {price}{currency} — {planName}
      </button>
      <p className="text-center text-xs text-slate-500">
        Paiement sécurisé · Satisfait ou remboursé 7 jours
      </p>
    </div>
  );
}
