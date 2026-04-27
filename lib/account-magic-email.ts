import "server-only";

export type SendAccountMagicLoginEmailResult =
  | { ok: true; skipped: true; reason: "missing_api_key" }
  | { ok: true; resendEmailId: string }
  | { ok: false; error: string };

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendAccountMagicLoginEmail(params: {
  to: string;
  magicUrl: string;
  idempotencyKey: string;
}): Promise<SendAccountMagicLoginEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[account-magic-email] skip: RESEND_API_KEY is empty on server");
    return { ok: true, skipped: true, reason: "missing_api_key" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Attentiq <onboarding@resend.dev>";

  const subject = "Votre lien de connexion Attentiq";
  const html = `
    <p>Bonjour,</p>
    <p>Voici votre lien securise pour ouvrir votre espace client Attentiq (valable quelques minutes) :</p>
    <p><a href="${escapeHtml(params.magicUrl)}">Ouvrir mon espace client</a></p>
    <p style="color:#666;font-size:13px;">Si vous n&apos;avez pas demande ce lien, ignorez simplement cet email.</p>
    <p>— L&apos;equipe Attentiq</p>
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
        idempotencyKey: params.idempotencyKey,
      }
    );

    if (error) {
      console.error("[account-magic-email] Resend error:", error);
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
      console.error("[account-magic-email] Resend returned no id:", data);
      return { ok: false, error: "empty_resend_response" };
    }
    console.info("[account-magic-email] sent", { resendEmailId });
    return { ok: true, resendEmailId };
  } catch (e) {
    console.error("[account-magic-email] send failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : "send_failed" };
  }
}
