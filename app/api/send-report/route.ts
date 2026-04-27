import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Resend } from "resend";
import { getRailwayJobSnapshot } from "@/lib/railway-server";

export const runtime = "nodejs";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

type SendReportBody = {
  email?: string;
  subject?: string;
  body?: string;
  jobId?: string;
};

function normalizeText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function summarizeReport(result: Record<string, unknown>) {
  const data =
    result.data && typeof result.data === "object"
      ? (result.data as Record<string, unknown>)
      : null;
  const metadata =
    data?.metadata && typeof data.metadata === "object"
      ? (data.metadata as Record<string, unknown>)
      : null;
  const diagnostic =
    data?.diagnostic && typeof data.diagnostic === "object"
      ? (data.diagnostic as Record<string, unknown>)
      : null;

  const title = normalizeText(metadata?.title) ?? "Diagnostic Attentiq";
  const sourceUrl = normalizeText(metadata?.url);
  const score =
    typeof diagnostic?.retention_score === "number"
      ? diagnostic.retention_score.toFixed(1)
      : null;
  const summary = normalizeText(diagnostic?.global_summary) ?? "Aucun resume fourni.";
  const dropRule = normalizeText(diagnostic?.drop_off_rule) ?? "Aucune regle formelle.";
  const actions = Array.isArray(diagnostic?.corrective_actions)
    ? diagnostic.corrective_actions
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .slice(0, 5)
    : [];

  return {
    title,
    sourceUrl,
    score,
    summary,
    dropRule,
    actions,
  };
}

function splitTextLines(text: string, maxChars: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) {
      lines.push(current);
      current = word;
    } else {
      lines.push(word.slice(0, maxChars));
      current = word.slice(maxChars);
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines;
}

async function buildReportPdf(params: {
  jobId: string;
  title: string;
  sourceUrl: string | null;
  score: string | null;
  summary: string;
  dropRule: string;
  actions: string[];
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const margin = 48;
  let y = 790;

  const draw = (text: string, size = 11, isBold = false, color = rgb(0.1, 0.12, 0.16)) => {
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: isBold ? bold : font,
      color,
    });
    y -= size + 6;
  };

  draw("ATTENTIQ - Diagnostic PDF", 16, true);
  draw(`Job ID: ${params.jobId}`, 10);
  draw(`Genere le: ${new Date().toLocaleString("fr-FR")}`, 10);
  y -= 8;
  draw(params.title, 14, true);
  if (params.sourceUrl) {
    for (const line of splitTextLines(`Source: ${params.sourceUrl}`, 90)) {
      draw(line, 9);
    }
  }
  if (params.score) {
    draw(`Retention score: ${params.score}/10`, 11, true);
  }

  y -= 8;
  draw("Resume global", 12, true);
  for (const line of splitTextLines(params.summary, 95)) {
    draw(line, 10);
  }

  y -= 8;
  draw("Regle de decrochage", 12, true);
  for (const line of splitTextLines(params.dropRule, 95)) {
    draw(line, 10);
  }

  y -= 8;
  draw("Actions prioritaires", 12, true);
  if (params.actions.length === 0) {
    draw("- Aucune action disponible", 10);
  } else {
    params.actions.forEach((action, idx) => {
      for (const [lineIdx, line] of splitTextLines(`${idx + 1}. ${action}`, 95).entries()) {
        draw(lineIdx === 0 ? line : `   ${line}`, 10);
      }
    });
  }

  return Buffer.from(await pdfDoc.save());
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, subject, body, jobId } = payload as SendReportBody;

  if (!email || !isValidEmail(email)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }

  const finalSubject = normalizeText(subject)
    ? normalizeText(subject)!
    : "Votre diagnostic Attentiq";
  const manualBody = normalizeText(body) ?? "Voici votre diagnostic Attentiq.";
  const normalizedJobId = normalizeText(jobId);

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 500 }
    );
  }
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "Attentiq <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  let attachment:
    | { filename: string; content: Buffer; contentType: string }
    | undefined;
  let html = `<p>${manualBody.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;

  if (normalizedJobId) {
    const snapshot = await getRailwayJobSnapshot(normalizedJobId);
    if (snapshot.status !== "success" || !snapshot.result) {
      return Response.json(
        { error: "Job not ready", userMessage: "Le diagnostic n'est pas encore disponible." },
        { status: 409 }
      );
    }
    const reportSummary = summarizeReport(snapshot.result);
    const pdfBuffer = await buildReportPdf({
      jobId: normalizedJobId,
      ...reportSummary,
    });
    attachment = {
      filename: `attentiq-diagnostic-${normalizedJobId}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    };

    html = `
      <p>Bonjour,</p>
      <p>Votre diagnostic Attentiq est pret. Le PDF est en piece jointe.</p>
      <p><strong>Job ID:</strong> ${normalizedJobId}</p>
      <p>${manualBody.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      <p>— L'equipe Attentiq</p>
    `.trim();
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: email.trim(),
      subject: finalSubject,
      html,
      attachments: attachment ? [attachment] : undefined,
    });
    if (error) {
      return Response.json(
        { error: "Resend send failed", detail: error },
        { status: 500 }
      );
    }
    return Response.json({ success: true, id: data?.id ?? null });
  } catch (error) {
    return Response.json(
      { error: "Unexpected send error", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
