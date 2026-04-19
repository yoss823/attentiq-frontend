import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from './constants';

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Response interceptor — normalise errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as { detail?: string })?.detail ||
      error.message ||
      'Une erreur inattendue est survenue.';
    return Promise.reject(new Error(message));
  }
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AnalyzeVideoRequest {
  url: string;
}

export interface AnalyzeVideoResponse {
  job_id: string;
  status: JobStatus;
  message?: string;
}

export interface AttentionPoint {
  second: number;
  score: number; // 0–100
  label?: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  progress?: number; // 0–100
  result?: {
    video_url: string;
    title?: string;
    duration_seconds?: number;
    attention_curve: AttentionPoint[];
    summary: string;
    recommendations: string[];
    peak_moments: AttentionPoint[];
    drop_moments: AttentionPoint[];
  };
  error?: string;
  created_at?: string;
  updated_at?: string;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Submit a TikTok video URL for analysis.
 * Returns a job_id that can be polled with getJobStatus().
 */
export async function analyzeVideo(
  url: string
): Promise<AnalyzeVideoResponse> {
  const { data } = await apiClient.post<AnalyzeVideoResponse>('/analyze', {
    url,
  } satisfies AnalyzeVideoRequest);
  return data;
}

/**
 * Poll the status of an analysis job.
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const { data } = await apiClient.get<JobStatusResponse>(
    `/jobs/${jobId}`
  );
  return data;
}

/**
 * Validate that a string looks like a TikTok URL.
 */
export function isTikTokUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'www.tiktok.com' ||
      parsed.hostname === 'tiktok.com' ||
      parsed.hostname === 'vm.tiktok.com' ||
      parsed.hostname === 'vt.tiktok.com'
    );
  } catch {
    return false;
  }
}
