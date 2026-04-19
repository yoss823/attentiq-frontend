// ============================================
// PREMIUM & CHECKOUT FUNCTIONS
// ============================================

export async function createCheckoutSession(params: {
  jobId: string;
  videoUrl?: string;
}) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobId: params.jobId,
      videoUrl: params.videoUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Impossible de créer la session Stripe.");
  }

  const data = await response.json();

  if (!data?.url) {
    throw new Error("URL Stripe manquante.");
  }

  return data as { url: string };
}

export async function activatePremium(sessionId: string, jobId: string) {
  const response = await fetch("/api/set-premium", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId,
      jobId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Impossible d'activer le premium.");
  }

  return response.json();
}

// ============================================
// VIDEO ANALYSIS FUNCTIONS & TYPES
// ============================================

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface DropMoment {
  timestamp: number;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface JobStatusResponse {
  id: string;
  status: JobStatus;
  url?: string;
  summary?: string;
  recommendations?: string[];
  dropMoments?: DropMoment[];
  peakMoments?: {
    timestamp: number;
    description: string;
  }[];
  isPremium?: boolean;
  error?: string;
}

export async function analyzeVideo(url: string): Promise<{ jobId: string }> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors de l'analyse vidéo.");
  }

  const data = await response.json();

  if (!data?.jobId) {
    throw new Error("ID de job manquant dans la réponse.");
  }

  return data as { jobId: string };
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const response = await fetch(`/api/job-status?jobId=${jobId}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors de la récupération du statut.");
  }

  return response.json() as Promise<JobStatusResponse>;
}

export function isTikTokUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return (
      hostname === "tiktok.com" ||
      hostname === "www.tiktok.com" ||
      hostname === "vm.tiktok.com" ||
      hostname === "vt.tiktok.com" ||
      hostname === "www.vm.tiktok.com" ||
      hostname === "www.vt.tiktok.com"
    );
  } catch {
    return false;
  }
}
