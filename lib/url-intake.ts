export const URL_PIPELINE_VERSION = "bloc-a-j0-url-v2-2026-04-21";

export const SUPPORTED_TIKTOK_HOSTS = [
  "www.tiktok.com", "m.tiktok.com", "tiktok.com", "vm.tiktok.com", "vt.tiktok.com",
] as const;

const SUPPORTED_YOUTUBE_CORE = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
]);

const SUPPORTED_INSTAGRAM_CORE = new Set(["instagram.com"]);

function hostCore(hostname: string) {
  const h = hostname.toLowerCase();
  return h.startsWith("www.") ? h.slice(4) : h;
}

export type ParsedTikTokUrl = {
  raw: string; trimmed: string; parsed: URL;
  normalizedUrl: string; host: string; path: string; isShortUrl: boolean;
};

export type UrlValidationResult =
  | { ok: true; value: ParsedTikTokUrl }
  | { ok: false; code: string; message: string };

export function isSupportedTikTokHost(host: string) {
  return SUPPORTED_TIKTOK_HOSTS.includes(host.toLowerCase() as (typeof SUPPORTED_TIKTOK_HOSTS)[number]);
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
  const trimmed = rawValue.trim();
  if (!trimmed) return { ok: false, code: "MISSING_URL", message: "Collez une URL TikTok publique ou passez par l'upload video." };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, code: "INVALID_URL", message: "URL invalide. Copiez une adresse complete en http(s), ou importez le fichier video." };
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:")
    return { ok: false, code: "UNSUPPORTED_SCHEME", message: "Utilisez une URL http(s) publique, ou passez par l'upload video." };

  const host = parsed.hostname.toLowerCase();
  if (!isSupportedTikTokHost(host))
    return { ok: false, code: "UNSUPPORTED_URL", message: "Cette URL n'est pas supportee en beta URL. Collez une URL TikTok publique, ou importez la video directement." };

  const path = parsed.pathname;
  const isShortUrl = host === "vm.tiktok.com" || host === "vt.tiktok.com";
  if (!isShortUrl && !isSupportedTikTokPath(path))
    return { ok: false, code: "UNSUPPORTED_TIKTOK_PATH", message: "Format non reconnu. Utilisez une URL video TikTok publique, ou importez la video directement." };

  return { ok: true, value: { raw: rawValue, trimmed, parsed, normalizedUrl: buildCanonicalTikTokUrl(parsed), host, path, isShortUrl } };
}

export function validateTikTokUrl(value: string) {
  const result = parseTikTokUrlInput(value);
  return result.ok ? null : result.message;
}

export type GenericVideoUrlResult =
  | { ok: true; normalizedUrl: string }
  | { ok: false; code: string; message: string };

/**
 * URL courte non-TikTok (aligné sur le backend) : YouTube, Instagram Reel, Snapchat.
 */
export function parseGenericVideoUrlInput(rawValue: string): GenericVideoUrlResult {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return {
      ok: false,
      code: "MISSING_URL",
      message:
        "Collez une URL publique (YouTube Shorts, Instagram Reel, Snapchat…) ou importez la vidéo.",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      code: "INVALID_URL",
      message:
        "URL invalide. Copiez une adresse complète en https://, ou importez le fichier vidéo.",
    };
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    return {
      ok: false,
      code: "UNSUPPORTED_SCHEME",
      message: "Utilisez une URL https publique, ou passez par l'upload vidéo.",
    };
  }

  const host = parsed.hostname.toLowerCase();
  const core = hostCore(host);
  const path = parsed.pathname || "";
  const pathLower = path.toLowerCase();

  if (SUPPORTED_YOUTUBE_CORE.has(core)) {
    if (!path || path === "/") {
      return {
        ok: false,
        code: "UNSUPPORTED_YOUTUBE_PATH",
        message:
          "URL YouTube incomplète. Utilisez un lien Short (/shorts/…), une page watch ou youtu.be.",
      };
    }
    const u = new URL(parsed.toString());
    u.protocol = "https:";
    u.hostname = host;
    u.hash = "";
    return { ok: true, normalizedUrl: u.toString() };
  }

  if (SUPPORTED_INSTAGRAM_CORE.has(core)) {
    if (
      !pathLower.includes("/reel") &&
      !pathLower.includes("/tv/") &&
      !pathLower.includes("/p/")
    ) {
      return {
        ok: false,
        code: "UNSUPPORTED_INSTAGRAM_PATH",
        message:
          "Utilisez une URL de Reel ou de publication vidéo Instagram (/reel/, /tv/…).",
      };
    }
    const u = new URL(parsed.toString());
    u.protocol = "https:";
    u.hostname = host;
    u.hash = "";
    return { ok: true, normalizedUrl: u.toString() };
  }

  if (host.includes("snapchat.com")) {
    const u = new URL(parsed.toString());
    u.protocol = "https:";
    u.hostname = host;
    u.hash = "";
    return { ok: true, normalizedUrl: u.toString() };
  }

  return {
    ok: false,
    code: "UNSUPPORTED_URL",
    message:
      "URL non reconnue. Utilisez TikTok, YouTube, Instagram (Reel) ou Snapchat, ou importez la vidéo.",
  };
}

/** Plateforme d'affichage / payload API — dérivée de l'URL analysée. */
export function detectVideoPlatformFromUrl(rawUrl: string): string {
  try {
    const host = new URL(rawUrl.trim()).hostname.toLowerCase();
    if (host.includes("tiktok")) return "tiktok";
    if (host.includes("instagram")) return "instagram";
    if (host.includes("youtube") || host === "youtu.be") return "youtube";
    if (host.includes("snapchat")) return "snapchat";
    if (host.includes("twitter") || host === "x.com" || host.endsWith(".x.com")) {
      return "twitter";
    }
  } catch {
    /* ignore */
  }
  return "unknown";
}
