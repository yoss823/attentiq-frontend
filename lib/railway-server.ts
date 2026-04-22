import "server-only";

import {
  URL_PIPELINE_VERSION,
  buildCanonicalTikTokUrl,
  parseTikTokUrlInput,
  type ParsedTikTokUrl,
} from "@/lib/url-intake";

export { URL_PIPELINE_VERSION } from "@/lib/url-intake";

type AnalyzeRequest = {
  request_id: string;
  url: string;
  platform: string;
  max_duration_seconds: number;
  requested_at: string;
};

export type AnalyzeJobSnapshot = {
  job_id?: string;
  status?: string;
  progress?: string;
  message?: string;
  result?: Record<string, unknown>;
  error_code?: string;
  error_message?: string;
};

type RailwayDebugRapidApiResponse = {
  status?: string;
  http_status?: number;
  has_data?: boolean;
  video_fields?: string[];
  has_video_link_nwm?: boolean;
  error?: string;
  message?: string;
};

const PUBLIC_FETCH_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  referer: "https://www.tiktok.com/",
} as const;

const RAPID_API_VIDEO_FIELDS = [
  "play",
  "video_link_nwm",
  "nwm_video_url_HQ",
  "hdplay",
  "wmplay",
] as const;

export class UrlIntakeError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    public readonly userMessage: string,
    public readonly needsUpload: boolean = true
  ) {
    super(userMessage);
    this.name = "UrlIntakeError";
  }
}

function getRailwayBaseUrl() {
  const value = process.env.RAILWAY_BASE_URL?.trim();
  if (!value) {
    throw new UrlIntakeError(
      "MISSING_CONFIG",
      503,
      "Le service URL beta n'est pas configure. Importez la video directement."
    );
  }

  return value.replace(/\/+$/, "");
}

function buildAnalyzePayload(videoUrl: string): AnalyzeRequest {
  return {
    request_id: crypto.randomUUID(),
    url: videoUrl,
    platform: "tiktok",
    max_duration_seconds: 60,
    requested_at: new Date().toISOString(),
  };
}

async function fetchWithTimeout(
  input: URL | string,
  init: RequestInit,
  timeoutMs: number
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new UrlIntakeError(
        "URL_UNRESOLVABLE",
        504,
        "Cette URL ne repond pas correctement. Importez la video directement."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function ensurePublicReachability(candidate: ParsedTikTokUrl) {
  const response = await fetchWithTimeout(
    candidate.normalizedUrl,
    {
      method: "GET",
      redirect: "follow",
      headers: PUBLIC_FETCH_HEADERS,
    },
    10_000
  );

  if (!response.ok) {
    throw new UrlIntakeError(
      response.status === 404 ? "VIDEO_UNAVAILABLE" : "URL_UNRESOLVABLE",
      response.status === 404 ? 404 : 422,
      response.status === 404
        ? "Cette URL TikTok est introuvable ou n'est plus publique. Importez la video directement."
        : "Cette URL TikTok n'est pas accessible publiquement. Importez la video directement."
    );
  }

  return response.url ? buildCanonicalTikTokUrl(new URL(response.url)) : candidate.normalizedUrl;
}

export async function resolveTikTokUrl(rawUrl: string) {
  const parsedResult = parseTikTokUrlInput(rawUrl);
  if (!parsedResult.ok) {
    throw new UrlIntakeError(parsedResult.code, 400, parsedResult.message);
  }

  const reachableUrl = await ensurePublicReachability(parsedResult.value);
  const resolvedResult = parseTikTokUrlInput(reachableUrl);
  if (!resolvedResult.ok) {
    throw new UrlIntakeError(
      resolvedResult.code,
      422,
      "L'URL resolue n'est pas exploitable. Importez la video directement."
    );
  }

  return resolvedResult.value.normalizedUrl;
}

export async function preflightRailwayUrl(videoUrl: string) {
  const railwayBaseUrl = getRailwayBaseUrl();
  const response = await fetchWithTimeout(
    `${railwayBaseUrl}/debug/rapidapi?url=${encodeURIComponent(videoUrl)}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    },
    15_000
  );

  const payload = (await response.json().catch(() => null)) as
    | RailwayDebugRapidApiResponse
    | null;

  if (!response.ok || !payload) {
    throw new UrlIntakeError(
      "URL_TEST_FAILED",
      502,
      "Impossible de tester cette URL avant analyse. Importez la video directement."
    );
  }

  if (payload.http_status === 429) {
    throw new UrlIntakeError(
      "RATE_LIMITED",
      429,
      "Le service URL beta est temporairement sature. Importez la video directement."
    );
  }

  if (payload.status === "error") {
    throw new UrlIntakeError(
      "URL_TEST_FAILED",
      502,
      "Cette URL n'a pas passe le test de recuperation media. Importez la video directement."
    );
  }

  const videoFields = Array.isArray(payload.video_fields) ? payload.video_fields : [];
  const hasVideoCandidate =
    Boolean(payload.has_video_link_nwm) ||
    RAPID_API_VIDEO_FIELDS.some((field) => videoFields.includes(field));

  if (!payload.has_data || !hasVideoCandidate) {
    throw new UrlIntakeError(
      "DOWNLOAD_FAILED",
      422,
      "Cette URL ne permet pas de recuperer un media exploitable pour l'audit. Importez la video directement."
    );
  }
}

export async function startRailwayAnalyze(videoUrl: string) {
  const railwayBaseUrl = getRailwayBaseUrl();
  const response = await fetchWithTimeout(
    `${railwayBaseUrl}/analyze`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(buildAnalyzePayload(videoUrl)),
    },
    30_000
  );

  const payload = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (!response.ok || !payload) {
    throw new UrlIntakeError(
      "ANALYZE_START_FAILED",
      502,
      "Le service d'analyse n'a pas accepte cette URL. Importez la video directement."
    );
  }

  return payload;
}

function mapRailwayJobFailure(
  errorCode: string | undefined,
  errorMessage: string | undefined
) {
  if (errorCode === "VIDEO_UNAVAILABLE") {
    return new UrlIntakeError(
      "VIDEO_UNAVAILABLE",
      404,
      "La video n'est plus accessible depuis son URL. Importez le fichier video directement."
    );
  }

  if (errorCode === "DURATION_EXCEEDED") {
    return new UrlIntakeError(
      "DURATION_EXCEEDED",
      422,
      "Cette video depasse la limite actuelle de 60 secondes. Importez un extrait video plus court."
    );
  }

  return new UrlIntakeError(
    errorCode ?? "ANALYZE_FAILED",
    422,
    errorMessage ||
      "Cette URL n'a pas produit un media exploitable. Importez la video directement."
  );
}

export function assertUsableRailwayResult(result: Record<string, unknown>) {
  const status = typeof result.status === "string" ? result.status : null;
  const downloadMode =
    typeof result.download_mode === "string" ? result.download_mode : null;

  if (status === "metadata_only" || downloadMode === "none") {
    throw new UrlIntakeError(
      "DOWNLOAD_FAILED",
      422,
      "Le media n'a pas pu etre recupere depuis cette URL. Importez la video directement."
    );
  }
}

export async function getRailwayJobSnapshot(jobId: string) {
  const railwayBaseUrl = getRailwayBaseUrl();
  const response = await fetchWithTimeout(
    `${railwayBaseUrl}/analyze/${encodeURIComponent(jobId)}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    },
    15_000
  );

  const payload = (await response.json().catch(() => null)) as
    | AnalyzeJobSnapshot
    | null;

  if (!response.ok || !payload) {
    throw new UrlIntakeError(
      "JOB_STATUS_FAILED",
      response.status || 502,
      "Impossible de recuperer ce diagnostic pour le moment."
    );
  }

  if (payload.status === "error") {
    throw mapRailwayJobFailure(payload.error_code, payload.error_message);
  }

  if (payload.status === "success" && payload.result) {
    assertUsableRailwayResult(payload.result);
  }

  return payload;
}

export function buildPipelineHeaders() {
  return {
    "x-attentiq-url-pipeline": URL_PIPELINE_VERSION,
  };
}
