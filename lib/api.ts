const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "";

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
  const res = await fetch(`${API_BASE_URL}${path}`, {
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

/** ✅ POST backend /analyze */
export async function analyzeVideo(videoUrl: string) {
  return apiFetch<{ jobId: string }>("/analyze", {
    method: "POST",
    body: JSON.stringify({ videoUrl }),
  });
}

/** ✅ GET backend /analyze/{jobId} */
export async function getJobStatus(jobId: string) {
  return apiFetch<JobStatusResponse>(
    `/analyze/${encodeURIComponent(jobId)}`,
    { method: "GET" }
  );
}

/** ✅ Stripe */
export async function createCheckoutSession(params: {
  jobId: string;
  videoUrl: string;
}) {
  return apiFetch<{ url: string }>("/api/checkout", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function activatePremium(sessionId: string) {
  return apiFetch<{ ok: boolean; premium: boolean }>(
    "/api/set-premium",
    {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }
  );
}
