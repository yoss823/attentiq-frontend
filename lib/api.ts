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

async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
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
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export function isTikTokUrl(value: string): boolean {
  if (!value) return false;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    return (
      host.includes("tiktok.com") ||
      host.includes("vt.tiktok.com") ||
      host.includes("vm.tiktok.com")
    );
  } catch {
    return false;
  }
}

export async function analyzeVideo(videoUrl: string): Promise<{ jobId: string }> {
  return apiFetch<{ jobId: string }>("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ videoUrl }),
  });
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  if (!jobId) {
    throw new Error("jobId manquant");
  }

  return apiFetch<JobStatusResponse>(`/api/analyze/status?jobId=${encodeURIComponent(jobId)}`, {
    method: "GET",
  });
}

export async function createCheckoutSession(params: {
  jobId: string;
  videoUrl: string;
}): Promise<{ url: string }> {
  const { jobId, videoUrl } = params;

  if (!jobId) {
    throw new Error("jobId manquant pour le paiement");
  }

  if (!videoUrl) {
    throw new Error("videoUrl manquante pour le paiement");
  }

  return apiFetch<{ url: string }>("/api/checkout", {
    method: "POST",
    body: JSON.stringify({
      jobId,
      videoUrl,
    }),
  });
}

export async function activatePremium(sessionId: string): Promise<{
  ok: boolean;
  premium: boolean;
}> {
  if (!sessionId) {
    throw new Error("session_id manquant");
  }

  return apiFetch<{ ok: boolean; premium: boolean }>("/api/set-premium", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
    }),
  });
}
