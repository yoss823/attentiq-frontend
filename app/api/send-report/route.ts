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
  report?: unknown;
};

function normalizeText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

type ReportDrop = {
  timestampSeconds: number | null;
  severity: string | null;
  cause: string;
};

type ReportSummary = {
  title: string;
  sourceUrl: string | null;
  author: string | null;
  durationSeconds: number | null;
  score: string | null;
  summary: string;
  dropRule: string;
  creatorPerception: string;
  audienceLossEstimate: string;
  drops: ReportDrop[];
  actions: string[];
};

function toFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeV2Score(value: unknown) {
  const raw = toFiniteNumber(value);
  if (raw == null) return null;
  const on10 = raw <= 1 ? raw * 10 : raw;
  return Math.max(0, Math.min(10, on10)).toFixed(1);
}

function humanizeV2Label(label: string | null) {
  if (!label) return null;
  return label
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summarizeV2Result(result: Record<string, unknown>): ReportSummary | null {
  const diagnostic =
    result.diagnostic && typeof result.diagnostic === "object"
      ? (result.diagnostic as Record<string, unknown>)
      : null;
  if (!diagnostic) {
    return null;
  }

  const hasV2DiagnosticShape =
    typeof diagnostic.explanation === "string" ||
    typeof diagnostic.label === "string" ||
    typeof diagnostic.score === "number";
  if (!hasV2DiagnosticShape) {
    return null;
  }

  const inputFormat = normalizeText(result.inputFormat);
  const defaultTitle =
    inputFormat === "text"
      ? "Diagnostic d'attention (texte)"
      : inputFormat === "image"
        ? "Diagnostic d'attention (image)"
        : "Diagnostic d'attention (video)";
  const score = normalizeV2Score(diagnostic.score);
  const summary =
    normalizeText(diagnostic.explanation) ?? "Aucun resume fourni.";
  const dropRule =
    humanizeV2Label(normalizeText(diagnostic.label)) ??
    "Aucune regle formelle.";

  const dashboard = Array.isArray(result.dashboard)
    ? result.dashboard.filter(
        (item): item is Record<string, unknown> =>
          Boolean(item && typeof item === "object")
      )
    : [];
  const creatorPerception =
    dashboard.length > 0
      ? `Signaux releves: ${dashboard
          .slice(0, 4)
          .map((metric) => {
            const label = normalizeText(metric.label) ?? "indicateur";
            const value =
              typeof metric.value === "number" || typeof metric.value === "string"
                ? String(metric.value)
                : "n/a";
            return `${label} (${value})`;
          })
          .join(" · ")}`
      : "Perception non disponible.";

  const audienceLossEstimate =
    score != null
      ? `Score ${score}/10 : ce score mesure la tenue d'attention percue, pas une prediction de vues.`
      : "Estimation d'impact non disponible.";

  const actions = Array.isArray(result.actions)
    ? result.actions
        .filter(
          (item): item is Record<string, unknown> =>
            Boolean(item && typeof item === "object")
        )
        .map((item) => normalizeText(item.label))
        .filter((label): label is string => Boolean(label))
        .slice(0, 12)
    : [];

  const drops = Array.isArray(result.attentionDrops)
    ? result.attentionDrops
        .filter(
          (item): item is Record<string, unknown> =>
            Boolean(item && typeof item === "object")
        )
        .map((item) => ({
          timestampSeconds: toFiniteNumber(item.timestampSeconds),
          severity: normalizeText(item.severity),
          cause:
            normalizeText(item.cause) ??
            "Cause non detaillee dans la sortie pipeline.",
        }))
        .slice(0, 20)
    : [];

  return {
    title: normalizeText(result.id) ? `${defaultTitle} (${result.id})` : defaultTitle,
    sourceUrl: normalizeText(result.sourceUrl),
    author: "@attentiq",
    durationSeconds: toFiniteNumber(result.durationSeconds),
    score,
    summary,
    dropRule,
    creatorPerception,
    audienceLossEstimate,
    drops,
    actions,
  };
}

function summarizeReport(result: Record<string, unknown>) {
  const v2Summary = summarizeV2Result(result);
  if (v2Summary) {
    return v2Summary;
  }

  const data =
    result.data && typeof result.data === "object"
      ? (result.data as Record<string, unknown>)
      : null;
  const metadata =
    ((data?.metadata && typeof data.metadata === "object"
      ? (data.metadata as Record<string, unknown>)
      : null) ??
      (result.metadata && typeof result.metadata === "object"
        ? (result.metadata as Record<string, unknown>)
        : null)) ||
    null;
  const diagnostic =
    ((data?.diagnostic && typeof data.diagnostic === "object"
      ? (data.diagnostic as Record<string, unknown>)
      : null) ??
      (result.diagnostic && typeof result.diagnostic === "object"
        ? (result.diagnostic as Record<string, unknown>)
        : null)) ||
    null;

  const title =
    normalizeText(metadata?.title) ??
    normalizeText(result.text) ??
    "Diagnostic Attentiq";
  const sourceUrl = normalizeText(metadata?.url);
  const score =
    typeof diagnostic?.retention_score === "number"
      ? diagnostic.retention_score.toFixed(1)
      : null;
  const summary = normalizeText(diagnostic?.global_summary) ?? "Aucun resume fourni.";
  const dropRule = normalizeText(diagnostic?.drop_off_rule) ?? "Aucune regle formelle.";
  const creatorPerception =
    normalizeText(diagnostic?.creator_perception) ?? "Perception non disponible.";
  const audienceLossEstimate =
    normalizeText(diagnostic?.audience_loss_estimate) ??
    "Estimation d'impact non disponible.";
  const actions = Array.isArray(diagnostic?.corrective_actions)
    ? diagnostic.corrective_actions
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .slice(0, 12)
    : [];
  const drops = Array.isArray(diagnostic?.attention_drops)
    ? diagnostic.attention_drops
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
        .map((item) => ({
          timestampSeconds:
            typeof item.timestamp_seconds === "number" ? item.timestamp_seconds : null,
          severity: normalizeText(item.severity),
          cause:
            normalizeText(item.cause) ??
            "Cause non detaillee dans la sortie pipeline.",
        }))
        .slice(0, 20)
    : [];

  return {
    title,
    sourceUrl,
    author: normalizeText(metadata?.author),
    durationSeconds:
      typeof metadata?.duration_seconds === "number"
        ? metadata.duration_seconds
        : null,
    score,
    summary,
    dropRule,
    creatorPerception,
    audienceLossEstimate,
    drops,
    actions,
  } satisfies ReportSummary;
}

function summarizeFromClientReport(reportPayload: unknown) {
  if (!reportPayload || typeof reportPayload !== "object") {
    return null;
  }
  const candidate = reportPayload as Record<string, unknown>;
  const data =
    candidate.data && typeof candidate.data === "object"
      ? (candidate.data as Record<string, unknown>)
      : null;
  if (!data) {
    return null;
  }
  return summarizeReport({ data });
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
  author: string | null;
  durationSeconds: number | null;
  score: string | null;
  summary: string;
  dropRule: string;
  creatorPerception: string;
  audienceLossEstimate: string;
  drops: ReportDrop[];
  actions: string[];
}) {
  const pdfDoc = await PDFDocument.create();
  const pageSize: [number, number] = [595, 842];
  let page = pdfDoc.addPage(pageSize); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const margin = 48;
  let y = 790;

  const drawHeaderBand = (title: string, subtitle: string) => {
    page.drawRectangle({
      x: 0,
      y: 768,
      width: pageSize[0],
      height: 74,
      color: rgb(0.03, 0.18, 0.22),
    });
    page.drawText(title, {
      x: margin,
      y: 812,
      size: 18,
      font: bold,
      color: rgb(0.62, 0.95, 1),
    });
    page.drawText(subtitle, {
      x: margin,
      y: 792,
      size: 10,
      font,
      color: rgb(0.83, 0.91, 0.95),
    });
    y = 748;
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y - requiredHeight >= margin) {
      return;
    }
    page = pdfDoc.addPage(pageSize);
    drawHeaderBand("ATTENTIQ - Rapport complet", `Job ${params.jobId}`);
  };

  const draw = (text: string, size = 11, isBold = false, color = rgb(0.1, 0.12, 0.16)) => {
    ensureSpace(size + 8);
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: isBold ? bold : font,
      color,
    });
    y -= size + 6;
  };

  const drawWrapped = (text: string, size = 10, isBold = false) => {
    for (const line of splitTextLines(text, 95)) {
      draw(line, size, isBold);
    }
  };

  const drawSectionTitle = (text: string) => {
    ensureSpace(28);
    page.drawRectangle({
      x: margin - 8,
      y: y - 6,
      width: pageSize[0] - margin * 2 + 16,
      height: 22,
      color: rgb(0.93, 0.97, 0.99),
    });
    draw(text, 12, true, rgb(0.05, 0.18, 0.24));
  };

  drawHeaderBand("ATTENTIQ - Rapport complet", "Diagnostic PDF premium");
  draw(`Job ID: ${params.jobId}`, 10);
  draw(`Genere le: ${new Date().toLocaleString("fr-FR")}`, 10);
  y -= 8;
  draw(params.title, 14, true);
  if (params.author) {
    draw(`Auteur: ${params.author}`, 10);
  }
  if (typeof params.durationSeconds === "number") {
    draw(`Duree: ${Math.max(0, Math.round(params.durationSeconds))}s`, 10);
  }
  if (params.sourceUrl) {
    drawWrapped(`Source: ${params.sourceUrl}`, 9);
  }
  if (params.score) {
    draw(`Retention score: ${params.score}/10`, 11, true);
  }

  y -= 8;
  drawSectionTitle("Resume global");
  drawWrapped(params.summary, 10);

  y -= 8;
  drawSectionTitle("Regle de decrochage");
  drawWrapped(params.dropRule, 10);

  y -= 8;
  drawSectionTitle("Perception spectateur");
  drawWrapped(params.creatorPerception, 10);

  y -= 8;
  drawSectionTitle("Impact estime");
  drawWrapped(params.audienceLossEstimate, 10);

  y -= 8;
  drawSectionTitle("Points de chute");
  if (params.drops.length === 0) {
    draw("- Aucune chute detaillee", 10);
  } else {
    params.drops.forEach((drop, idx) => {
      const timeLabel =
        typeof drop.timestampSeconds === "number"
          ? `${Math.max(0, Math.round(drop.timestampSeconds))}s`
          : "?s";
      const severityLabel = drop.severity ? drop.severity.toUpperCase() : "INCONNUE";
      draw(`${idx + 1}. ${timeLabel} · ${severityLabel}`, 10, true);
      drawWrapped(`Cause: ${drop.cause}`, 10);
      y -= 2;
    });
  }

  y -= 8;
  drawSectionTitle("Actions prioritaires");
  if (params.actions.length === 0) {
    draw("- Aucune action disponible", 10);
  } else {
    params.actions.forEach((action, idx) => {
      drawWrapped(`${idx + 1}. ${action}`, 10);
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

  const { email, subject, body, jobId, report } = payload as SendReportBody;

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
    let reportSummary = summarizeFromClientReport(report);
    if (!reportSummary) {
      const snapshot = await getRailwayJobSnapshot(normalizedJobId);
      if (snapshot.status !== "success" || !snapshot.result) {
        return Response.json(
          { error: "Job not ready", userMessage: "Le diagnostic n'est pas encore disponible." },
          { status: 409 }
        );
      }
      reportSummary = summarizeReport(snapshot.result);
    }
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
