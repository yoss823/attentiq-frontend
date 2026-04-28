import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type EnterpriseLeadBody = {
  fullName?: unknown;
  workEmail?: unknown;
  phone?: unknown;
  company?: unknown;
  supports?: unknown;
  monthlyVolume?: unknown;
  projectDescription?: unknown;
  preferredContact?: unknown;
};

function toText(value: unknown, max = 2000): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  let body: EnterpriseLeadBody;
  try {
    body = (await request.json()) as EnterpriseLeadBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON", userMessage: "Requête invalide." },
      { status: 400 }
    );
  }

  const fullName = toText(body.fullName, 120);
  const workEmail = toText(body.workEmail, 160).toLowerCase();
  const phone = toText(body.phone, 60);
  const company = toText(body.company, 120);
  const supports = toText(body.supports, 240);
  const monthlyVolume = toText(body.monthlyVolume, 80);
  const projectDescription = toText(body.projectDescription, 3000);
  const preferredContact = toText(body.preferredContact, 40);

  if (!fullName || !workEmail || !company || !projectDescription) {
    return NextResponse.json(
      {
        ok: false,
        error: "MISSING_FIELDS",
        userMessage:
          "Merci de compléter le nom, l'email, l'entreprise et la description.",
      },
      { status: 400 }
    );
  }

  if (!isValidEmail(workEmail)) {
    return NextResponse.json(
      { ok: false, error: "INVALID_EMAIL", userMessage: "Email invalide." },
      { status: 400 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.ATTENTIQ_ENTERPRISE_LEADS_TO?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Attentiq Entreprise <onboarding@resend.dev>";

  if (!resendApiKey || !to) {
    return NextResponse.json(
      {
        ok: false,
        error: "MISSING_EMAIL_CONFIG",
        userMessage:
          "Configuration email incomplète. Ajoutez RESEND_API_KEY et ATTENTIQ_ENTERPRISE_LEADS_TO.",
      },
      { status: 503 }
    );
  }

  const subject = `[Lead Entreprise] ${company} · ${fullName}`;
  const html = `
    <h2>Nouvelle demande Entreprise Attentiq</h2>
    <p><strong>Nom :</strong> ${escapeHtml(fullName)}</p>
    <p><strong>Email :</strong> ${escapeHtml(workEmail)}</p>
    <p><strong>Téléphone :</strong> ${escapeHtml(phone || "—")}</p>
    <p><strong>Entreprise :</strong> ${escapeHtml(company)}</p>
    <p><strong>Supports à analyser :</strong> ${escapeHtml(
      supports || "Non précisé"
    )}</p>
    <p><strong>Volume mensuel :</strong> ${escapeHtml(
      monthlyVolume || "Non précisé"
    )}</p>
    <p><strong>Canal préféré :</strong> ${escapeHtml(
      preferredContact || "email"
    )}</p>
    <hr />
    <p><strong>Description du besoin :</strong></p>
    <p>${escapeHtml(projectDescription).replace(/\n/g, "<br/>")}</p>
  `.trim();

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: workEmail,
      subject,
      html,
    });
    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: "SEND_FAILED",
          userMessage: "Envoi impossible pour le moment. Réessayez dans 2 minutes.",
        },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "SEND_FAILED",
        userMessage: "Envoi impossible pour le moment. Réessayez dans 2 minutes.",
      },
      { status: 502 }
    );
  }
}
