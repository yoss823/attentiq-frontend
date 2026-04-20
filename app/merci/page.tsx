"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { activatePremium } from "@/lib/api";

export default function MerciPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("session_id") || "";
  const jobId = searchParams.get("jobId") || "";
  const videoUrl = searchParams.get("videoUrl") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Activation de votre accès premium...");

  const redirectUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (jobId) params.set("jobId", jobId);
    if (videoUrl) params.set("videoUrl", videoUrl);
    return params.toString() ? `/analyze?${params.toString()}` : "/analyze";
  }, [jobId, videoUrl]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!sessionId) {
        setStatus("error");
        setMessage("Session de paiement introuvable. Redirection vers l’analyse...");
        setTimeout(() => router.replace(redirectUrl), 2000);
        return;
      }

      try {
        await activatePremium(sessionId);
        if (cancelled) return;

        setStatus("success");
        setMessage("Paiement confirmé. Accès premium débloqué. Redirection...");
        setTimeout(() => router.replace(redirectUrl), 1200);
      } catch (error) {
        if (cancelled) return;
        const msg =
          error instanceof Error
            ? error.message
            : "Impossible d’activer votre accès premium.";
        setStatus("error");
        setMessage(`${msg} Redirection vers l’analyse...`);
        setTimeout(() => router.replace(redirectUrl), 2500);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [sessionId, redirectUrl, router]);

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {status === "loading" && "Confirmation du paiement"}
            {status === "success" && "Accès premium activé"}
            {status === "error" && "Activation incomplète"}
          </h1>
          <p className="mt-3 text-sm text-white/70">{message}</p>
          <button
            onClick={() => router.replace(redirectUrl)}
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-white text-black px-5 py-3 text-sm font-medium transition hover:bg-white/90"
          >
            Retourner à l’analyse
          </button>
        </div>
      </div>
    </main>
  );
}
