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
  const margin = 34;
  const contentWidth = pageSize[0] - margin * 2;
  let y = 0;
  let pageIndex = 1;

  const colors = {
    bg: rgb(0.02, 0.08, 0.13),
    bgSoft: rgb(0.05, 0.11, 0.17),
    card: rgb(0.96, 0.98, 1),
    cardBorder: rgb(0.84, 0.9, 0.96),
    title: rgb(0.03, 0.16, 0.23),
    text: rgb(0.12, 0.16, 0.2),
    muted: rgb(0.33, 0.4, 0.46),
    accent: rgb(0.0, 0.66, 0.8),
    accentSoft: rgb(0.88, 0.96, 1),
  };

  const startPage = (subtitle: string) => {
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageSize[0],
      height: pageSize[1],
      color: rgb(0.99, 1, 1),
    });
    page.drawRectangle({
      x: 0,
      y: pageSize[1] - 112,
      width: pageSize[0],
      height: 112,
      color: colors.bg,
    });
    page.drawRectangle({
      x: 0,
      y: pageSize[1] - 118,
      width: pageSize[0],
      height: 6,
      color: colors.accent,
    });
    page.drawText("ATTENTIQ - Rapport complet", {
      x: margin,
      y: pageSize[1] - 48,
      size: 20,
      font: bold,
      color: rgb(0.7, 0.95, 1),
    });
    page.drawText(subtitle, {
      x: margin,
      y: pageSize[1] - 70,
      size: 11,
      font,
      color: rgb(0.84, 0.92, 0.96),
    });
    page.drawText(`Page ${pageIndex}`, {
      x: pageSize[0] - margin - 44,
      y: pageSize[1] - 70,
      size: 10,
      font,
      color: rgb(0.72, 0.84, 0.9),
    });
    y = pageSize[1] - 134;
  };

  const addNewPage = (subtitle: string) => {
    page = pdfDoc.addPage(pageSize);
    pageIndex += 1;
    startPage(subtitle);
  };

  const ensureSpace = (requiredHeight: number, subtitle: string) => {
    if (y - requiredHeight >= margin) {
      return;
    }
    addNewPage(subtitle);
  };

  const drawCard = (height: number, subtitle: string, tone: "default" | "accent" = "default") => {
    ensureSpace(height, subtitle);
    page.drawRectangle({
      x: margin,
      y: y - height,
      width: contentWidth,
      height,
      color: tone === "accent" ? colors.accentSoft : colors.card,
      borderColor: tone === "accent" ? rgb(0.67, 0.86, 0.95) : colors.cardBorder,
      borderWidth: 1,
    });
    const topY = y - 18;
    y -= height + 10;
    return topY;
  };

  const drawSectionCard = (sectionTitle: string, content: string, subtitle: string) => {
    const lines = splitTextLines(content, 94);
    const cardHeight = 40 + lines.length * 14;
    const topY = drawCard(cardHeight, subtitle);
    page.drawText(sectionTitle, {
      x: margin + 14,
      y: topY,
      size: 11,
      font: bold,
      color: colors.title,
    });
    let lineY = topY - 18;
    for (const line of lines) {
      page.drawText(line, {
        x: margin + 14,
        y: lineY,
        size: 10,
        font,
        color: colors.text,
      });
      lineY -= 14;
    }
  };

  const severityTone = (severity: string | null) => {
    const key = (severity ?? "").toLowerCase();
    if (key === "critical" || key === "high") return rgb(0.75, 0.08, 0.08);
    if (key === "medium") return rgb(0.76, 0.35, 0.04);
    return rgb(0.46, 0.44, 0.12);
  };

  startPage("Diagnostic PDF premium");

  const titleLines = splitTextLines(params.title, 50);
  const sourceLines = params.sourceUrl ? splitTextLines(params.sourceUrl, 74) : [];
  const heroHeight =
    76 +
    titleLines.length * 14 +
    (params.author ? 14 : 0) +
    (params.durationSeconds != null ? 14 : 0) +
    sourceLines.length * 12;
  const heroTop = drawCard(heroHeight, `Job ${params.jobId}`, "accent");

  page.drawText(`Job ID: ${params.jobId}`, {
    x: margin + 14,
    y: heroTop,
    size: 10,
    font,
    color: colors.muted,
  });
  page.drawText(`Genere le: ${new Date().toLocaleString("fr-FR")}`, {
    x: margin + 14,
    y: heroTop - 13,
    size: 10,
    font,
    color: colors.muted,
  });

  let heroTextY = heroTop - 34;
  for (const line of titleLines) {
    page.drawText(line, {
      x: margin + 14,
      y: heroTextY,
      size: 14,
      font: bold,
      color: colors.title,
    });
    heroTextY -= 15;
  }
  if (params.author) {
    page.drawText(`Auteur: ${params.author}`, {
      x: margin + 14,
      y: heroTextY - 2,
      size: 10,
      font,
      color: colors.text,
    });
    heroTextY -= 14;
  }
  if (params.durationSeconds != null) {
    page.drawText(`Duree: ${Math.max(0, Math.round(params.durationSeconds))}s`, {
      x: margin + 14,
      y: heroTextY - 2,
      size: 10,
      font,
      color: colors.text,
    });
    heroTextY -= 14;
  }
  if (sourceLines.length > 0) {
    page.drawText("Source:", {
      x: margin + 14,
      y: heroTextY - 2,
      size: 10,
      font: bold,
      color: colors.text,
    });
    let sy = heroTextY - 14;
    for (const line of sourceLines) {
      page.drawText(line, {
        x: margin + 14,
        y: sy,
        size: 9,
        font,
        color: colors.muted,
      });
      sy -= 12;
    }
  }

  const scoreCardTop = heroTop - 8;
  const scoreCardX = margin + contentWidth - 130;
  page.drawRectangle({
    x: scoreCardX,
    y: scoreCardTop - 82,
    width: 116,
    height: 74,
    color: colors.bgSoft,
    borderColor: rgb(0.2, 0.39, 0.5),
    borderWidth: 1,
  });
  page.drawText("SCORE", {
    x: scoreCardX + 10,
    y: scoreCardTop - 20,
    size: 9,
    font: bold,
    color: rgb(0.72, 0.86, 0.93),
  });
  page.drawText(params.score ? `${params.score}/10` : "N/A", {
    x: scoreCardX + 10,
    y: scoreCardTop - 53,
    size: 26,
    font: bold,
    color: rgb(0.8, 0.95, 1),
  });

  drawSectionCard("Resume global", params.summary, `Job ${params.jobId}`);
  drawSectionCard("Regle de decrochage", params.dropRule, `Job ${params.jobId}`);
  drawSectionCard("Perception spectateur", params.creatorPerception, `Job ${params.jobId}`);
  drawSectionCard("Impact estime", params.audienceLossEstimate, `Job ${params.jobId}`);

  if (params.drops.length === 0) {
    drawSectionCard("Points de chute", "Aucune chute detaillee.", `Job ${params.jobId}`);
  } else {
    const dropHeaderTop = drawCard(34, `Job ${params.jobId}`);
    page.drawText("Points de chute", {
      x: margin + 14,
      y: dropHeaderTop - 2,
      size: 12,
      font: bold,
      color: colors.title,
    });

    for (let i = 0; i < params.drops.length; i += 1) {
      const drop = params.drops[i];
      const causeLines = splitTextLines(drop.cause, 82);
      const rowHeight = 48 + causeLines.length * 13;
      const rowTop = drawCard(rowHeight, `Job ${params.jobId}`);
      const timeLabel =
        typeof drop.timestampSeconds === "number"
          ? `${Math.max(0, Math.round(drop.timestampSeconds))}s`
          : "?s";
      const severityLabel = (drop.severity ?? "inconnue").toUpperCase();
      const sevColor = severityTone(drop.severity);

      page.drawRectangle({
        x: margin + 14,
        y: rowTop - 38,
        width: 56,
        height: 28,
        color: colors.bgSoft,
      });
      page.drawText(timeLabel, {
        x: margin + 26,
        y: rowTop - 28,
        size: 11,
        font: bold,
        color: rgb(0.77, 0.92, 0.98),
      });

      page.drawRectangle({
        x: margin + 78,
        y: rowTop - 24,
        width: 88,
        height: 16,
        color: rgb(1, 1, 1),
        borderColor: sevColor,
        borderWidth: 1,
      });
      page.drawText(severityLabel, {
        x: margin + 84,
        y: rowTop - 19,
        size: 8,
        font: bold,
        color: sevColor,
      });

      let cy = rowTop - 44;
      for (const line of causeLines) {
        page.drawText(line, {
          x: margin + 78,
          y: cy,
          size: 10,
          font,
          color: colors.text,
        });
        cy -= 13;
      }
    }
  }

  if (params.actions.length === 0) {
    drawSectionCard("Actions prioritaires", "Aucune action disponible.", `Job ${params.jobId}`);
  } else {
    const actionLines = params.actions.flatMap((action, idx) =>
      splitTextLines(`${idx + 1}. ${action}`, 90)
    );
    const actionHeight = 42 + actionLines.length * 14;
    const actionTop = drawCard(actionHeight, `Job ${params.jobId}`);
    page.drawText("Actions prioritaires", {
      x: margin + 14,
      y: actionTop,
      size: 11,
      font: bold,
      color: colors.title,
    });
    let ay = actionTop - 18;
    for (const line of actionLines) {
      page.drawText(line, {
        x: margin + 14,
        y: ay,
        size: 10,
        font,
        color: colors.text,
      });
      ay -= 14;
    }
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
    | { filename: string; content: string; contentType: string }
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
      // Resend attachments are safest as base64 strings.
      content: pdfBuffer.toString("base64"),
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
      const detailMessage =
        typeof error === "object" &&
        error &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "unknown_resend_error";
      return Response.json(
        {
          error: "Resend send failed",
          userMessage: "Echec envoi email (Resend). Verifiez la configuration expediteur.",
          detail: detailMessage,
        },
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
