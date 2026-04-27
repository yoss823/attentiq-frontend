import "server-only";

import {
  URL_PIPELINE_VERSION,
  buildCanonicalTikTokUrl,
  detectVideoPlatformFromUrl,
  parseGenericVideoUrlInput,
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
  /** Backend job source: e.g. `video` for URL + upload pipelines */
  format?: string;
  /** TikTok, upload, etc. — `upload` means fichier importé, pas URL */
  platform?: string;
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
  "url",
  "play",
  "video_link_nwm",
  "nwm_video_url_HQ",
  "hdplay",
  "wmplay",
] as const;

const URL_BLOCKED_UPLOAD_MESSAGE =
  "Certaines plateformes bloquent parfois le media via URL. Pas d'inquietude: testez en upload, le resultat sera souvent meilleur.";

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
    platform: detectVideoPlatformFromUrl(videoUrl),
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

/** TikTok (sonde d'accessibilité) ou autres plateformes courtes (validation côté serveur). */
export async function resolveVideoUrl(rawUrl: string): Promise<string> {
  const tik = parseTikTokUrlInput(rawUrl);
  if (tik.ok) {
    return resolveTikTokUrl(rawUrl);
  }
  const gen = parseGenericVideoUrlInput(rawUrl);
  if (!gen.ok) {
    throw new UrlIntakeError(gen.code, 400, gen.message, true);
  }
  return gen.normalizedUrl;
}

export async function preflightRailwayUrl(videoUrl: string) {
  const platform = detectVideoPlatformFromUrl(videoUrl);
  // /debug/rapidapi is TikTok-specific; skip this gate for other platforms.
  if (platform !== "tiktok") {
    return;
  }

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

  if (!payload.has_data) {
    throw new UrlIntakeError(
      "DOWNLOAD_FAILED",
      422,
      "Cette URL ne permet pas de recuperer un media exploitable pour l'audit. Importez la video directement."
    );
  }

  // Some providers only expose a generic media URL field.
  // If we can confirm data exists, let backend `/analyze` decide.
  if (!hasVideoCandidate) {
    return;
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

const UPLOAD_PIPELINE_FAILED_MESSAGE =
  "L'analyse du fichier a echoue. Reessayez, ou testez un autre encodage (MP4 H.264, MOV, WebM).";

function mapRailwayJobFailure(
  errorCode: string | undefined,
  errorMessage: string | undefined,
  jobPlatform?: string,
  jobFormat?: string
) {
  const normalizedError = (errorMessage ?? "").toLowerCase();
  const isInstagramAuthBlocked =
    normalizedError.includes("[instagram]") &&
    (normalizedError.includes("login required") ||
      normalizedError.includes("rate-limit") ||
      normalizedError.includes("rate limit reached") ||
      normalizedError.includes("requested content is not available"));

  if (isInstagramAuthBlocked) {
    return new UrlIntakeError(
      "INSTAGRAM_LOGIN_REQUIRED",
      422,
      URL_BLOCKED_UPLOAD_MESSAGE
    );
  }

  if (errorCode === "VIDEO_UNAVAILABLE") {
    return new UrlIntakeError(
      "VIDEO_UNAVAILABLE",
      404,
      "La video n'est plus accessible depuis son URL. Importez le fichier video directement."
    );
  }

  if (errorCode === "DURATION_EXCEEDED" || errorCode === "VIDEO_TOO_LONG") {
    return new UrlIntakeError(
      errorCode === "VIDEO_TOO_LONG" ? "VIDEO_TOO_LONG" : "DURATION_EXCEEDED",
      422,
      errorMessage ||
        "Cette video depasse 60 secondes. Utilisez un Short, Reel ou extrait, ou importez un fichier decoupe."
    );
  }

  if (errorCode === "INTERNAL_ERROR") {
    return new UrlIntakeError(
      "INTERNAL_ERROR",
      500,
      (errorMessage && errorMessage.trim()) ||
        "Une erreur technique est survenue pendant l'analyse. Reessayez dans quelques minutes.",
      false
    );
  }

  if (errorCode === "SERVICE_UNAVAILABLE") {
    return new UrlIntakeError(
      "SERVICE_UNAVAILABLE",
      503,
      errorMessage ||
        "Le service d'analyse est momentanement indisponible. Reessayez plus tard.",
      false
    );
  }

  if ((jobFormat || "").toLowerCase() === "text") {
    return new UrlIntakeError(
      errorCode ?? "ANALYZE_FAILED",
      422,
      (errorMessage && errorMessage.trim()) || "L'analyse du texte a echoue. Reessayez.",
      false
    );
  }

  if ((jobFormat || "").toLowerCase() === "image") {
    return new UrlIntakeError(
      errorCode ?? "ANALYZE_FAILED",
      422,
      (errorMessage && errorMessage.trim()) || "L'analyse de l'image a echoue. Reessayez.",
      false
    );
  }

  const isFileUpload = (jobPlatform || "").toLowerCase() === "upload";

  if (isFileUpload) {
    return new UrlIntakeError(
      errorCode ?? "ANALYZE_FAILED",
      422,
      (errorMessage && errorMessage.trim()) || UPLOAD_PIPELINE_FAILED_MESSAGE,
      false
    );
  }

  return new UrlIntakeError(
    errorCode ?? "ANALYZE_FAILED",
    422,
    URL_BLOCKED_UPLOAD_MESSAGE
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
    throw mapRailwayJobFailure(
      payload.error_code,
      payload.error_message,
      payload.platform,
      payload.format
    );
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
