"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/lib/api";

interface PremiumPaywallProps {
  jobId: string;
  videoUrl: string;
}

export default function PremiumPaywall({
  jobId,
  videoUrl,
}: PremiumPaywallProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setError("");

    if (!jobId) {
      setError("Analyse introuvable. Veuillez relancer une analyse.");
      return;
    }

    if (!videoUrl) {
      setError("URL vidéo introuvable. Veuillez relancer une analyse.");
      return;
    }

    try {
      setLoading(true);

      const { url } = await createCheckoutSession({
        jobId,
        videoUrl,
      });

      if (!url) {
        throw new Error("Lien de paiement introuvable.");
      }

      window.location.href = url;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de lancer le paiement.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 md:p-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-1 text-xs font-medium text-fuchsia-200">
          Premium
        </div>

        <h2 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight text-white">
          Débloquez l’analyse complète
        </h2>

        <p className="mt-3 text-sm md:text-base text-white/70">
          Accédez immédiatement aux recommandations détaillées, aux moments forts,
          aux points de chute d’attention et à l’interprétation complète de votre vidéo.
        </p>

        <div className="mt-8 grid gap-3 text-left md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
            ✓ Analyse détaillée de la rétention
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
            ✓ Moments de drop et pics d’attention
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
            ✓ Recommandations concrètes
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
            ✓ Déblocage immédiat après paiement
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="inline-flex min-w-[240px] items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Redirection vers le paiement..." : "Payer et débloquer"}
          </button>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
