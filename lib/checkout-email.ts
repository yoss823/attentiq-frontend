import "server-only";

import { getOfferBySlug } from "@/lib/offer-config";

function offerDisplayName(offerSlug: string) {
  return getOfferBySlug(offerSlug)?.name ?? offerSlug;
}

function forceHttpForLocalhost(urlValue: string | null | undefined) {
  const raw = urlValue?.trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();
    if (
      host.includes("localhost") ||
      host === "127.0.0.1" ||
      host === "0.0.0.0"
    ) {
      parsed.protocol = "http:";
      return parsed.toString();
    }
    return parsed.toString();
  } catch {
    return raw;
  }
}

/**
 * E-mail de remerciement après paiement Stripe (idempotence par session_id).
 * Configurez RESEND_API_KEY + RESEND_FROM_EMAIL sur Railway.
 */
export type CheckoutThankYouEmailResult =
  | { ok: true; skipped: true; reason: "missing_api_key" }
  | { ok: true; resendEmailId: string }
  | { ok: false; error: string };

export async function sendCheckoutThankYouEmail(params: {
  to: string;
  offerSlug: string;
  sessionId: string;
  appBaseUrl?: string | null;
  reportUrl?: string | null;
}): Promise<CheckoutThankYouEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[checkout-email] skip: RESEND_API_KEY is empty on server");
    return { ok: true, skipped: true, reason: "missing_api_key" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Attentiq <onboarding@resend.dev>";

  const base =
    forceHttpForLocalhost(params.appBaseUrl)?.replace(/\/+$/, "") ||
    forceHttpForLocalhost(process.env.NEXT_PUBLIC_APP_URL)?.replace(/\/+$/, "") ||
    "";

  const label = offerDisplayName(params.offerSlug);
  const subject = `Merci — paiement confirmé (${label})`;
  const compteUrl = base
    ? `${base}/compte?email=${encodeURIComponent(params.to.trim())}`
    : "";
  const analyzeUrl = base ? `${base}/videos` : "";
  const reportUrl = forceHttpForLocalhost(params.reportUrl);
  const html = `
    <p>Bonjour,</p>
    <p>Votre paiement Attentiq est bien enregistré pour : <strong>${escapeHtml(label)}</strong>.</p>
    <p>Vous pouvez reprendre sur Attentiq immédiatement.</p>
    ${
      reportUrl
        ? `<p><a href="${escapeHtml(reportUrl)}">Ouvrir mon rapport</a></p>`
        : ""
    }
    ${
      analyzeUrl
        ? `<p><a href="${escapeHtml(analyzeUrl)}">Analyser un autre média</a></p>`
        : ""
    }
    ${base ? `<p><a href="${escapeHtml(base)}">Ouvrir Attentiq</a></p>` : ""}
    ${
      compteUrl
        ? `<p>Pour votre espace client (quota / historique), rendez-vous sur <a href="${escapeHtml(compteUrl)}">la page Compte</a> et demandez un lien de connexion sécurisé.</p>`
        : ""
    }
    <p style="color:#666;font-size:13px;">Réf. session : ${escapeHtml(params.sessionId)}</p>
    <p>— L’équipe Attentiq</p>
  `.trim();

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send(
      {
        from,
        to: params.to.trim(),
        subject,
        html,
      },
      {
        idempotencyKey: `checkout-thankyou:${params.sessionId}`,
      }
    );

    if (error) {
      console.error("[checkout-email] Resend error:", error);
      const msg =
        typeof error === "object" &&
        error &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
          ? (error as { message: string }).message
          : "resend_error";
      return { ok: false, error: msg };
    }
    const resendEmailId =
      data &&
      typeof data === "object" &&
      "id" in data &&
      typeof (data as { id: unknown }).id === "string"
        ? (data as { id: string }).id
        : null;
    if (!resendEmailId) {
      console.error("[checkout-email] Resend returned no id:", data);
      return { ok: false, error: "empty_resend_response" };
    }
    console.info("[checkout-email] sent", { resendEmailId, sessionId: params.sessionId });
    return { ok: true, resendEmailId };
  } catch (e) {
    console.error("[checkout-email] send failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : "send_failed" };
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
