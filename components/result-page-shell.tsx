"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AnalysisLoadingState from "@/components/analysis-loading-state";
import ResultReport from "@/components/result-report";
import { persistAnalyzeResult, readAnalyzeResult } from "@/lib/analyze-session";
import type { PremiumEntitlement } from "@/lib/premium";
import type { AttentiqReport, RailwayResponse } from "@/lib/railway-client";
import type { V2AnalysisResult } from "@/lib/v2-types";

type ResultPageShellProps = {
  expectStoredResult?: boolean;
  expectedReportJobId?: string | null;
  expectedVideoUrl?: string | null;
  initialPremiumEntitlement?: PremiumEntitlement | null;
  initialMessage?: {
    title: string;
    message: string;
  } | null;
  initialReport?: AttentiqReport | null;
  initialReportJobId?: string | null;
};

function isV2AnalysisResult(value: unknown): value is V2AnalysisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<V2AnalysisResult>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.analysedAt === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.pipelineVersion === "string" &&
    Boolean(candidate.diagnostic && typeof candidate.diagnostic === "object") &&
    Array.isArray(candidate.dashboard) &&
    Array.isArray(candidate.actions)
  );
}

function buildLegacyReportFromV2(result: V2AnalysisResult): AttentiqReport {
  const retentionScore = Math.max(
    0,
    Math.min(10, Number((result.diagnostic.score * 10).toFixed(1)))
  );
  const actions = result.actions
    .map((action) => action.label?.trim())
    .filter((label): label is string => Boolean(label));
  const metadata: RailwayResponse["metadata"] = {
    url: result.sourceUrl ?? "",
    platform: result.sourcePlatform ?? "unknown",
    author: "attentiq",
    title: "Diagnostic d'attention",
    duration_seconds: result.durationSeconds ?? 0,
    hashtags: [],
  };

  const response: RailwayResponse = {
    request_id: result.id,
    status: "success",
    metadata,
    diagnostic: {
      retention_score: retentionScore,
      global_summary: result.diagnostic.explanation,
      drop_off_rule: `Diagnostic dominant: ${result.diagnostic.label.replace(
        /_/g,
        " "
      )}`,
      creator_perception:
        "Ce diagnostic est genere automatiquement a partir du format envoye.",
      audience_loss_estimate: "Estimation fournie par le moteur V2.",
      corrective_actions: actions.slice(0, 3),
      attention_drops: [],
    },
  };

  return {
    text: result.diagnostic.explanation,
    data: response,
    partial: false,
  };
}

function matchesExpectedStoredResult({
  storedJobId,
  storedVideoUrl,
  expectedReportJobId,
  expectedVideoUrl,
}: {
  storedJobId: string | null;
  storedVideoUrl: string | null;
  expectedReportJobId: string | null;
  expectedVideoUrl: string | null;
}) {
  if (expectedReportJobId && storedJobId === expectedReportJobId) {
    return true;
  }

  if (expectedVideoUrl && storedVideoUrl === expectedVideoUrl) {
    return true;
  }

  return !expectedReportJobId && !expectedVideoUrl;
}

function ResultState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background:
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.12), transparent 28%), var(--bg-base)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "560px",
          padding: "28px",
          borderRadius: "26px",
          border: "1px solid var(--border)",
          background:
            "linear-gradient(180deg, rgba(12, 17, 23, 0.95) 0%, rgba(7, 11, 16, 0.96) 100%)",
          boxShadow: "0 24px 80px rgba(3, 8, 14, 0.34)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            fontWeight: 700,
            color: "var(--accent)",
          }}
        >
          RetentionScan / Result
        </p>
        <h1
          style={{
            margin: "12px 0 0",
            fontSize: "clamp(1.9rem, 7vw, 2.9rem)",
            lineHeight: 0.98,
            letterSpacing: "-0.06em",
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: "15px",
            lineHeight: 1.8,
            color: "var(--text-secondary)",
          }}
        >
          {message}
        </p>

        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/analyze"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "999px",
              padding: "13px 20px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 800,
              background: "linear-gradient(135deg, var(--accent), #7ae8ff)",
              color: "#041017",
            }}
          >
            Analyser une video
          </Link>
          <Link
            href="/guide"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            Comprendre ce rapport
          </Link>
        </div>
      </section>
    </main>
  );
}

function ResultLoadingState() {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 300);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background:
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.16), transparent 26%), var(--bg-base)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "560px",
          textAlign: "left",
        }}
      >
        <AnalysisLoadingState
          elapsedMs={elapsedMs}
          headline="Nous recuperons votre rapport."
          detail="Le diagnostic vient d'etre genere. Cette etape ne dure generalement que quelques secondes."
        />
      </section>
    </main>
  );
}

export default function ResultPageShell({
  expectStoredResult = false,
  expectedReportJobId = null,
  expectedVideoUrl = null,
  initialPremiumEntitlement = null,
  initialMessage = null,
  initialReport = null,
  initialReportJobId = null,
}: ResultPageShellProps) {
  const [storedReport, setStoredReport] = useState<AttentiqReport | null>(
    initialReport
  );
  const [storedReportJobId, setStoredReportJobId] = useState<string | null>(
    initialReportJobId
  );
  const [hasResolvedStoredResult, setHasResolvedStoredResult] = useState(
    !expectStoredResult || Boolean(initialReport) || Boolean(initialMessage)
  );
  const [runtimeMessage, setRuntimeMessage] = useState<{
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!expectStoredResult || initialReport || initialMessage) {
      return;
    }

    const timerId = window.setTimeout(() => {
      const stored = readAnalyzeResult();
      const matchesStoredResult = matchesExpectedStoredResult({
        storedJobId: stored?.jobId ?? null,
        storedVideoUrl: stored?.url ?? null,
        expectedReportJobId,
        expectedVideoUrl,
      });

      setStoredReport(matchesStoredResult ? stored?.report ?? null : null);
      setStoredReportJobId(matchesStoredResult ? stored?.jobId ?? null : null);
      setHasResolvedStoredResult(true);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    expectStoredResult,
    expectedReportJobId,
    expectedVideoUrl,
    initialMessage,
    initialReport,
  ]);

  useEffect(() => {
    if (!expectStoredResult || storedReport || !hasResolvedStoredResult) {
      return;
    }

    if (!expectedReportJobId) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30;

    async function pollJobResult() {
      while (!cancelled && attempts < maxAttempts) {
        attempts += 1;
        try {
          const response = await fetch(
            `/api/analyze/${encodeURIComponent(expectedReportJobId)}`,
            { cache: "no-store" }
          );
          const data = (await response.json().catch(() => null)) as
            | {
                status?: string;
                result?: unknown;
                userMessage?: string;
              }
            | null;

          if (!response.ok) {
            if (!cancelled) {
              setRuntimeMessage({
                title: "Diagnostic indisponible",
                message:
                  data?.userMessage ??
                  "Le diagnostic n'est pas disponible pour le moment. Relancez une analyse.",
              });
            }
            return;
          }

          if (data?.status === "success" && data.result) {
            if (!cancelled) {
              if (isV2AnalysisResult(data.result)) {
                setStoredReport(buildLegacyReportFromV2(data.result));
              } else {
                setStoredReport(data.result as AttentiqReport);
              }
              setStoredReportJobId(expectedReportJobId);
              persistAnalyzeResult({
                report: isV2AnalysisResult(data.result)
                  ? buildLegacyReportFromV2(data.result)
                  : (data.result as AttentiqReport),
                url: expectedVideoUrl ?? "",
                jobId: expectedReportJobId,
              });
            }
            return;
          }

          if (data?.status === "error") {
            if (!cancelled) {
              setRuntimeMessage({
                title: "Analyse interrompue",
                message:
                  data?.userMessage ??
                  "Cette analyse a echoue. Reessayez avec une autre URL ou via upload.",
              });
            }
            return;
          }
        } catch {
          // Continue retry loop to absorb transient network errors.
        }

        await new Promise((resolve) => {
          window.setTimeout(resolve, 2000);
        });
      }

      if (!cancelled) {
        setRuntimeMessage({
          title: "Temps d'attente depasse",
          message:
            "Le diagnostic prend plus de temps que prevu. Reessayez dans quelques secondes.",
        });
      }
    }

    void pollJobResult();

    return () => {
      cancelled = true;
    };
  }, [
    expectStoredResult,
    storedReport,
    hasResolvedStoredResult,
    expectedReportJobId,
    expectedVideoUrl,
  ]);

  const isResolvingFromJobId =
    expectStoredResult &&
    hasResolvedStoredResult &&
    Boolean(expectedReportJobId) &&
    !storedReport &&
    !runtimeMessage;

  if (storedReport) {
    return (
      <ResultReport
        report={storedReport}
        initialPremiumEntitlement={initialPremiumEntitlement}
        reportJobId={storedReportJobId}
      />
    );
  }

  if (!hasResolvedStoredResult) {
    return <ResultLoadingState />;
  }

  if (isResolvingFromJobId) {
    return <ResultLoadingState />;
  }

  if (runtimeMessage) {
    return (
      <ResultState
        title={runtimeMessage.title}
        message={runtimeMessage.message}
      />
    );
  }

  if (initialMessage) {
    return (
      <ResultState
        title={initialMessage.title}
        message={initialMessage.message}
      />
    );
  }

  return (
    <ResultState
      title="Aucune URL a analyser"
      message="Collez une URL publique TikTok sur la page d'analyse pour generer un rapport complet."
    />
  );
}
