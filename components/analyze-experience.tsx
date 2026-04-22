"use client";

import Link from "next/link";
import {
  startTransition,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import AnalysisLoadingState from "@/components/analysis-loading-state";
import ResultReport from "@/components/result-report";
import PremiumPaywall from "@/app/analyze/PremiumPaywall";
import {
  computeLightFingerprint,
  isFreeDiagnosticBlocked,
  markFreeDiagnosticUsed,
} from "@/lib/access-state";
import { buildResultHref } from "@/lib/checkout-context";
import { hasSubscriptionAccess, type PremiumEntitlement } from "@/lib/premium";
import { ATTENTIQ_OFFERS } from "@/lib/offer-config";
import {
  formatAttentiqReport,
  type AttentiqReport,
  type RailwayResponse,
} from "@/lib/railway-client";
import { persistAnalyzeResult } from "@/lib/analyze-session";
import { validateTikTokUrl } from "@/lib/url-intake";

const ANALYZE_API_ENDPOINT = "/api/analyze";
const CLIENT_TIMEOUT_MS = 150_000;
const POLL_INTERVAL_MS = 5_000;
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const TIMEOUT_MESSAGE =
  "L'analyse prend plus longtemps que prevu. Reessayez dans quelques instants.";

type AnalyzeJobSnapshot = {
  job_id?: string;
  status?: string;
  progress?: string;
  message?: string;
  result?: RailwayResponse;
  error_code?: string;
  error_message?: string;
};

type AnalyzeExperienceProps = {
  initialJobId?: string | null;
  initialPaid?: boolean;
  initialPremiumEntitlement?: PremiumEntitlement | null;
  initialVideoUrl?: string | null;
  railwayBaseUrl?: string | null;
};

function normalizeString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

class NeedsUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NeedsUploadError";
  }
}

function parseErrorDetail(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  if ("detail" in payload && typeof payload.detail === "string") {
    return payload.detail;
  }

  if ("userMessage" in payload && typeof payload.userMessage === "string") {
    return payload.userMessage;
  }

  if ("error_message" in payload && typeof payload.error_message === "string") {
    return payload.error_message;
  }

  return "";
}

function parseErrorCode(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  if ("error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  if ("error_code" in payload && typeof payload.error_code === "string") {
    return payload.error_code;
  }

  return "";
}

function parseNeedsUpload(payload: unknown) {
  return Boolean(
    payload &&
      typeof payload === "object" &&
      "needsUpload" in payload &&
      payload.needsUpload
  );
}

function mapAnalyzeError(status: number, payload: unknown) {
  const code = parseErrorCode(payload);
  const detail = parseErrorDetail(payload);

  if (
    code === "INVALID_URL" ||
    code === "UNSUPPORTED_URL" ||
    code === "UNSUPPORTED_TIKTOK_PATH" ||
    code === "URL_UNRESOLVABLE" ||
    code === "DOWNLOAD_FAILED"
  ) {
    return detail;
  }

  if (status === 404 || code === "VIDEO_UNAVAILABLE") {
    return "Video inaccessible ou supprimee. Verifiez que l'URL pointe vers une video publique.";
  }

  if (status === 422 || code === "DURATION_EXCEEDED") {
    return detail || "Video trop longue. Attentiq s'arrete actuellement aux videos de 60 secondes maximum.";
  }

  if (status === 429 || code === "RATE_LIMITED") {
    return detail || "Le service URL beta est temporairement indisponible. Importez la video directement.";
  }

  if (status === 504 || code === "TIMEOUT") {
    return TIMEOUT_MESSAGE;
  }

  return detail || "Une erreur est survenue. Reessayez dans quelques instants.";
}

function mapJobStatusError(status: number, payload: unknown) {
  const detail = parseErrorDetail(payload);
  const code = parseErrorCode(payload);

  if (status === 404) {
    return "Ce job est introuvable ou a expire. Relancez l'analyse depuis la video d'origine.";
  }

  if (status === 504 || code === "TIMEOUT") {
    return TIMEOUT_MESSAGE;
  }

  return detail || "Impossible de restaurer ce diagnostic pour le moment.";
}

function mapPollError(
  errorCode: string | undefined,
  errorMessage: string | undefined
) {
  if (errorCode === "VIDEO_UNAVAILABLE") {
    return "Video inaccessible ou supprimee. Verifiez que l'URL est correcte et publique.";
  }

  if (errorCode === "DURATION_EXCEEDED") {
    return "Video trop longue. Attentiq Sprint 1 s'arrete a 60 secondes.";
  }

  return errorMessage || "Une erreur est survenue. Reessayez dans quelques instants.";
}

async function fetchJobSnapshot(
  jobId: string,
  signal: AbortSignal
): Promise<AnalyzeJobSnapshot> {
  const response = await fetch(`${ANALYZE_API_ENDPOINT}/${jobId}`, { signal });
  const data = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (!data) {
    throw new Error("Le service d'analyse a renvoye une reponse inattendue.");
  }

  if (!response.ok) {
    if (parseNeedsUpload(data)) {
      throw new NeedsUploadError(mapJobStatusError(response.status, data));
    }
    throw new Error(mapJobStatusError(response.status, data));
  }

  return data as AnalyzeJobSnapshot;
}

function resolveReportVideoUrl(
  railwayResult: RailwayResponse,
  fallbackVideoUrl: string | null
) {
  return normalizeString(railwayResult.metadata?.url) ?? fallbackVideoUrl;
}

function readAnalyzeSearchStateFromWindow() {
  if (typeof window === "undefined") {
    return {
      jobId: null,
      paid: false,
      videoUrl: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    jobId: normalizeString(params.get("jobId")),
    paid: params.get("paid") === "1",
    videoUrl:
      normalizeString(params.get("videoUrl")) ?? normalizeString(params.get("url")),
  };
}

async function pollJobResult(
  jobId: string,
  signal: AbortSignal,
  onProgress?: (snapshot: AnalyzeJobSnapshot) => void
): Promise<RailwayResponse> {
  while (true) {
    const data = await fetchJobSnapshot(jobId, signal);

    if (data.status === "success") {
      return (data.result ?? data) as RailwayResponse;
    }

    if (data.status === "error") {
      throw new Error(
        mapPollError(
          data.error_code as string | undefined,
          data.error_message as string | undefined
        )
      );
    }

    onProgress?.(data);

    await new Promise<void>((resolve, reject) => {
      const timerId = window.setTimeout(resolve, POLL_INTERVAL_MS);
      signal.addEventListener(
        "abort",
        () => {
          window.clearTimeout(timerId);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true }
      );
    });
  }
}

const URL_EXAMPLES = [
  "https://www.tiktok.com/@compte/video/1234567890123456789",
  "https://vm.tiktok.com/ZMxxxxxxx/",
];

function buildUploadPseudoUrl(fileName: string) {
  const safeFileName = fileName.trim() || "video";
  return `upload://${safeFileName}`;
}

function isUploadSource(value: string | null | undefined) {
  return Boolean(value && value.startsWith("upload://"));
}

export default function AnalyzeExperience({
  initialJobId = null,
  initialPaid = false,
  initialPremiumEntitlement = null,
  initialVideoUrl = null,
  railwayBaseUrl = null,
}: AnalyzeExperienceProps) {
  const router = useRouter();
  const requestControllerRef = useRef<AbortController | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const uploadSectionRef = useRef<HTMLElement | null>(null);
  const [url, setUrl] = useState(initialVideoUrl ?? "");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [uploadNudgeMessage, setUploadNudgeMessage] = useState("");
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRestoringKnownJob, setIsRestoringKnownJob] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isGateResolved, setIsGateResolved] = useState(false);
  const [hasFreeLimit, setHasFreeLimit] = useState(false);
  const [knownJobId, setKnownJobId] = useState<string | null>(initialJobId);
  const [knownVideoUrl, setKnownVideoUrl] = useState<string | null>(initialVideoUrl);
  const [paidFlag, setPaidFlag] = useState(initialPaid);
  const [knownJobProgress, setKnownJobProgress] = useState<string | null>(null);
  const [knownJobMessage, setKnownJobMessage] = useState(
    initialPaid ? "Paiement confirme. Restauration du diagnostic en cours." : ""
  );
  const [knownJobErrorMessage, setKnownJobErrorMessage] = useState("");
  const [restoredReport, setRestoredReport] = useState<AttentiqReport | null>(null);
  const [restoredReportJobId, setRestoredReportJobId] = useState<string | null>(
    initialJobId
  );

  const syncElapsed = useEffectEvent((startedAt: number) => {
    setElapsedMs(Date.now() - startedAt);
  });

  useEffect(() => {
    router.prefetch("/result");
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    void computeLightFingerprint()
      .then((value) => {
        if (!isMounted) {
          return;
        }

        setFingerprint(value);
        setHasFreeLimit(isFreeDiagnosticBlocked(value));
      })
      .finally(() => {
        if (isMounted) {
          setIsGateResolved(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if ((!isSubmitting && !isRestoringKnownJob) || startedAtRef.current == null) {
      return undefined;
    }

    const startedAt = startedAtRef.current;
    syncElapsed(startedAt);

    const intervalId = window.setInterval(() => {
      syncElapsed(startedAt);
    }, 300);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRestoringKnownJob, isSubmitting]);

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort();
    };
  }, []);

  const focusUploadFallback = useCallback((message: string) => {
    setUploadNudgeMessage(message);
    uploadSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const restoreKnownJob = useCallback(
    async (jobId: string, fallbackVideoUrl: string | null, isPaidContext: boolean) => {
      const normalizedJobId = normalizeString(jobId);
      const normalizedVideoUrl = normalizeString(fallbackVideoUrl);

      if (!normalizedJobId) {
        return;
      }

      requestControllerRef.current?.abort();
      const controller = new AbortController();
      requestControllerRef.current = controller;

      setKnownJobId(normalizedJobId);
      setKnownVideoUrl(normalizedVideoUrl);
      setKnownJobErrorMessage("");
      setKnownJobProgress("initializing");
      setKnownJobMessage(
        isPaidContext
          ? "Paiement confirme. Restauration du diagnostic en cours."
          : "Restauration du diagnostic en cours."
      );
      setErrorMessage("");
      setRestoredReport(null);
      setRestoredReportJobId(normalizedJobId);
      setIsRestoringKnownJob(true);
      setElapsedMs(0);
      startedAtRef.current = Date.now();

      try {
        const snapshot = await fetchJobSnapshot(normalizedJobId, controller.signal);
        setKnownJobProgress(snapshot.progress ?? null);
        setKnownJobMessage(
          snapshot.message ??
            (isPaidContext
              ? "Paiement confirme. Restauration du diagnostic en cours."
              : "Reprise du polling du diagnostic."
            )
        );

        const railwayResult =
          snapshot.status === "processing"
            ? await pollJobResult(normalizedJobId, controller.signal, (pollSnapshot) => {
                setKnownJobProgress(pollSnapshot.progress ?? null);
                setKnownJobMessage(
                  pollSnapshot.message ?? "Le diagnostic continue a se preparer."
                );
              })
            : snapshot.status === "success"
              ? ((snapshot.result ?? snapshot) as RailwayResponse)
              : null;

        if (!railwayResult) {
          throw new Error(
            mapPollError(snapshot.error_code, snapshot.error_message ?? snapshot.message)
          );
        }

        const report = formatAttentiqReport(railwayResult);

        if (railwayResult.status === "error") {
          throw new Error(report.text);
        }

        const resolvedVideoUrl = resolveReportVideoUrl(
          railwayResult,
          normalizedVideoUrl
        );
        const storageUrl = resolvedVideoUrl ?? normalizedVideoUrl ?? "";

        if (resolvedVideoUrl) {
          setKnownVideoUrl(resolvedVideoUrl);
          if (!isUploadSource(resolvedVideoUrl)) {
            setUrl(resolvedVideoUrl);
          }
        }

        persistAnalyzeResult({
          report,
          url: storageUrl,
          jobId: normalizedJobId,
        });
        setKnownJobProgress("done");
        setKnownJobMessage("Diagnostic restaure.");
        setRestoredReport(report);
        setRestoredReportJobId(normalizedJobId);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        if (error instanceof NeedsUploadError) {
          focusUploadFallback(error.message);
        }

        const message =
          error instanceof Error
            ? error.message
            : "Impossible de restaurer le diagnostic.";
        setKnownJobErrorMessage(message);
        setKnownJobMessage("");
      } finally {
        if (requestControllerRef.current === controller) {
          requestControllerRef.current = null;
        }
        startedAtRef.current = null;
        setIsRestoringKnownJob(false);
      }
    },
    [focusUploadFallback]
  );

  useEffect(() => {
    const mountedState = readAnalyzeSearchStateFromWindow();
    const nextJobId = mountedState.jobId ?? initialJobId;
    const nextVideoUrl = mountedState.videoUrl ?? initialVideoUrl;
    const nextPaidFlag = mountedState.paid || initialPaid;
    const frameId = window.requestAnimationFrame(() => {
      if (nextVideoUrl && !isUploadSource(nextVideoUrl)) {
        setUrl(nextVideoUrl);
      }
      if (nextVideoUrl) {
        setKnownVideoUrl(nextVideoUrl);
      }

      if (nextJobId) {
        setKnownJobId(nextJobId);
      }

      setPaidFlag(nextPaidFlag);

      if (!nextJobId) {
        return;
      }

      void restoreKnownJob(nextJobId, nextVideoUrl, nextPaidFlag);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [initialJobId, initialPaid, initialVideoUrl, restoreKnownJob]);

  const validationMessage = validateTikTokUrl(url);
  const hasTypedUrl = url.trim().length > 0;
  const showValidationError = Boolean(
    !isSubmitting && (hasTriedSubmit || hasTypedUrl) && validationMessage
  );
  const canSubmit =
    !validationMessage &&
    !isSubmitting &&
    !isUploading &&
    !isRestoringKnownJob &&
    isGateResolved &&
    (!hasFreeLimit || hasSubscriptionAccess());

  const canUpload =
    !isSubmitting &&
    !isUploading &&
    !isRestoringKnownJob &&
    Boolean(uploadFile) &&
    isGateResolved &&
    (!hasFreeLimit || hasSubscriptionAccess());

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasTriedSubmit(true);

    const trimmedUrl = url.trim();
    const validationError = validateTikTokUrl(trimmedUrl);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (hasFreeLimit && !hasSubscriptionAccess()) {
      setErrorMessage(
        "Votre diagnostic gratuit a deja ete utilise sur cet appareil. Passez sur une offre abonnee pour continuer."
      );
      return;
    }

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;

    setErrorMessage("");
    setUploadNudgeMessage("");
    setKnownJobErrorMessage("");
    setKnownJobMessage("");
    setKnownJobProgress(null);
    setRestoredReport(null);
    setRestoredReportJobId(null);
    setIsSubmitting(true);
    setElapsedMs(0);
    startedAtRef.current = Date.now();
    const timeoutId = window.setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    try {
      const response = await fetch(ANALYZE_API_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: trimmedUrl }),
        signal: controller.signal,
      });

      const initPayload = (await response.json().catch(() => null)) as
        | Record<string, unknown>
        | null;

      if (!response.ok) {
        const message = mapAnalyzeError(response.status, initPayload);
        if (parseNeedsUpload(initPayload)) {
          throw new NeedsUploadError(message);
        }
        throw new Error(message);
      }

      if (
        initPayload &&
        "status" in initPayload &&
        initPayload.status !== "processing"
      ) {
        const railwayResult = initPayload as unknown as RailwayResponse;
        const report = formatAttentiqReport(railwayResult);

        if (railwayResult.status === "error") {
          throw new Error(report.text);
        }

        const resolvedVideoUrl = resolveReportVideoUrl(railwayResult, trimmedUrl) ?? trimmedUrl;

        persistAnalyzeResult({ report, url: resolvedVideoUrl, jobId: null });
        if (fingerprint && !hasSubscriptionAccess()) {
          markFreeDiagnosticUsed(fingerprint, resolvedVideoUrl);
          setHasFreeLimit(true);
        }
        startTransition(() => {
          router.push(
            buildResultHref({
              videoUrl: resolvedVideoUrl,
            })
          );
        });
        return;
      }

      const jobId = initPayload?.job_id as string | undefined;
      const normalizedUrl =
        typeof initPayload?.normalizedUrl === "string"
          ? initPayload.normalizedUrl
          : trimmedUrl;
      if (!jobId) {
        throw new Error("Le service n'a pas retourne d'identifiant de tache.");
      }

      setKnownJobId(jobId);
      setKnownVideoUrl(normalizedUrl);
      setKnownJobProgress(
        typeof initPayload?.status === "string" ? initPayload.status : "processing"
      );
      setKnownJobMessage(
        typeof initPayload?.message === "string"
          ? initPayload.message
          : "Le diagnostic est en preparation."
      );

      const railwayResult = await pollJobResult(jobId, controller.signal, (snapshot) => {
        setKnownJobProgress(snapshot.progress ?? null);
        setKnownJobMessage(
          snapshot.message ?? "Le diagnostic continue a se preparer."
        );
      });
      const report = formatAttentiqReport(railwayResult);

      if (railwayResult.status === "error") {
        throw new Error(report.text);
      }

      const resolvedVideoUrl =
        resolveReportVideoUrl(railwayResult, normalizedUrl) ?? normalizedUrl;

      persistAnalyzeResult({ report, url: resolvedVideoUrl, jobId });
      if (fingerprint && !hasSubscriptionAccess()) {
        markFreeDiagnosticUsed(fingerprint, resolvedVideoUrl);
        setHasFreeLimit(true);
      }
      startTransition(() => {
        router.push(
          buildResultHref({
            jobId,
            videoUrl: resolvedVideoUrl,
          })
        );
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setErrorMessage(TIMEOUT_MESSAGE);
      } else if (error instanceof NeedsUploadError) {
        setErrorMessage(error.message);
        focusUploadFallback(error.message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Impossible de joindre le service d'analyse.");
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }
      startedAtRef.current = null;
      setIsSubmitting(false);
    }
  }

  async function handleUploadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasFreeLimit && !hasSubscriptionAccess()) {
      setUploadErrorMessage(
        "Votre diagnostic gratuit a deja ete utilise sur cet appareil. Passez sur une offre abonnee pour continuer."
      );
      return;
    }

    if (!railwayBaseUrl) {
      setUploadErrorMessage(
        "Le fallback upload n'est pas disponible pour le moment. Reessayez un peu plus tard."
      );
      return;
    }

    if (!uploadFile) {
      setUploadErrorMessage("Selectionnez d'abord un fichier video.");
      return;
    }

    if (!uploadFile.type.startsWith("video/")) {
      setUploadErrorMessage(
        "Seuls les fichiers video sont acceptes pour le fallback upload."
      );
      return;
    }

    if (uploadFile.size > MAX_UPLOAD_BYTES) {
      setUploadErrorMessage(
        "Le fichier depasse la limite actuelle de 100 Mo. Importez un extrait plus leger."
      );
      return;
    }

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;

    setErrorMessage("");
    setUploadErrorMessage("");
    setUploadNudgeMessage("");
    setKnownJobErrorMessage("");
    setKnownJobMessage("");
    setKnownJobProgress(null);
    setRestoredReport(null);
    setRestoredReportJobId(null);
    setIsUploading(true);
    setElapsedMs(0);
    startedAtRef.current = Date.now();
    const timeoutId = window.setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    try {
      const formData = new FormData();
      formData.set("file", uploadFile);
      formData.set("max_duration_seconds", "60");

      const response = await fetch(
        `${railwayBaseUrl.replace(/\/+$/, "")}/analyze/upload`,
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );

      const initPayload = (await response.json().catch(() => null)) as
        | Record<string, unknown>
        | null;

      if (!response.ok) {
        throw new Error(mapAnalyzeError(response.status, initPayload));
      }

      const jobId = initPayload?.job_id as string | undefined;
      if (!jobId) {
        throw new Error("Le service upload n'a pas retourne d'identifiant de tache.");
      }

      const uploadPseudoUrl = buildUploadPseudoUrl(uploadFile.name);

      setKnownJobId(jobId);
      setKnownVideoUrl(uploadPseudoUrl);
      setKnownJobProgress(
        typeof initPayload?.status === "string" ? initPayload.status : "processing"
      );
      setKnownJobMessage(
        typeof initPayload?.message === "string"
          ? initPayload.message
          : "Le diagnostic upload est en preparation."
      );

      const railwayResult = await pollJobResult(jobId, controller.signal, (snapshot) => {
        setKnownJobProgress(snapshot.progress ?? null);
        setKnownJobMessage(
          snapshot.message ?? "Le diagnostic upload continue a se preparer."
        );
      });
      const report = formatAttentiqReport(railwayResult);

      if (railwayResult.status === "error") {
        throw new Error(report.text);
      }

      const resolvedVideoUrl =
        resolveReportVideoUrl(railwayResult, uploadPseudoUrl) ?? uploadPseudoUrl;

      persistAnalyzeResult({ report, url: resolvedVideoUrl, jobId });
      if (fingerprint && !hasSubscriptionAccess()) {
        markFreeDiagnosticUsed(fingerprint, resolvedVideoUrl);
        setHasFreeLimit(true);
      }
      startTransition(() => {
        router.push(
          buildResultHref({
            jobId,
            videoUrl: resolvedVideoUrl,
          })
        );
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setUploadErrorMessage(TIMEOUT_MESSAGE);
      } else if (error instanceof NeedsUploadError) {
        setUploadErrorMessage(error.message);
      } else if (error instanceof Error) {
        setUploadErrorMessage(error.message);
      } else {
        setUploadErrorMessage("Impossible de lancer l'upload.");
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }
      startedAtRef.current = null;
      setIsUploading(false);
    }
  }

  if (restoredReport) {
    return (
      <ResultReport
        report={restoredReport}
        initialPremiumEntitlement={initialPremiumEntitlement}
        reportJobId={restoredReportJobId}
      />
    );
  }

  const hasKnownJobContext = Boolean(knownJobId || knownVideoUrl);
  const isWorking = isSubmitting || isUploading || isRestoringKnownJob;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.16), transparent 28%), radial-gradient(circle at 82% 16%, rgba(251, 146, 60, 0.1), transparent 18%), var(--bg-base)",
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
          backgroundSize: "54px 54px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.24) 58%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "24px 16px 72px",
        }}
      >
        <nav
          className="rise"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.05)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-primary)",
              }}
            >
              ←
            </span>
            Retour a l&apos;accueil
          </Link>

          <div
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              border: hasFreeLimit
                ? "1px solid rgba(251, 146, 60, 0.24)"
                : "1px solid var(--border)",
              background: hasFreeLimit
                ? "rgba(251, 146, 60, 0.08)"
                : "rgba(255,255,255,0.03)",
              color: hasFreeLimit ? "#fdba74" : "var(--text-secondary)",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            {hasFreeLimit
              ? "Diagnostic gratuit utilise"
              : "1 diagnostic gratuit · video"}
          </div>
        </nav>

        <section
          style={{
            display: "grid",
            gap: "22px",
            alignItems: "start",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          <section
            className="rise d1"
            style={{
              borderRadius: "30px",
              border: "1px solid rgba(0, 212, 255, 0.18)",
              background:
                "linear-gradient(180deg, rgba(11, 16, 22, 0.98) 0%, rgba(7, 11, 16, 0.96) 100%)",
              padding: "26px 22px",
              boxShadow: "0 30px 100px rgba(0, 0, 0, 0.34)",
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
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "999px",
                  background: "var(--accent)",
                  boxShadow: "0 0 14px var(--accent-glow)",
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  fontWeight: 800,
                  color: "var(--accent)",
                }}
              >
                Diagnostic gratuit unique
              </span>
            </div>

            <h1
              style={{
                margin: "18px 0 0",
                fontSize: "clamp(2.6rem, 8vw, 4.9rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.08em",
                maxWidth: "10ch",
                color: "var(--text-primary)",
              }}
            >
              Importez la video. Gardez l&apos;URL en beta.
            </h1>

            <p
              style={{
                margin: "18px 0 0",
                maxWidth: "38rem",
                fontSize: "16px",
                lineHeight: 1.8,
                color: "rgba(237, 242, 247, 0.8)",
              }}
            >
              L&apos;upload est le chemin recommande. L&apos;URL TikTok reste en beta:
              elle est normalisee, testee puis refusee explicitement si le media
              n&apos;est pas exploitable. Dans tous les cas, vous obtenez un message
              clair et un chemin de secours visible.
            </p>

            <section
              ref={uploadSectionRef}
              style={{
                marginTop: "24px",
                borderRadius: "24px",
                border: "1px solid rgba(52, 211, 153, 0.22)",
                background:
                  "linear-gradient(180deg, rgba(52, 211, 153, 0.08) 0%, rgba(9, 16, 13, 0.96) 100%)",
                padding: "18px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  fontWeight: 800,
                  color: "#86efac",
                }}
              >
                Upload recommande
              </p>
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: "14px",
                  lineHeight: 1.75,
                  color: "rgba(237, 242, 247, 0.84)",
                }}
              >
                Si l&apos;URL est invalide, inaccessible ou non supportee, importez la
                video directement. Le fallback upload reste visible et utilisable
                sans etat ambigu.
              </p>

              {uploadNudgeMessage && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "14px 16px",
                    borderRadius: "18px",
                    border: "1px solid rgba(251, 191, 36, 0.22)",
                    background: "rgba(251, 191, 36, 0.08)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontWeight: 700,
                      lineHeight: 1.7,
                      color: "#fde68a",
                    }}
                  >
                    {uploadNudgeMessage}
                  </p>
                </div>
              )}

              <form
                onSubmit={handleUploadSubmit}
                style={{
                  marginTop: "16px",
                  display: "grid",
                  gap: "14px",
                }}
              >
                <label
                  htmlFor="upload-video"
                  style={{
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 800,
                    color: "rgba(237, 242, 247, 0.72)",
                  }}
                >
                  Fichier video
                </label>

                <div
                  style={{
                    borderRadius: "22px",
                    border: uploadErrorMessage
                      ? "1px solid rgba(248, 113, 113, 0.35)"
                      : "1px dashed rgba(255,255,255,0.18)",
                    background: "rgba(5, 9, 14, 0.58)",
                    padding: "16px",
                  }}
                >
                  <input
                    id="upload-video"
                    type="file"
                    accept="video/*"
                    disabled={isWorking}
                    onChange={(event) => {
                      const nextFile = event.target.files?.[0] ?? null;
                      setUploadFile(nextFile);
                      setUploadErrorMessage("");
                    }}
                    style={{
                      width: "100%",
                      color: "rgba(237, 242, 247, 0.82)",
                      fontSize: "14px",
                    }}
                  />
                  <p
                    style={{
                      margin: "12px 0 0",
                      fontSize: "12px",
                      lineHeight: 1.7,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Format video requis. Limite actuelle: 60s et 100 Mo maximum.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: uploadFile ? "#86efac" : "var(--text-secondary)",
                      }}
                    >
                      {uploadFile
                        ? `Fichier selectionne: ${uploadFile.name}`
                        : "Importez la video si l'URL beta echoue ou si vous voulez eviter la dependance a l'URL."}
                    </p>
                    {uploadErrorMessage && (
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: "13px",
                          color: "#f87171",
                        }}
                      >
                        {uploadErrorMessage}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!canUpload}
                    style={{
                      minWidth: "220px",
                      minHeight: "50px",
                      borderRadius: "999px",
                      border: "none",
                      cursor: canUpload ? "pointer" : "not-allowed",
                      background: canUpload
                        ? "linear-gradient(135deg, #34d399, #86efac)"
                        : "rgba(255,255,255,0.08)",
                      color: canUpload ? "#041017" : "var(--text-secondary)",
                      fontSize: "14px",
                      fontWeight: 900,
                    }}
                  >
                    {isUploading ? "Upload en cours..." : "Analyser par upload"}
                  </button>
                </div>
              </form>
            </section>

            {hasFreeLimit && !hasSubscriptionAccess() && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "18px",
                  borderRadius: "22px",
                  border: "1px solid rgba(251, 146, 60, 0.24)",
                  background: "rgba(251, 146, 60, 0.08)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 800,
                    color: "#fdba74",
                  }}
                >
                  Limite gratuite atteinte
                </p>
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: "14px",
                    lineHeight: 1.75,
                    color: "rgba(237, 242, 247, 0.86)",
                  }}
                >
                  Le diagnostic gratuit a deja ete utilise sur cet appareil.
                  Pour continuer a lancer des diagnostics, passez sur une offre
                  abonnee 49EUR ou 99EUR.
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{
                marginTop: "24px",
                display: "grid",
                gap: "14px",
              }}
            >
              <label
                htmlFor="tiktok-url"
                style={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontWeight: 800,
                  color: "var(--text-secondary)",
                }}
              >
                URL TikTok publique (beta)
              </label>

              <div
                style={{
                  borderRadius: "24px",
                  border: showValidationError || errorMessage
                    ? "1px solid rgba(248, 113, 113, 0.35)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(5, 9, 14, 0.78)",
                  padding: "14px",
                }}
              >
                <input
                  id="tiktok-url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={URL_EXAMPLES[0]}
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    if (errorMessage) {
                      setErrorMessage("");
                    }
                  }}
                  disabled={isWorking}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    color: "var(--text-primary)",
                    fontSize: "15px",
                    lineHeight: 1.6,
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: showValidationError
                        ? "#fca5a5"
                        : hasTypedUrl && !validationMessage
                          ? "#86efac"
                          : "var(--text-secondary)",
                    }}
                  >
                    {showValidationError
                      ? validationMessage
                      : hasFreeLimit && !hasSubscriptionAccess()
                        ? "Le diagnostic gratuit est deja consomme. Passez sur une offre abonnee pour continuer."
                      : hasTypedUrl && !validationMessage
                        ? "Format reconnu. Vous pouvez lancer le diagnostic."
                        : "Format accepte: URL video TikTok publique ou lien court vm.tiktok.com / vt.tiktok.com. En cas d'echec, basculez sur l'upload ci-dessus."}
                  </p>
                  {errorMessage && (
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: "13px",
                        color: "#f87171",
                      }}
                    >
                      {errorMessage}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    minWidth: "200px",
                    minHeight: "50px",
                    borderRadius: "999px",
                    border: "none",
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    background: canSubmit
                      ? "linear-gradient(135deg, var(--accent), #79e7ff)"
                      : "rgba(255,255,255,0.08)",
                    color: canSubmit ? "#041017" : "var(--text-secondary)",
                    fontSize: "14px",
                    fontWeight: 900,
                    boxShadow: canSubmit
                      ? "0 18px 52px rgba(0, 212, 255, 0.18)"
                      : "none",
                  }}
                >
                  {isSubmitting
                    ? "Analyse en cours..."
                    : isRestoringKnownJob
                      ? "Restauration en cours..."
                    : hasFreeLimit && !hasSubscriptionAccess()
                      ? "Offre gratuite utilisee"
                      : "Voir le teaser gratuit"}
                </button>
              </div>
            </form>

            <div
              style={{
                marginTop: "22px",
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              {[
                {
                  title: "Chemin primaire",
                  copy: "Upload video direct recommande. La beta URL reste disponible pour les videos TikTok publiques.",
                },
                {
                  title: "Echecs URL",
                  copy: "Aucune promesse cassee: URL invalide, privee ou inexploitable = message clair puis fallback upload.",
                },
                {
                  title: "Ce que vous recevez",
                  copy: "Un teaser limite pour comprendre si le rapport complet vaut le deblocage.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  style={{
                    borderRadius: "20px",
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.03)",
                    padding: "16px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      fontWeight: 800,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      margin: "10px 0 0",
                      fontSize: "14px",
                      lineHeight: 1.75,
                      color: "rgba(237, 242, 247, 0.82)",
                    }}
                  >
                    {item.copy}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <div className="rise d2" style={{ display: "grid", gap: "18px" }}>
            <section
              style={{
                borderRadius: "28px",
                border: "1px solid var(--border)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(8, 12, 18, 0.96) 100%)",
                padding: "20px",
              }}
            >
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    fontWeight: 800,
                    color: "#86efac",
                  }}
                >
                  URL beta
                </p>

              <div style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
                {URL_EXAMPLES.map((example) => (
                  <code
                    key={example}
                    style={{
                      display: "block",
                      overflowX: "auto",
                      padding: "12px 14px",
                      borderRadius: "18px",
                      border: "1px solid var(--border)",
                      background: "rgba(0,0,0,0.16)",
                      color: "rgba(237, 242, 247, 0.84)",
                      fontSize: "12px",
                      lineHeight: 1.6,
                    }}
                  >
                    {example}
                  </code>
                ))}
              </div>
            </section>

            {hasKnownJobContext && (
              <section
                style={{
                  borderRadius: "28px",
                  border: paidFlag
                    ? "1px solid rgba(52, 211, 153, 0.22)"
                    : "1px solid rgba(0, 212, 255, 0.18)",
                  background: paidFlag
                    ? "linear-gradient(180deg, rgba(52, 211, 153, 0.08) 0%, rgba(8, 12, 18, 0.96) 100%)"
                    : "linear-gradient(180deg, rgba(0, 212, 255, 0.08) 0%, rgba(8, 12, 18, 0.96) 100%)",
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    fontWeight: 800,
                    color: paidFlag ? "#86efac" : "var(--accent)",
                  }}
                >
                  {paidFlag ? "Paiement restaure" : "Job connu"}
                </p>

                <div style={{ marginTop: "14px", display: "grid", gap: "12px" }}>
                  {knownJobMessage && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        lineHeight: 1.75,
                        color: "rgba(237, 242, 247, 0.84)",
                      }}
                    >
                      {knownJobMessage}
                    </p>
                  )}

                  {knownJobProgress && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        fontWeight: 700,
                      }}
                    >
                      Etat: {knownJobProgress}
                    </p>
                  )}

                  {knownJobId && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        lineHeight: 1.7,
                        color: "var(--text-secondary)",
                        wordBreak: "break-word",
                      }}
                    >
                      Job: {knownJobId}
                    </p>
                  )}

                  {knownVideoUrl && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        lineHeight: 1.7,
                        color: "var(--text-secondary)",
                        wordBreak: "break-word",
                      }}
                    >
                      {knownVideoUrl.startsWith("upload://") ? "Fichier" : "Source"}:{" "}
                      {knownVideoUrl}
                    </p>
                  )}

                  {knownJobErrorMessage && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        lineHeight: 1.7,
                        color: "#fca5a5",
                      }}
                    >
                      {knownJobErrorMessage}
                    </p>
                  )}

                  {knownJobId && (
                    <button
                      type="button"
                      onClick={() => {
                        void restoreKnownJob(knownJobId, knownVideoUrl, paidFlag);
                      }}
                      disabled={isRestoringKnownJob}
                      style={{
                        minHeight: "46px",
                        borderRadius: "999px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                        fontWeight: 800,
                        cursor: isRestoringKnownJob ? "not-allowed" : "pointer",
                      }}
                    >
                      {isRestoringKnownJob ? "Polling en cours..." : "Relancer le polling"}
                    </button>
                  )}
                </div>
              </section>
            )}

            {hasKnownJobContext && !hasSubscriptionAccess(initialPremiumEntitlement) && (
              <PremiumPaywall jobId={knownJobId} videoUrl={knownVideoUrl} />
            )}

            {isWorking ? (
              <AnalysisLoadingState
                elapsedMs={elapsedMs}
                headline={
                  isRestoringKnownJob
                    ? "Nous reprenons le diagnostic a partir du job connu."
                    : "Le diagnostic d'attention est en train d'etre prepare."
                }
                detail={
                  isRestoringKnownJob
                    ? "Si le job est toujours en cours, le polling repart automatiquement sur cet identifiant."
                    : "Ne fermez pas l'onglet. La redirection vers le rapport se fera automatiquement."
                }
              />
            ) : (
              <section
                style={{
                  borderRadius: "28px",
                  border:
                    hasFreeLimit && !hasSubscriptionAccess()
                      ? "1px solid rgba(251, 146, 60, 0.22)"
                      : "1px solid rgba(0, 212, 255, 0.18)",
                  background:
                    hasFreeLimit && !hasSubscriptionAccess()
                      ? "linear-gradient(180deg, rgba(251, 146, 60, 0.08) 0%, rgba(8, 12, 18, 0.96) 100%)"
                      : "linear-gradient(180deg, rgba(0, 212, 255, 0.08) 0%, rgba(8, 12, 18, 0.96) 100%)",
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    fontWeight: 800,
                    color:
                      hasFreeLimit && !hasSubscriptionAccess()
                        ? "#fdba74"
                        : "var(--accent)",
                  }}
                >
                  {hasFreeLimit && !hasSubscriptionAccess()
                    ? "Passez au mode abonne"
                    : "Ce que le teaser montre"}
                </p>
                {hasFreeLimit && !hasSubscriptionAccess() ? (
                  <div style={{ marginTop: "14px", display: "grid", gap: "12px" }}>
                    {ATTENTIQ_OFFERS.filter((offer) => offer.createsAccount).map(
                      (offer) => (
                        <Link
                          key={offer.slug}
                          href={offer.checkoutPath}
                          style={{
                            display: "block",
                            borderRadius: "20px",
                            border: offer.featured
                              ? "1px solid rgba(0, 212, 255, 0.2)"
                              : "1px solid rgba(255,255,255,0.08)",
                            background: offer.featured
                              ? "linear-gradient(180deg, rgba(0, 212, 255, 0.1) 0%, rgba(255,255,255,0.03) 100%)"
                              : "rgba(255,255,255,0.03)",
                            padding: "16px",
                            textDecoration: "none",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "12px",
                              alignItems: "start",
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "11px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.14em",
                                  fontWeight: 800,
                                  color: offer.featured ? "var(--accent)" : "#fdba74",
                                }}
                              >
                                {offer.shortLabel}
                              </p>
                              <p
                                style={{
                                  margin: "10px 0 0",
                                  fontSize: "18px",
                                  lineHeight: 1.2,
                                  fontWeight: 800,
                                  color: "var(--text-primary)",
                                }}
                              >
                                {offer.name}
                              </p>
                            </div>
                            <span
                              style={{
                                fontSize: "22px",
                                fontWeight: 900,
                                letterSpacing: "-0.05em",
                                color: "var(--text-primary)",
                              }}
                            >
                              {offer.priceLabel}
                            </span>
                          </div>
                          <p
                            style={{
                              margin: "10px 0 0",
                              fontSize: "13px",
                              lineHeight: 1.7,
                              color: "rgba(237, 242, 247, 0.8)",
                            }}
                          >
                            {offer.summary}
                          </p>
                        </Link>
                      )
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: "14px", display: "grid", gap: "12px" }}>
                    {[
                      "Un resume global de la tenue d'attention.",
                      "Jusqu'a 3 chutes d'attention visibles.",
                      "Un apercu des actions a prioriser ensuite.",
                    ].map((item) => (
                      <div
                        key={item}
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                          padding: "12px 14px",
                          borderRadius: "18px",
                          border: "1px solid rgba(0, 212, 255, 0.16)",
                          background: "rgba(255,255,255,0.03)",
                          fontSize: "14px",
                          lineHeight: 1.7,
                          color: "rgba(237, 242, 247, 0.84)",
                        }}
                      >
                        <span style={{ color: "var(--accent)" }}>✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
