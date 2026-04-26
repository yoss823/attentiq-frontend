"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnalysisLoadingState from "@/components/analysis-loading-state";
import { persistAnalyzeResult } from "@/lib/analyze-session";

const ANALYZE_ROUTE = "/api/analyze";
const UPLOAD_ROUTE = "/api/analyze/upload";

type InputMode = "url" | "upload";

type AnalyzeExperienceProps = {
  initialJobId?: string | null;
  initialVideoUrl?: string | null;
  initialPaid?: boolean;
};

export default function AnalyzeExperience({
  initialJobId = null,
  initialVideoUrl = null,
  initialPaid = false,
}: AnalyzeExperienceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [videoUrl, setVideoUrl] = useState(
    initialVideoUrl ?? searchParams.get("videoUrl") ?? searchParams.get("url") ?? ""
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [needsUpload, setNeedsUpload] = useState(false);
  const [paywallPath, setPaywallPath] = useState<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const jobId = initialJobId ?? searchParams.get("jobId");
  const paid = initialPaid || searchParams.get("paid") === "1";

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
      const data = await res.json();

      if (!res.ok) {
        setError(
          (typeof data.userMessage === "string" && data.userMessage) ||
            "Impossible de recuperer le diagnostic."
        );
        setNeedsUpload(Boolean(data.needsUpload));
        return;
      }

      if (data.status === "success" && data.result) {
        const report = data.result;
        persistAnalyzeResult({ report, url: videoUrl || "", jobId: jId });
        router.push(`/analyze/result?jobId=${jId}`);
        return;
      }

      if (data.status === "error") {
        setError(data.userMessage ?? "Analyse echouee.");
        setNeedsUpload(data.needsUpload ?? false);
        return;
      }

      // Still processing — poll
      await new Promise((r) => setTimeout(r, 4000));
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUrl = videoUrl.trim();
    if (!trimmedUrl) return;

    setIsAnalyzing(true);
    setError(null);
    setNeedsUpload(false);
    setPaywallPath(null);
    startTimer();

    try {
      const res = await fetch(ANALYZE_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.userMessage ?? "Erreur lors du lancement de l'analyse.");
        setNeedsUpload(data.needsUpload ?? false);
        setPaywallPath(
          typeof data.paywallPath === "string" ? data.paywallPath : null
        );
        return;
      }

      const newJobId = typeof data.job_id === "string" ? data.job_id : null;

      if (newJobId) {
        stopTimer();
        setIsAnalyzing(false);
        router.push(`/analyze/result?jobId=${newJobId}&videoUrl=${encodeURIComponent(trimmedUrl)}`);
        return;
      }

      // Fallback: direct report in response
      if (data.report) {
        persistAnalyzeResult({ report: data.report, url: trimmedUrl });
        router.push(`/analyze/result?videoUrl=${encodeURIComponent(trimmedUrl)}`);
        return;
      }

      setError("Reponse inattendue du service. Reessayez.");
    } catch {
      setError("Impossible de joindre le service d'analyse. Verifiez votre connexion.");
    } finally {
      stopTimer();
      setIsAnalyzing(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setNeedsUpload(false);
    setPaywallPath(null);
    startTimer();

    try {
      const form = new FormData();
      form.append("file", selectedFile, selectedFile.name);

      const res = await fetch(UPLOAD_ROUTE, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.userMessage ?? "Erreur lors de l'upload de la video.");
        setPaywallPath(
          typeof data.paywallPath === "string" ? data.paywallPath : null
        );
        return;
      }

      const newJobId = typeof data.job_id === "string" ? data.job_id : null;

      if (newJobId) {
        stopTimer();
        setIsAnalyzing(false);
        router.push(`/analyze/result?jobId=${newJobId}`);
        return;
      }

      // Fallback: direct report in response
      if (data.report) {
        persistAnalyzeResult({ report: data.report, url: selectedFile.name });
        router.push(`/analyze/result`);
        return;
      }

      setError("Reponse inattendue du service. Reessayez.");
    } catch {
      setError("Impossible de joindre le service d'analyse. Verifiez votre connexion.");
    } finally {
      stopTimer();
      setIsAnalyzing(false);
    }
  }

  if (isAnalyzing) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          background:
            "radial-gradient(circle at top, rgba(0, 212, 255, 0.16), transparent 24%), var(--bg-base)",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "560px",
          }}
        >
          <AnalysisLoadingState
            elapsedMs={elapsedMs}
            headline="Analyse en cours."
            detail="Attentiq telecharge la video (yt-dlp), transcrit l'audio et genere votre diagnostic. Cela prend generalement 60 a 90 secondes."
          />
        </section>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.14), transparent 28%), radial-gradient(circle at 82% 16%, rgba(251, 146, 60, 0.08), transparent 18%), var(--bg-base)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.18) 68%, transparent 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "760px",
          margin: "0 auto",
          padding: "28px 16px 64px",
        }}
      >
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(0, 212, 255, 0.1)",
                border: "1px solid rgba(0, 212, 255, 0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.1em",
                color: "var(--accent)",
              }}
            >
              AT
            </div>
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Attentiq
            </span>
          </Link>

          <Link
            href="/guide"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            Comment ca marche
          </Link>
        </nav>

        {paid && (
          <div
            style={{
              marginBottom: "18px",
              padding: "14px 16px",
              borderRadius: "18px",
              border: "1px solid rgba(52, 211, 153, 0.24)",
              background: "rgba(52, 211, 153, 0.08)",
              color: "#86efac",
              fontSize: "14px",
              lineHeight: 1.7,
            }}
          >
            Paiement confirme — le rapport complet est maintenant debloque sur
            cette analyse.
          </div>
        )}

        <section
          style={{
            borderRadius: "30px",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            background:
              "linear-gradient(180deg, rgba(11, 16, 22, 0.98) 0%, rgba(7, 11, 16, 0.96) 100%)",
            padding: "28px 22px",
            boxShadow: "0 32px 120px rgba(0, 0, 0, 0.34)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "999px",
              background: "rgba(0, 212, 255, 0.08)",
              border: "1px solid rgba(0, 212, 255, 0.18)",
              marginBottom: "18px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "999px",
                background: "var(--accent)",
                boxShadow: "0 0 12px var(--accent-glow)",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "var(--accent)",
              }}
            >
              Diagnostic gratuit
            </span>
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "clamp(1.9rem, 7vw, 3.2rem)",
              lineHeight: 0.96,
              letterSpacing: "-0.07em",
              color: "var(--text-primary)",
            }}
          >
            Analysez une video courte.
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              fontSize: "15px",
              lineHeight: 1.8,
              color: "rgba(237, 242, 247, 0.8)",
              maxWidth: "38rem",
            }}
          >
            {inputMode === "url"
              ? "Collez une URL publique : TikTok, YouTube Shorts, Reel Instagram ou Snapchat Spotlight. La video doit durer moins de 60 secondes. En 60 a 90 secondes : aperçu gratuit limite (2 a 3 points max.) ; rapport complet avec une offre payante."
              : "Importez votre fichier (MP4, MOV, WebM), moins de 60 secondes. En 60 a 90 secondes : aperçu gratuit limite (2 a 3 points max.) ; rapport complet avec une offre payante."}
          </p>

          {/* Mode toggle */}
          <div
            style={{
              display: "inline-flex",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              padding: "3px",
              marginBottom: "18px",
              gap: "2px",
            }}
          >
            {(["url", "upload"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setInputMode(mode);
                  setError(null);
                  setNeedsUpload(false);
                }}
                style={{
                  padding: "7px 18px",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  background:
                    inputMode === mode
                      ? "rgba(0, 212, 255, 0.14)"
                      : "transparent",
                  color:
                    inputMode === mode
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  boxShadow:
                    inputMode === mode
                      ? "0 0 0 1px rgba(0, 212, 255, 0.22)"
                      : "none",
                }}
              >
                {mode === "url" ? "URL" : "Upload"}
              </button>
            ))}
          </div>

          {inputMode === "url" ? (
            <>
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                  }}
                >
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/... ou youtube.com/shorts/..."
                    required
                    style={{
                      minHeight: "54px",
                      borderRadius: "18px",
                      border: "1px solid var(--border)",
                      background: "rgba(5, 9, 14, 0.78)",
                      color: "var(--text-primary)",
                      fontSize: "15px",
                      padding: "0 16px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isAnalyzing || !videoUrl.trim()}
                    style={{
                      minHeight: "54px",
                      borderRadius: "999px",
                      border: "none",
                      padding: "0 22px",
                      background:
                        isAnalyzing || !videoUrl.trim()
                          ? "rgba(255,255,255,0.08)"
                          : "linear-gradient(135deg, var(--accent), #79e7ff)",
                      color:
                        isAnalyzing || !videoUrl.trim()
                          ? "var(--text-secondary)"
                          : "#041017",
                      fontSize: "15px",
                      fontWeight: 900,
                      cursor:
                        isAnalyzing || !videoUrl.trim() ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                      boxShadow:
                        isAnalyzing || !videoUrl.trim()
                          ? "none"
                          : "0 18px 52px rgba(0, 212, 255, 0.18)",
                    }}
                  >
                    Analyser →
                  </button>
                </div>
              </form>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "12px",
                  lineHeight: 1.5,
                  color: "var(--text-muted)",
                }}
              >
                La video source doit faire moins de 60 secondes (Short, Reel,
                extrait).
              </p>
            </>
          ) : (
            <form onSubmit={handleUpload}>
              <div style={{ display: "grid", gap: "12px" }}>
                {/* Hidden native file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setSelectedFile(file);
                    setError(null);
                  }}
                />

                {/* Custom file picker row */}
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      minHeight: "54px",
                      borderRadius: "18px",
                      border: "1px solid var(--border)",
                      background: "rgba(5, 9, 14, 0.78)",
                      color: selectedFile
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                      fontSize: "15px",
                      padding: "0 16px",
                      textAlign: "left",
                      cursor: "pointer",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedFile
                      ? selectedFile.name
                      : "Choisir un fichier video…"}
                  </button>

                  <button
                    type="submit"
                    disabled={isAnalyzing || !selectedFile}
                    style={{
                      minHeight: "54px",
                      borderRadius: "999px",
                      border: "none",
                      padding: "0 22px",
                      background:
                        isAnalyzing || !selectedFile
                          ? "rgba(255,255,255,0.08)"
                          : "linear-gradient(135deg, var(--accent), #79e7ff)",
                      color:
                        isAnalyzing || !selectedFile
                          ? "var(--text-secondary)"
                          : "#041017",
                      fontSize: "15px",
                      fontWeight: 900,
                      cursor:
                        isAnalyzing || !selectedFile ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                      boxShadow:
                        isAnalyzing || !selectedFile
                          ? "none"
                          : "0 18px 52px rgba(0, 212, 255, 0.18)",
                    }}
                  >
                    Analyser →
                  </button>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  Formats acceptes : MP4, MOV, WebM · Max 500 Mo · Max 60 s
                </p>
              </div>
            </form>
          )}

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px 16px",
                borderRadius: "18px",
                border: "1px solid rgba(251, 146, 60, 0.28)",
                background: "rgba(251, 146, 60, 0.08)",
                color: "#fdba74",
                fontSize: "14px",
                lineHeight: 1.7,
              }}
            >
              {error}
              {needsUpload && (
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("upload");
                    setError(null);
                    setNeedsUpload(false);
                    setPaywallPath(null);
                  }}
                  style={{
                    display: "block",
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "var(--accent)",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Passer en mode Upload →
                </button>
              )}
              {paywallPath && (
                <Link
                  href={paywallPath}
                  style={{
                    display: "block",
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "var(--accent)",
                    textDecoration: "underline",
                  }}
                >
                  Debloquer une offre →
                </Link>
              )}
            </div>
          )}

          <p
            style={{
              marginTop: "16px",
              fontSize: "12px",
              lineHeight: 1.6,
              color: "var(--text-muted)",
            }}
          >
            Vos donnees ne sont pas stockees.{" "}
            <Link
              href="/transparence"
              style={{ color: "var(--text-secondary)", textDecoration: "none" }}
            >
              En savoir plus
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
