import type { AttentiqReport } from "@/lib/railway-client";

export const ANALYZE_RESULT_SESSION_STORAGE_KEY =
  "attentiq.analyze.result.v1";

const MAX_STORED_RESULT_AGE_MS = 30 * 60 * 1000;

type StoredAnalyzeResult = {
  savedAt: string;
  url: string;
  jobId: string | null;
  report: AttentiqReport;
};

function isValidStoredResult(value: unknown): value is StoredAnalyzeResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<StoredAnalyzeResult>;
  return (
    typeof candidate.savedAt === "string" &&
    typeof candidate.url === "string" &&
    (candidate.jobId == null || typeof candidate.jobId === "string") &&
    Boolean(candidate.report?.data?.request_id)
  );
}

export function persistAnalyzeResult({
  report,
  url,
  jobId = null,
}: {
  report: AttentiqReport;
  url: string;
  jobId?: string | null;
}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredAnalyzeResult = {
    savedAt: new Date().toISOString(),
    url,
    jobId: jobId?.trim() || null,
    report,
  };

  sessionStorage.setItem(
    ANALYZE_RESULT_SESSION_STORAGE_KEY,
    JSON.stringify(payload)
  );
}

export function readAnalyzeResult(): StoredAnalyzeResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = sessionStorage.getItem(ANALYZE_RESULT_SESSION_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!isValidStoredResult(parsed)) {
      sessionStorage.removeItem(ANALYZE_RESULT_SESSION_STORAGE_KEY);
      return null;
    }

    const ageMs = Date.now() - new Date(parsed.savedAt).getTime();
    if (!Number.isFinite(ageMs) || ageMs > MAX_STORED_RESULT_AGE_MS) {
      sessionStorage.removeItem(ANALYZE_RESULT_SESSION_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    sessionStorage.removeItem(ANALYZE_RESULT_SESSION_STORAGE_KEY);
    return null;
  }
}
