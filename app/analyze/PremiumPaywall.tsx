"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/lib/api";

type PremiumPaywallProps = {
  jobId?: string;
  videoUrl?: string;
};

export default function PremiumPaywall({
  jobId,
  videoUrl,
}: PremiumPaywallProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!jobId) {
      alert("Job introuvable. Relance l'analyse avant de continuer.");
      return;
    }

    try {
      setLoading(true);

      const { url } = await createCheckoutSession({
        plan: "single",
        jobId,
        videoUrl,
      });

      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Impossible de lancer le paiement. Réessaie dans quelques secondes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          Débloquer le rapport complet
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Accède à l’analyse premium complète pour cette vidéo.
        </p>
      </div>

      <div className="mb-6 rounded-xl bg-neutral-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Rapport complet</span>
          <span className="text-lg font-bold text-neutral-900">19€</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Redirection vers Stripe..." : "Payer et débloquer"}
      </button>
    </div>
  );
}
