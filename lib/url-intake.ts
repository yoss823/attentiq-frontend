export const URL_PIPELINE_VERSION = "bloc-a-j0-url-v2-2026-04-21";

export const SUPPORTED_TIKTOK_HOSTS = [
  "www.tiktok.com",
  "m.tiktok.com",
  "tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
] as const;

export type UrlValidationCode =
  | "MISSING_URL"
  | "INVALID_URL"
  | "UNSUPPORTED_SCHEME"
  | "UNSUPPORTED_URL"
  | "UNSUPPORTED_TIKTOK_PATH";

export type ParsedTikTokUrl = {
  raw: string;
  trimmed: string;
  parsed: URL;
  normalizedUrl: string;
  host: string;
  path: string;
  isShortUrl: boolean;
};

export type UrlValidationResult =
  | {
      ok: true;
      value: ParsedTikTokUrl;
    }
  | {
      ok: false;
      code: UrlValidationCode;
      message: string;
    };

function normalizeUrlString(rawValue: string) {
  return rawValue.trim();
}

export function isSupportedTikTokHost(host: string) {
  return SUPPORTED_TIKTOK_HOSTS.includes(
    host.toLowerCase() as (typeof SUPPORTED_TIKTOK_HOSTS)[number]
  );
}

export function isSupportedTikTokPath(path: string) {
  const normalizedPath = path.toLowerCase();
  return /\/@[^/]+\/video\/\d+/.test(normalizedPath) || normalizedPath.startsWith("/t/");
}

export function buildCanonicalTikTokUrl(parsed: URL) {
  const normalized = new URL(parsed.toString());
  normalized.protocol = normalized.protocol.toLowerCase();
  normalized.hostname = normalized.hostname.toLowerCase();
  normalized.search = "";
  normalized.hash = "";
  return normalized.toString();
}

export function parseTikTokUrlInput(rawValue: string): UrlValidationResult {
  const trimmed = normalizeUrlString(rawValue);

  if (!trimmed) {
    return {
      ok: false,
      code: "MISSING_URL",
      message: "Collez une URL TikTok publique ou passez par l'upload video.",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      code: "INVALID_URL",
      message: "URL invalide. Copiez une adresse complete en http(s), ou importez le fichier video.",
    };
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    return {
      ok: false,
      code: "UNSUPPORTED_SCHEME",
      message: "Utilisez une URL http(s) publique, ou passez par l'upload video.",
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (!isSupportedTikTokHost(host)) {
    return {
      ok: false,
      code: "UNSUPPORTED_URL",
      message:
        "Cette URL n'est pas supportee en beta URL. Collez une URL TikTok publique, ou importez la video directement.",
    };
  }

  const path = parsed.pathname;
  const isShortUrl = host === "vm.tiktok.com" || host === "vt.tiktok.com";
  if (!isShortUrl && !isSupportedTikTokPath(path)) {
    return {
      ok: false,
      code: "UNSUPPORTED_TIKTOK_PATH",
      message:
        "Format non reconnu. Utilisez une URL video TikTok publique, ou importez la video directement.",
    };
  }

  return {
    ok: true,
    value: {
      raw: rawValue,
      trimmed,
      parsed,
      normalizedUrl: buildCanonicalTikTokUrl(parsed),
      host,
      path,
      isShortUrl,
    },
  };
}

export function validateTikTokUrl(value: string) {
  const result = parseTikTokUrlInput(value);
  return result.ok ? null : result.message;
}
