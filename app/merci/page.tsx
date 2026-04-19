"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { activatePremium } from "@/lib/api";

export default function MerciPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Vérification du paiement...");

  const sessionId = searchParams.get("session_id");
  const jobId = searchParams.get("jobId");
  const videoUrl = searchParams.get("videoUrl");

  const redirectUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (jobId) params.set("jobId", jobId);
    if (videoUrl) params.set("videoUrl", videoUrl);
    return `/analyze?${params.toString()}`;
  }, [jobId, videoUrl]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!sessionId || !jobId) {
        setStatus("error");
        setMessage("Paramètres manquants après le paiement.");
        return;
      }

      try {
        await activatePremium(sessionId, jobId);

        if (cancelled) return;

        setStatus("success");
        setMessage("Paiement confirmé. Redirection en cours...");

        setTimeout(() => {
          router.replace(redirectUrl);
        }, 1200);
      } catch (error) {
        console.error(error);

        if (cancelled) return;

        setStatus("error");
        setMessage("Impossible de confirmer le paiement.");
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [sessionId, jobId, redirectUrl, router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Merci</h1>

        <p className="text-white/80 mb-6">{message}</p>

        {status === "loading" && (
          <div className="animate-pulse text-sm text-white/60">
            Validation sécurisée du paiement...
          </div>
        )}

        {status === "success" && (
          <div className="text-green-400 text-sm">
            Accès premium activé.
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="text-red-400 text-sm">
              Une erreur est survenue.
            </div>

            <button
              onClick={() => router.replace("/analyze")}
              className="inline-flex items-center justify-center rounded-xl bg-white text-black px-4 py-2 font-medium hover:opacity-90"
            >
              Retour à l’analyse
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
