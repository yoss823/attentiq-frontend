/**
 * API client — appelle DIRECTEMENT le backend Railway
 * (pas de routes Next.js, pas de 405)
 */

const BACKEND_BASE_URL =
  "https://attentiqbackend-production.up.railway.app";

export type JobStatus = "queued" | "processing" | "done" | "error";

export interface DropMoment {
  time: number;
  reason: string;
}

export interface PeakMoment {
  time: number;
  reason: string;
}

export interface JobResult {
  summary: string;
  hookScore: number;
  retentionScore: number;
  ctaScore: number;
  script: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  dropMoments?: DropMoment[];
  peakMoments?: PeakMoment[];
}

export interface JobStatusResponse {
  id: string;
  status: JobStatus;
  error?: string | null;
  result?: JobResult | null;
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${BACKEND_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(
      data?.error || `Request failed with status ${res.status}`
    );
  }

  return data as T;
}

export function isTikTokUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.hostname.includes("tiktok.com") ||
      url.hostname.includes("vt.tiktok.com") ||
      url.hostname.includes("vm.tiktok.com")
    );
  } catch {
    return false;
  }
}

/**
 * ✅ LANCER UNE ANALYSE
 * POST https://attentiqbackend-production.up.railway.app/analyze
 */
export async function analyzeVideo(videoUrl: string): Promise<{ jobId: string }> {
  const data = await apiFetch<{ job_id: string }>("/analyze", {
    method: "POST",
    body: JSON.stringify({ url: videoUrl }),
  });

  return { jobId: data.job_id };
}

/**
 * ✅ POLLING DU JOB
 * GET https://attentiqbackend-production.up.railway.app/analyze/{jobId}
 */
export async function getJobStatus(jobId: string) {
  if (!jobId) {
    throw new Error("jobId manquant");
  }

  return apiFetch<JobStatusResponse>(
    `/analyze/${encodeURIComponent(jobId)}`,
    { method: "GET" }
  );
}

/**
 * ✅ STRIPE — reste côté frontend Next
 */
export async function createCheckoutSession(params: {
  jobId: string;
  videoUrl: string;
}) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function activatePremium(sessionId: string) {
  const res = await fetch("/api/set-premium", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Premium error ${res.status}: ${text}`);
  }

  return res.json();
}
