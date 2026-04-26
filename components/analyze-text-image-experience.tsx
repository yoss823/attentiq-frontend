"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AnalysisLoadingState from "@/components/analysis-loading-state";

type Mode = "text" | "image";

const API_BY_MODE: Record<Mode, string> = {
  text: "/api/analyze/text",
  image: "/api/analyze/image",
};

const PAYWALL_BY_MODE: Record<Mode, string> = {
  text: "/text#tarifs",
  image: "/images#tarifs",
};

type AnalyzeTextImageExperienceProps = {
  mode: Mode;
};

export default function AnalyzeTextImageExperience({
  mode,
}: AnalyzeTextImageExperienceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [paywallPath, setPaywallPath] = useState<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const jobId = searchParams.get("jobId");

  function startTimer() {
    startedAtRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - (startedAtRef.current ?? Date.now()));
    }, 300);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  const handleJobId = async (jId: string) => {
    setIsAnalyzing(true);
    setError(null);
    startTimer();

    try {
      const res = await fetch(`/api/analyze/${encodeURIComponent(jId)}`);
      const data = (await res.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;

      if (!res.ok) {
        setError(
          (typeof data?.userMessage === "string" && data.userMessage) ||
            "Impossible de recuperer le diagnostic."
        );
        return;
      }

      if (data?.status === "success" && data.result) {
        router.push(`/analyze/result?jobId=${encodeURIComponent(jId)}`);
        return;
      }

      if (data?.status === "error") {
        setError(
          (typeof data.userMessage === "string" && data.userMessage) ||
            (typeof data.error_message === "string" && data.error_message) ||
            "Analyse echouee."
        );
        return;
      }

      await new Promise((r) => setTimeout(r, 2000));
      void handleJobId(jId);
    } catch {
      setError("Impossible de recuperer le diagnostic. Reessayez.");
    } finally {
      stopTimer();
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      void handleJobId(jobId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  async function handleSubmitText(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setIsAnalyzing(true);
    setError(null);
    setPaywallPath(null);
    startTimer();

    try {
      const res = await fetch(API_BY_MODE.text, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = (await res.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;

      if (!res.ok) {
        setError(
          (typeof data?.userMessage === "string" && data.userMessage) ||
            "Erreur lors du lancement de l'analyse."
        );
        setPaywallPath(
          typeof data?.paywallPath === "string" ? data.paywallPath : null
        );
        return;
      }

      const newJobId = typeof data?.job_id === "string" ? data.job_id : null;
      if (newJobId) {
        stopTimer();
        setIsAnalyzing(false);
        router.push(
          `/text?jobId=${encodeURIComponent(newJobId)}`
        );
        return;
      }

      setError("Reponse inattendue du service. Reessayez.");
    } catch {
      setError("Impossible de joindre le service d'analyse.");
    } finally {
      stopTimer();
      setIsAnalyzing(false);
    }
  }

  async function handleSubmitImage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setPaywallPath(null);
    startTimer();

    try {
      const form = new FormData();
      form.append("file", selectedFile, selectedFile.name);

      const res = await fetch(API_BY_MODE.image, {
        method: "POST",
        body: form,
      });
      const data = (await res.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;

      if (!res.ok) {
        setError(
          (typeof data?.userMessage === "string" && data.userMessage) ||
            "Erreur lors de l'envoi de l'image."
        );
        setPaywallPath(
          typeof data?.paywallPath === "string" ? data.paywallPath : null
        );
        return;
      }

      const newJobId = typeof data?.job_id === "string" ? data.job_id : null;
      if (newJobId) {
        stopTimer();
        setIsAnalyzing(false);
        router.push(
          `/images?jobId=${encodeURIComponent(newJobId)}`
        );
        return;
      }

      setError("Reponse inattendue du service. Reessayez.");
    } catch {
      setError("Impossible de joindre le service d'analyse.");
    } finally {
      stopTimer();
      setIsAnalyzing(false);
    }
  }

  if (isAnalyzing) {
    return (
      <section
        style={{
          marginTop: "28px",
          padding: "28px 22px",
          borderRadius: "22px",
          border: "1px solid var(--border)",
          background:
            "linear-gradient(180deg, rgba(12, 17, 23, 0.92) 0%, rgba(7, 11, 16, 0.94) 100%)",
        }}
      >
        <AnalysisLoadingState
          elapsedMs={elapsedMs}
          headline="Analyse en cours."
          detail={
            mode === "text"
              ? "Attentiq lit votre texte et genere le diagnostic d'attention. En general quelques secondes."
              : "Attentiq analyse votre visuel et genere le diagnostic d'attention. En general quelques secondes."
          }
        />
      </section>
    );
  }

  return (
    <section
      style={{
        marginTop: "28px",
        padding: "28px 22px",
        borderRadius: "22px",
        border: "1px solid var(--border)",
        background:
          "linear-gradient(180deg, rgba(12, 17, 23, 0.92) 0%, rgba(7, 11, 16, 0.94) 100%)",
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontWeight: 800,
          color: "var(--accent)",
        }}
      >
        {mode === "text" ? "Essai gratuit texte" : "Essai gratuit image"}
      </p>
      <h2
        style={{
          margin: "0 0 12px",
          fontSize: "1.35rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--text-primary)",
        }}
      >
        {mode === "text"
          ? "Collez un texte a auditer"
          : "Envoyez une image a auditer"}
      </h2>
      <p
        style={{
          margin: "0 0 20px",
          fontSize: "14px",
          lineHeight: 1.7,
          color: "var(--text-secondary)",
        }}
      >
        Meme moteur que la video : diagnostic dominant, mini-dashboard et 3
        actions. Un essai gratuit par format.
      </p>

      {mode === "text" ? (
        <form onSubmit={handleSubmitText}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Votre accroche, post, script, email..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: "14px",
              border: "1px solid var(--border)",
              background: "rgba(5, 9, 14, 0.65)",
              color: "var(--text-primary)",
              padding: "14px 16px",
              fontSize: "14px",
              lineHeight: 1.6,
              resize: "vertical",
              marginBottom: "14px",
            }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 22px",
              borderRadius: "999px",
              border: "none",
              cursor: text.trim() ? "pointer" : "not-allowed",
              opacity: text.trim() ? 1 : 0.45,
              background: "linear-gradient(135deg, var(--accent), #79e7ff)",
              color: "#041017",
              fontSize: "14px",
              fontWeight: 900,
            }}
          >
            Lancer l&apos;analyse texte
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmitImage}>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setSelectedFile(f);
            }}
            style={{ marginBottom: "14px", color: "var(--text-secondary)" }}
          />
          <button
            type="submit"
            disabled={!selectedFile}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 22px",
              borderRadius: "999px",
              border: "none",
              cursor: selectedFile ? "pointer" : "not-allowed",
              opacity: selectedFile ? 1 : 0.45,
              background: "linear-gradient(135deg, var(--accent), #79e7ff)",
              color: "#041017",
              fontSize: "14px",
              fontWeight: 900,
            }}
          >
            Lancer l&apos;analyse image
          </button>
        </form>
      )}

      {error ? (
        <p
          style={{
            marginTop: "16px",
            fontSize: "14px",
            color: "#fca5a5",
            lineHeight: 1.6,
          }}
        >
          {error}{" "}
          <Link
            href={paywallPath ?? PAYWALL_BY_MODE[mode]}
            style={{ color: "var(--accent)", fontWeight: 700 }}
          >
            Voir les tarifs
          </Link>
        </p>
      ) : null}
    </section>
  );
}
