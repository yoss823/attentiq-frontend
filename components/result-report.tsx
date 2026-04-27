"use client";

import Link from "next/link";
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import InlineChatbot from "@/components/inline-chatbot";
import StripeCta from "@/components/stripe-cta";
import { buildChatDiagnosticContext } from "@/lib/chat-context";
import {
  FREE_TEASER_LIMITS,
  getTeaserActions,
  getTeaserDrops,
} from "@/lib/offer-config";
import {
  resolveMaxAssistantRepliesForReport,
  resolvePremiumAccessState,
  type PremiumEntitlement,
} from "@/lib/premium";
import {
  formatAttentionDiagnosticEyebrow,
  polishDiagnosticFrenchForDisplay,
} from "@/lib/diagnostic-locale-fr";
import type { AttentiqReport, AttentionDrop } from "@/lib/railway-client";

type ResultReportProps = {
  report: AttentiqReport;
  initialPremiumEntitlement?: PremiumEntitlement | null;
  reportJobId?: string | null;
};

const SEVERITY_CONFIG: Record<
  AttentionDrop["severity"],
  { label: string; tone: string; border: string; text: string }
> = {
  low: {
    label: "Faible",
    tone: "rgba(250, 204, 21, 0.12)",
    border: "rgba(250, 204, 21, 0.24)",
    text: "#facc15",
  },
  medium: {
    label: "Moyenne",
    tone: "rgba(251, 146, 60, 0.12)",
    border: "rgba(251, 146, 60, 0.24)",
    text: "#fb923c",
  },
  high: {
    label: "Forte",
    tone: "rgba(248, 113, 113, 0.12)",
    border: "rgba(248, 113, 113, 0.24)",
    text: "#f87171",
  },
  critical: {
    label: "Critique",
    tone: "rgba(220, 38, 38, 0.12)",
    border: "rgba(220, 38, 38, 0.26)",
    text: "#ef4444",
  },
};

const CATEGORY_CONFIG = {
  verbal: {
    label: "Verbal",
    text: "#67e8f9",
    border: "rgba(103, 232, 249, 0.28)",
    tone: "rgba(103, 232, 249, 0.12)",
  },
  rythme: {
    label: "Rythme",
    text: "#c4b5fd",
    border: "rgba(196, 181, 253, 0.28)",
    tone: "rgba(196, 181, 253, 0.12)",
  },
  visuel: {
    label: "Visuel",
    text: "#f9a8d4",
    border: "rgba(249, 168, 212, 0.28)",
    tone: "rgba(249, 168, 212, 0.12)",
  },
} as const;

type DiagnosticCategory = keyof typeof CATEGORY_CONFIG;

type ContentKind = "video" | "text" | "image";

function inferContentKindFromPlatform(platform: string | undefined | null): ContentKind {
  const key = (platform ?? "").toLowerCase().trim();
  if (key === "text") return "text";
  if (key === "image") return "image";
  return "video";
}

function scoreAppearance(score: number | null | undefined) {
  if (score == null) {
    return {
      color: "var(--text-secondary)",
      label: "Score indisponible",
      border: "rgba(107, 130, 153, 0.24)",
      glow: "rgba(107, 130, 153, 0.1)",
    };
  }

  if (score > 7) {
    return {
      color: "#34d399",
      label: "Base solide",
      border: "rgba(52, 211, 153, 0.24)",
      glow: "rgba(52, 211, 153, 0.1)",
    };
  }

  if (score >= 5) {
    return {
      color: "#fb923c",
      label: "Base a renforcer",
      border: "rgba(251, 146, 60, 0.24)",
      glow: "rgba(251, 146, 60, 0.1)",
    };
  }

  return {
    color: "#f87171",
    label: "Priorite a corriger",
    border: "rgba(248, 113, 113, 0.24)",
    glow: "rgba(248, 113, 113, 0.1)",
  };
}

function formatDuration(seconds: number | undefined) {
  if (seconds == null || Number.isNaN(seconds)) {
    return "Duree inconnue";
  }

  const rounded = Math.max(0, Math.round(seconds));
  if (rounded < 60) {
    return `${rounded}s`;
  }

  const minutes = Math.floor(rounded / 60);
  const remainingSeconds = rounded % 60;

  return remainingSeconds === 0
    ? `${minutes} min`
    : `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
}

function formatTimestamp(seconds: number) {
  const rounded = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(rounded / 60);
  const remainingSeconds = rounded % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatAuthor(author: string | undefined) {
  if (!author) {
    return "Auteur inconnu";
  }

  return author.startsWith("@") ? author : `@${author}`;
}

function deriveCategories(
  text: string | null | undefined,
  isAudioOnly: boolean
): DiagnosticCategory[] {
  const value = (text ?? "").toLowerCase();
  const categories = new Set<DiagnosticCategory>();

  if (
    /voix|mot|phrase|promesse|script|explication|hook|parole|audio|verbal|question/.test(
      value
    )
  ) {
    categories.add("verbal");
  }

  if (
    /rythme|tempo|lent|long|pause|cadence|transition|acceleration|repetition|structure/.test(
      value
    )
  ) {
    categories.add("rythme");
  }

  if (
    !isAudioOnly &&
    /visuel|image|plan|cadre|mouvement|texte|cut|zoom|scene|regard|face|decor|sous-titre/.test(
      value
    )
  ) {
    categories.add("visuel");
  }

  if (categories.size === 0) {
    categories.add(isAudioOnly ? "verbal" : "rythme");
  }

  return Array.from(categories);
}

function buildStructuralCards(
  report: AttentiqReport,
  isAudioOnly: boolean
) {
  const diagnostic = report.data.diagnostic;

  return [
    {
      eyebrow: "Resume structurel",
      body:
        diagnostic?.global_summary ??
        "Le rapport n'a pas remonte de resume structurel detaille.",
    },
    {
      eyebrow: "Mecanique de chute",
      body:
        diagnostic?.drop_off_rule ??
        "Aucune regle de chute n'a ete formalisée dans ce diagnostic.",
    },
    {
      eyebrow: "Perception spectateur",
      body:
        diagnostic?.creator_perception ??
        "La perception du createur n'est pas detaillee dans cette reponse.",
    },
    {
      eyebrow: "Impact estime",
      body:
        diagnostic?.audience_loss_estimate ??
        "Aucune estimation d'impact audience n'est disponible.",
    },
    ...(isAudioOnly
      ? [
          {
            eyebrow: "Limite du mode audio",
            body:
              "Ce rapport reste utile pour le verbal et le rythme, mais les hypotheses visuelles sont volontairement absentes.",
          },
        ]
      : []),
  ];
}

function buildActionPriorityLabel(index: number) {
  if (index === 0) {
    return "Maintenant";
  }

  if (index === 1) {
    return "Ensuite";
  }

  return "Apres validation";
}

function buildAssistantPrompts(
  report: AttentiqReport,
  isPremiumUnlocked: boolean,
  isAudioOnly: boolean
) {
  const diagnostic = report.data.diagnostic;
  const firstDrop = diagnostic?.attention_drops?.[0];
  const firstTimestamp = firstDrop ? formatTimestamp(firstDrop.timestamp_seconds) : "le debut";
  const firstCategories = deriveCategories(firstDrop?.cause, isAudioOnly);
  const primaryCategory = CATEGORY_CONFIG[firstCategories[0]].label.toLowerCase();

  if (isPremiumUnlocked) {
    return [
      `Que corriger en premier vers ${firstTimestamp} ?`,
      `Comment traiter le point ${primaryCategory} sans casser le reste ?`,
      "Resumons le diagnostic structurel en 3 decisions",
      "Transforme le plan d'action en check-list de tournage",
      isAudioOnly
        ? "Que peut-on encore conclure avec l'audio uniquement ?"
        : "Quel test visuel ferais-tu en premier ?",
      "Qu'est-ce qui est critique vs secondaire ?",
    ];
  }

  return [
    "Quel est le probleme principal visible ici ?",
    `Que veut dire la chute vers ${firstTimestamp} ?`,
    "Le teaser suffit-il pour payer le complet ?",
    isAudioOnly
      ? "Que peut-on conclure malgre le mode audio-only ?"
      : "Qu'est-ce qui semble surtout verbal, rythme ou visuel ?",
    "Par quoi commencer si je ne change qu'une chose ?",
    "Resumons ce teaser en 3 points",
  ];
}

function AccessBanner({
  title,
  subtitle,
  eyebrow,
  tone,
  border,
  glow,
}: {
  title: string;
  subtitle: string;
  eyebrow: string;
  tone: string;
  border: string;
  glow: string;
}) {
  return (
    <Panel
      accentBorder={border}
      accentGlow={glow}
      tone={tone}
      style={{ marginBottom: "14px" }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontWeight: 800,
          color: "var(--text-primary)",
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          margin: "12px 0 0",
          fontSize: "clamp(1.5rem, 5vw, 2.3rem)",
          lineHeight: 0.98,
          letterSpacing: "-0.06em",
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          margin: "12px 0 0",
          fontSize: "14px",
          lineHeight: 1.8,
          color: "rgba(237, 242, 247, 0.84)",
          maxWidth: "44rem",
        }}
      >
        {subtitle}
      </p>
    </Panel>
  );
}

function Panel({
  children,
  accentBorder,
  accentGlow,
  tone,
  style,
}: {
  children: ReactNode;
  accentBorder?: string;
  accentGlow?: string;
  tone?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "22px",
        borderRadius: "28px",
        border: `1px solid ${accentBorder ?? "var(--border)"}`,
        background:
          tone ??
          "linear-gradient(180deg, rgba(12, 17, 23, 0.95) 0%, rgba(7, 11, 16, 0.96) 100%)",
        boxShadow: accentGlow
          ? `0 26px 90px ${accentGlow}`
          : "0 24px 80px rgba(3, 8, 14, 0.34)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <p
        style={{
          margin: 0,
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontWeight: 800,
          color: "var(--text-secondary)",
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          margin: "10px 0 0",
          fontSize: "clamp(1.2rem, 4vw, 1.7rem)",
          lineHeight: 1,
          letterSpacing: "-0.05em",
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: ReactNode;
  helper: string;
}) {
  return (
    <div
      style={{
        borderRadius: "22px",
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.03)",
        padding: "18px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          fontWeight: 800,
          color: "var(--text-secondary)",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "12px 0 0",
          fontSize: "34px",
          lineHeight: 0.95,
          letterSpacing: "-0.07em",
          fontWeight: 800,
          color: "var(--text-primary)",
        }}
      >
        {value}
      </p>
      <p
        style={{
          margin: "10px 0 0",
          fontSize: "13px",
          lineHeight: 1.7,
          color: "var(--text-secondary)",
        }}
      >
        {helper}
      </p>
    </div>
  );
}

function LockedPreviewCard({
  title,
  helper,
}: {
  title: string;
  helper: string;
}) {
  return (
    <div
      style={{
        borderRadius: "22px",
        border: "1px solid rgba(0, 212, 255, 0.16)",
        background:
          "linear-gradient(180deg, rgba(0, 212, 255, 0.08) 0%, rgba(9, 13, 18, 0.96) 100%)",
        padding: "18px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 10px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "var(--accent)",
          fontSize: "10px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
        }}
      >
        🔒 Complet
      </div>
      <p
        style={{
          margin: "14px 0 0",
          fontSize: "15px",
          fontWeight: 800,
          color: "var(--text-primary)",
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: "13px",
          lineHeight: 1.7,
          color: "rgba(237, 242, 247, 0.72)",
        }}
      >
        {helper}
      </p>
      <div
        style={{
          marginTop: "14px",
          display: "grid",
          gap: "8px",
          filter: "blur(2px)",
          opacity: 0.66,
        }}
      >
        <div
          style={{
            height: "12px",
            width: "86%",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <div
          style={{
            height: "12px",
            width: "72%",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            height: "12px",
            width: "64%",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.08)",
          }}
        />
      </div>
    </div>
  );
}

export default function ResultReport({
  report,
  initialPremiumEntitlement = null,
  reportJobId = null,
}: ResultReportProps) {
  const [isSendingPdf, setIsSendingPdf] = useState(false);
  const [sendPdfFeedback, setSendPdfFeedback] = useState<string | null>(null);

  async function handleSendPdf() {
    if (!reportJobId) {
      setSendPdfFeedback(
        "Ce rapport n'a pas de job ID exploitable pour generer le PDF."
      );
      return;
    }

    const rawEmail = window.prompt("Email du client pour envoyer le PDF :");
    const email = rawEmail?.trim() ?? "";
    if (!email) {
      return;
    }

    setIsSendingPdf(true);
    setSendPdfFeedback(null);
    try {
      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          jobId: reportJobId,
          subject: "Votre diagnostic Attentiq (PDF)",
          body: "Vous trouverez votre diagnostic en piece jointe.",
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; userMessage?: string }
        | null;

      if (!response.ok) {
        setSendPdfFeedback(
          payload?.userMessage ??
            payload?.error ??
            "Echec de l'envoi du PDF. Reessayez."
        );
        return;
      }
      setSendPdfFeedback(`PDF envoye a ${email}.`);
    } catch {
      setSendPdfFeedback("Impossible d'envoyer le PDF pour le moment.");
    } finally {
      setIsSendingPdf(false);
    }
  }

  if (report.data.status === "error") {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          background:
            "radial-gradient(circle at top, rgba(248, 113, 113, 0.16), transparent 26%), var(--bg-base)",
        }}
      >
        <Panel
          accentBorder="rgba(248, 113, 113, 0.24)"
          accentGlow="rgba(248, 113, 113, 0.12)"
          tone="linear-gradient(180deg, rgba(55, 17, 21, 0.82) 0%, rgba(18, 9, 11, 0.96) 100%)"
          style={{ maxWidth: "560px", width: "100%", textAlign: "center" }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(1.9rem, 7vw, 2.8rem)",
              letterSpacing: "-0.06em",
              color: "var(--text-primary)",
            }}
          >
            Analyse impossible
          </h1>
          <p
            style={{
              margin: "14px 0 0",
              fontSize: "15px",
              lineHeight: 1.8,
              color: "rgba(237, 242, 247, 0.8)",
            }}
          >
            {report.text}
          </p>
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/analyze"
              style={{
                padding: "13px 18px",
                borderRadius: "999px",
                textDecoration: "none",
                background: "#f87171",
                color: "#18090b",
                fontSize: "14px",
                fontWeight: 900,
              }}
            >
              Reessayer
            </Link>
            <Link
              href="/"
              style={{
                padding: "13px 18px",
                borderRadius: "999px",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontWeight: 800,
              }}
            >
              Retour a l&apos;accueil
            </Link>
          </div>
        </Panel>
      </main>
    );
  }

  const metadata = report.data.metadata;
  const diagnostic = report.data.diagnostic;
  const contentKind = inferContentKindFromPlatform(metadata?.platform);
  const isVideoContent = contentKind === "video";
  const analyzeHref =
    contentKind === "text" ? "/text" : contentKind === "image" ? "/images" : "/analyze";
  const nextFreeFormatHref =
    contentKind === "video" ? "/text" : contentKind === "text" ? "/images" : "/videos";
  const guideHref = `/guide?format=${contentKind}`;
  const contentLabel =
    contentKind === "text" ? "texte" : contentKind === "image" ? "visuel" : "video";
  const allDrops = Array.isArray(diagnostic?.attention_drops)
    ? diagnostic.attention_drops
    : [];
  const previewDrops = getTeaserDrops(allDrops);
  const allActions = diagnostic?.corrective_actions ?? [];
  const previewActions = getTeaserActions(allActions);
  const hiddenDropsCount = Math.max(0, allDrops.length - previewDrops.length);
  const hiddenActionsCount = Math.max(0, allActions.length - previewActions.length);
  const score = diagnostic?.retention_score ?? null;
  const scoreUI = scoreAppearance(score);
  const isAudioOnly =
    report.data.status === "partial" ||
    report.partial ||
    diagnostic?.mode === "audio_only" ||
    !(diagnostic?.attention_drops?.length);
  const { entitlement, isPremiumUnlocked, isSubscriptionEntitlement } =
    resolvePremiumAccessState({
      reportRequestId: report.data.request_id,
      reportJobId,
      initialEntitlement: initialPremiumEntitlement,
    });
  const maxAssistantRepliesForReport = resolveMaxAssistantRepliesForReport(
    entitlement,
    isPremiumUnlocked
  );
  const wasRecentlyUnlocked = isPremiumUnlocked;
  const structuralCards = buildStructuralCards(report, isAudioOnly);
  const assistantPrompts = buildAssistantPrompts(
    report,
    isPremiumUnlocked,
    isAudioOnly
  );
  const summary = polishDiagnosticFrenchForDisplay(
    diagnostic?.global_summary ??
      "Attentiq a prepare un diagnostic d'attention limite pour vous aider a decider si le rapport complet vaut le deblocage."
  );
  const dropOffRuleDisplay = polishDiagnosticFrenchForDisplay(
    diagnostic?.drop_off_rule ?? ""
  );
  const teaserDropStatValue: ReactNode =
    isPremiumUnlocked || previewDrops.length > 0
      ? `${isPremiumUnlocked ? allDrops.length : previewDrops.length}`
      : "—";
  const teaserDropStatHelper =
    isPremiumUnlocked
      ? isVideoContent
        ? "timeline complete visible, avec toute la chronologie detectee"
        : "timeline detaillee visible, avec toute la progression detectee"
      : previewDrops.length === 0
        ? isVideoContent
          ? `Aucune chute listée dans cet aperçu ; le score et le résumé restent utiles. Jusqu'à ${FREE_TEASER_LIMITS.drops} chutes chronologiques après déblocage.`
          : `Aucun point de friction listé dans cet aperçu ; le score et le résumé restent utiles. Jusqu'à ${FREE_TEASER_LIMITS.drops} points détaillés après déblocage.`
        : isVideoContent
          ? `jusqu'a ${FREE_TEASER_LIMITS.drops} chutes visibles avant le deblocage`
          : `jusqu'a ${FREE_TEASER_LIMITS.drops} points de friction visibles avant le deblocage`;
  const hiddenPreviewTotal = hiddenDropsCount + hiddenActionsCount;
  const teaserHiddenStatValue: ReactNode =
    isPremiumUnlocked
      ? isAudioOnly
        ? "Audio"
        : "360°"
      : hiddenPreviewTotal > 0
        ? `${hiddenPreviewTotal}+`
        : "—";
  const teaserHiddenStatHelper =
    isPremiumUnlocked
      ? "resume structurel, perception et impact relus ensemble"
      : hiddenPreviewTotal === 0
        ? "Même sans détail masqué ici, le rapport complet ajoute timeline, niveaux d'impact par chute et plan priorisé."
        : "les parties detaillees restent reservees au rapport complet";

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.16), transparent 24%), radial-gradient(circle at 85% 12%, rgba(251, 146, 60, 0.12), transparent 16%), var(--bg-base)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.28) 65%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "980px",
          margin: "0 auto",
          padding: "22px 16px 72px",
        }}
      >
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "22px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href={analyzeHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "var(--text-secondary)",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.05)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-primary)",
              }}
            >
              ←
            </span>
            Nouvelle analyse
          </Link>

          <div
            style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}
          >
            <button
              type="button"
              onClick={handleSendPdf}
              disabled={!reportJobId || isSendingPdf}
              style={{
                minHeight: "36px",
                borderRadius: "999px",
                border: "1px solid rgba(0, 212, 255, 0.24)",
                background: !reportJobId
                  ? "rgba(107, 114, 128, 0.2)"
                  : "rgba(0, 212, 255, 0.12)",
                color: !reportJobId ? "rgba(203, 213, 225, 0.7)" : "#67e8f9",
                padding: "0 14px",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                cursor: !reportJobId || isSendingPdf ? "not-allowed" : "pointer",
              }}
            >
              {isSendingPdf ? "Envoi PDF..." : "Envoyer PDF client"}
            </button>
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                border: isPremiumUnlocked
                  ? "1px solid rgba(52, 211, 153, 0.22)"
                  : "1px solid rgba(0, 212, 255, 0.18)",
                background: isPremiumUnlocked
                  ? "rgba(52, 211, 153, 0.08)"
                  : "rgba(0, 212, 255, 0.08)",
                color: isPremiumUnlocked ? "#86efac" : "var(--accent)",
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
              }}
            >
              {isPremiumUnlocked
                ? isSubscriptionEntitlement
                  ? "Acces abonne actif"
                  : "Rapport complet debloque"
                : "Rapport gratuit · teaser"}
            </div>
          </div>
        </nav>

        {sendPdfFeedback && (
          <div
            style={{
              marginBottom: "14px",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1px solid rgba(103, 232, 249, 0.25)",
              background: "rgba(0, 212, 255, 0.09)",
              color: "#bae6fd",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          >
            {sendPdfFeedback}
          </div>
        )}

        {isPremiumUnlocked && (
          <AccessBanner
            eyebrow={wasRecentlyUnlocked ? "Paiement confirme" : "Acces premium"}
            title={
              isSubscriptionEntitlement
                ? "Paiement confirme — rapport complet debloque"
                : "Paiement confirme — rapport complet debloque"
            }
            subtitle={
              isSubscriptionEntitlement
                ? "La timeline complete, le diagnostic structurel detaille, le plan d'action priorise et l'assistant coach sont maintenant visibles sur ce rapport."
                : "Le teaser a bascule vers la version complete. Vous voyez maintenant toutes les chutes, leur importance (Critique, Fort…), leur type (verbal, rythme, visuel) et le plan d'action priorise."
            }
            border="rgba(52, 211, 153, 0.24)"
            glow="rgba(52, 211, 153, 0.12)"
            tone="linear-gradient(160deg, rgba(52, 211, 153, 0.16) 0%, rgba(11, 18, 16, 0.96) 60%, rgba(7, 11, 16, 0.98) 100%)"
          />
        )}

        {isVideoContent && isAudioOnly && (
          <div
            style={{
              marginBottom: "14px",
              padding: "14px 16px",
              borderRadius: "18px",
              border: "1px solid rgba(251, 146, 60, 0.28)",
              background: "rgba(251, 146, 60, 0.1)",
              color: "#fdba74",
              fontSize: "14px",
              lineHeight: 1.7,
            }}
          >
            Mode audio uniquement: ce rapport reste utile pour le verbal et le
            rythme, mais il sera moins precis sur les signaux visuels.{" "}
            {isPremiumUnlocked
              ? "Le complet reste debloque avec cette limite explicite."
              : "Le teaser reste volontairement limite dans ce contexte."}
          </div>
        )}

        <Panel
          accentBorder={scoreUI.border}
          accentGlow={scoreUI.glow}
          tone={`linear-gradient(160deg, ${scoreUI.glow} 0%, rgba(12, 17, 23, 0.96) 58%, rgba(6, 10, 15, 0.98) 100%)`}
          style={{ marginBottom: "14px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  fontWeight: 800,
                  color: "var(--text-secondary)",
                }}
              >
                {formatAttentionDiagnosticEyebrow(metadata?.platform)}
              </p>
              <h1
                style={{
                  margin: "12px 0 0",
                  fontSize: "clamp(2rem, 7vw, 3.7rem)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.08em",
                  color: "var(--text-primary)",
                }}
              >
                {isPremiumUnlocked
                  ? "Votre rapport complet d'attention."
                  : `Ce que votre ${contentLabel} laisse deja voir.`}
              </h1>
              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: "15px",
                  lineHeight: 1.8,
                  color: "rgba(237, 242, 247, 0.8)",
                }}
              >
                {[formatAuthor(metadata?.author), formatDuration(metadata?.duration_seconds)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {metadata?.title && (
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: "15px",
                    lineHeight: 1.7,
                    color: "rgba(237, 242, 247, 0.88)",
                  }}
                >
                  {metadata.title}
                </p>
              )}
            </div>

            <div
              style={{
                minWidth: "190px",
                padding: "18px",
                borderRadius: "24px",
                border: `1px solid ${scoreUI.border}`,
                background: "rgba(0,0,0,0.14)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  fontWeight: 800,
                  color: "var(--text-secondary)",
                }}
              >
                {isPremiumUnlocked ? "Score observe" : "Score visible"}
              </p>
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: "58px",
                  lineHeight: 0.9,
                  letterSpacing: "-0.09em",
                  fontWeight: 800,
                  color: scoreUI.color,
                }}
              >
                {score != null ? score.toFixed(1) : "—"}
              </p>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: scoreUI.color,
                }}
              >
                {scoreUI.label}
              </p>
            </div>
          </div>
        </Panel>

        <div
          style={{
            display: "grid",
            gap: "14px",
            marginBottom: "14px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <StatCard
            label={
              isPremiumUnlocked
                ? isVideoContent
                  ? "Chutes detectees"
                  : "Points detectes"
                : "Teaser gratuit"
            }
            value={teaserDropStatValue}
            helper={teaserDropStatHelper}
          />
          <StatCard
            label={isPremiumUnlocked ? "Actions priorisees" : "Actions visibles"}
            value={`${isPremiumUnlocked ? allActions.length : previewActions.length}`}
            helper={
              isPremiumUnlocked
                ? "plan d'action complet avec priorite d'execution"
                : `jusqu'a ${FREE_TEASER_LIMITS.actions} actions visibles dans le gratuit`
            }
          />
          <StatCard
            label={isPremiumUnlocked ? "Lecture structurelle" : "Sections masquees"}
            value={teaserHiddenStatValue}
            helper={teaserHiddenStatHelper}
          />
        </div>

        <Panel style={{ marginBottom: "14px" }}>
          <SectionHeader
            eyebrow={isPremiumUnlocked ? "Diagnostic complet" : "Resume gratuit"}
            title={isPremiumUnlocked ? "Lecture complete" : "Lecture immediate"}
          />
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              lineHeight: 1.85,
              color: "rgba(237, 242, 247, 0.9)",
            }}
          >
            {summary}
          </p>
          {dropOffRuleDisplay.trim() && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                borderRadius: "20px",
                border: "1px solid rgba(251, 146, 60, 0.18)",
                background: "rgba(251, 146, 60, 0.08)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontWeight: 800,
                  color: "#fdba74",
                }}
              >
                Regle percue
              </p>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "14px",
                  lineHeight: 1.75,
                  color: "rgba(237, 242, 247, 0.86)",
                }}
              >
                {dropOffRuleDisplay}
              </p>
            </div>
          )}
        </Panel>

        {isPremiumUnlocked ? (
          <>
            <Panel style={{ marginBottom: "14px" }}>
              <SectionHeader
                eyebrow={isVideoContent ? "Timeline complete" : "Timeline detaillee"}
                title={
                  isVideoContent
                    ? "Toutes les chutes et leur nature"
                    : "Tous les points de friction et leur nature"
                }
              />

              {allDrops.length > 0 ? (
                <div style={{ display: "grid", gap: "12px" }}>
                  {allDrops.map((drop, index) => {
                    const severity = SEVERITY_CONFIG[drop.severity];
                    const categories = deriveCategories(drop.cause, isAudioOnly);

                    return (
                      <div
                        key={`${drop.timestamp_seconds}-${index}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "84px minmax(0, 1fr)",
                          gap: "14px",
                          padding: "18px",
                          borderRadius: "22px",
                          border: `1px solid ${severity.border}`,
                          background: `linear-gradient(180deg, ${severity.tone} 0%, rgba(255,255,255,0.02) 100%)`,
                        }}
                      >
                        <div
                          style={{
                            minHeight: "68px",
                            borderRadius: "18px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            border: `1px solid ${severity.border}`,
                            background: "rgba(3, 8, 14, 0.42)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "20px",
                              fontWeight: 900,
                              color: severity.text,
                            }}
                          >
                            {formatTimestamp(drop.timestamp_seconds)}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              textTransform: "uppercase",
                              letterSpacing: "0.16em",
                              color: "rgba(237, 242, 247, 0.56)",
                            }}
                          >
                            Chute {index + 1}
                          </span>
                        </div>

                        <div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "8px",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "5px 10px",
                                borderRadius: "999px",
                                border: `1px solid ${severity.border}`,
                                background: "rgba(255,255,255,0.04)",
                                color: severity.text,
                                fontSize: "10px",
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.14em",
                              }}
                            >
                              Impact {severity.label}
                            </span>

                            {categories.map((category) => {
                              const categoryUi = CATEGORY_CONFIG[category];
                              return (
                                <span
                                  key={`${drop.timestamp_seconds}-${category}`}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "5px 10px",
                                    borderRadius: "999px",
                                    border: `1px solid ${categoryUi.border}`,
                                    background: categoryUi.tone,
                                    color: categoryUi.text,
                                    fontSize: "10px",
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.14em",
                                  }}
                                >
                                  {categoryUi.label}
                                </span>
                              );
                            })}
                          </div>

                          <p
                            style={{
                              margin: "12px 0 0",
                              fontSize: "14px",
                              lineHeight: 1.8,
                              color: "rgba(237, 242, 247, 0.88)",
                            }}
                          >
                            {drop.cause}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    lineHeight: 1.75,
                    color: "var(--text-secondary)",
                  }}
                >
                  Aucune chute supplementaire n&apos;a ete structuree dans ce
                  rapport, mais le diagnostic detaille reste disponible
                  ci-dessous.
                </p>
              )}
            </Panel>

            <Panel style={{ marginBottom: "14px" }}>
              <SectionHeader
                eyebrow="Diagnostic structurel"
                title="Pourquoi la retention casse vraiment"
              />
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                {structuralCards.map((item) => (
                  <div
                    key={item.eyebrow}
                    style={{
                      borderRadius: "20px",
                      border: "1px solid var(--border)",
                      background: "rgba(255,255,255,0.03)",
                      padding: "18px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                        fontWeight: 800,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {item.eyebrow}
                    </p>
                    <p
                      style={{
                        margin: "12px 0 0",
                        fontSize: "14px",
                        lineHeight: 1.75,
                        color: "rgba(237, 242, 247, 0.86)",
                      }}
                    >
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>

            <InlineChatbot
              diagnosticContext={buildChatDiagnosticContext(report)}
              variant="floating"
              defaultOpen
              title="Coach Attentiq"
              subtitle="Posez vos questions sur ce rapport"
              suggestedPrompts={assistantPrompts}
              footerNote="Coach centre sur ce rapport complet et son plan d'action."
              maxAssistantReplies={maxAssistantRepliesForReport}
              paywallHref={analyzeHref}
            />

            <Panel style={{ marginBottom: "14px" }}>
              <SectionHeader
                eyebrow="Plan d'action priorise"
                title="Quoi corriger d'abord, ensuite, puis tester"
              />

              {allActions.length > 0 ? (
                <div style={{ display: "grid", gap: "10px" }}>
                  {allActions.map((action, index) => {
                    const categories = deriveCategories(action, isAudioOnly);
                    return (
                      <div
                        key={`${index}-${action}`}
                        style={{
                          padding: "16px",
                          borderRadius: "20px",
                          border: index === 0
                            ? "1px solid rgba(0, 212, 255, 0.24)"
                            : "1px solid var(--border)",
                          background: index === 0
                            ? "linear-gradient(180deg, rgba(0, 212, 255, 0.08) 0%, rgba(255,255,255,0.03) 100%)"
                            : "rgba(255,255,255,0.03)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "5px 10px",
                              borderRadius: "999px",
                              border: index === 0
                                ? "1px solid rgba(0, 212, 255, 0.22)"
                                : "1px solid rgba(255,255,255,0.08)",
                              background: index === 0
                                ? "rgba(0, 212, 255, 0.1)"
                                : "rgba(255,255,255,0.04)",
                              color: index === 0 ? "var(--accent)" : "var(--text-primary)",
                              fontSize: "10px",
                              fontWeight: 900,
                              textTransform: "uppercase",
                              letterSpacing: "0.14em",
                            }}
                          >
                            {buildActionPriorityLabel(index)}
                          </span>

                          {categories.map((category) => {
                            const categoryUi = CATEGORY_CONFIG[category];
                            return (
                              <span
                                key={`${action}-${category}`}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "5px 10px",
                                  borderRadius: "999px",
                                  border: `1px solid ${categoryUi.border}`,
                                  background: categoryUi.tone,
                                  color: categoryUi.text,
                                  fontSize: "10px",
                                  fontWeight: 900,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.14em",
                                }}
                              >
                                {categoryUi.label}
                              </span>
                            );
                          })}
                        </div>

                        <p
                          style={{
                            margin: "12px 0 0",
                            fontSize: "14px",
                            lineHeight: 1.8,
                            color: "rgba(237, 242, 247, 0.9)",
                          }}
                        >
                          {action}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    lineHeight: 1.75,
                    color: "var(--text-secondary)",
                  }}
                >
                  Aucun plan d&apos;action supplementaire n&apos;a ete remonte dans ce
                  diagnostic complet.
                </p>
              )}
            </Panel>
          </>
        ) : (
          <>
            <Panel style={{ marginBottom: "14px" }}>
              <SectionHeader
                eyebrow={isVideoContent ? "Preview chutes" : "Preview frictions"}
                title="Ce que le gratuit montre deja"
              />

              {allDrops.length > FREE_TEASER_LIMITS.drops && (
                <div
                  style={{
                    marginBottom: "14px",
                    padding: "12px 14px",
                    borderRadius: "16px",
                    border: "1px solid rgba(0, 212, 255, 0.22)",
                    background: "rgba(0, 212, 255, 0.07)",
                    color: "rgba(237, 242, 247, 0.88)",
                    fontSize: "13px",
                    lineHeight: 1.65,
                  }}
                >
                  Aperçu gratuit : vous voyez les{" "}
                  <strong>{FREE_TEASER_LIMITS.drops}</strong> premières chutes avec
                  cause et niveau d&apos;impact. Le rapport complet ajoute les{" "}
                  <strong>{allDrops.length - FREE_TEASER_LIMITS.drops}+</strong>{" "}
                  suivantes, la timeline entière, les liens entre chutes, le détail
                  par axe (verbal / rythme / visuel quand le signal existe) et un plan
                  d&apos;action priorisé étendu.
                </div>
              )}

              {previewDrops.length > 0 ? (
                <div style={{ display: "grid", gap: "12px" }}>
                  {previewDrops.map((drop, index) => {
                    const severity = SEVERITY_CONFIG[drop.severity];

                    return (
                      <div
                        key={`${drop.timestamp_seconds}-${index}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "72px minmax(0, 1fr)",
                          gap: "14px",
                          padding: "16px",
                          borderRadius: "20px",
                          border: `1px solid ${severity.border}`,
                          background: `linear-gradient(180deg, ${severity.tone} 0%, rgba(255,255,255,0.02) 100%)`,
                        }}
                      >
                        <div
                          style={{
                            minHeight: "60px",
                            borderRadius: "16px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            border: `1px solid ${severity.border}`,
                            background: "rgba(3, 8, 14, 0.38)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "18px",
                              fontWeight: 800,
                              color: severity.text,
                            }}
                          >
                            {formatTimestamp(drop.timestamp_seconds)}
                          </span>
                        </div>

                        <div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "5px 10px",
                              borderRadius: "999px",
                              border: `1px solid ${severity.border}`,
                              background: "rgba(255,255,255,0.04)",
                              color: severity.text,
                              fontSize: "10px",
                              fontWeight: 900,
                              textTransform: "uppercase",
                              letterSpacing: "0.14em",
                            }}
                          >
                            {severity.label}
                          </span>
                          <p
                            style={{
                              margin: "10px 0 0",
                              fontSize: "14px",
                              lineHeight: 1.75,
                              color: "rgba(237, 242, 247, 0.88)",
                            }}
                          >
                            {drop.cause}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    lineHeight: 1.75,
                    color: "var(--text-secondary)",
                  }}
                >
                  {isVideoContent
                    ? "Dans cet aperçu gratuit, aucune chute n'est affichée avec une chronologie (souvent le cas en mode audio ou si le modèle ne segmente pas encore finement). Le résumé ci-dessus et les actions listées restent le cœur du diagnostic."
                    : "Dans cet aperçu gratuit, aucun point de friction détaillé n'est affiché sur une progression complète. Le résumé ci-dessus et les actions listées restent le cœur du diagnostic."}
                </p>
              )}

              <div
                style={{
                  marginTop: "16px",
                  padding: "14px 16px",
                  borderRadius: "18px",
                  border: "1px solid rgba(0, 212, 255, 0.16)",
                  background: "rgba(0, 212, 255, 0.08)",
                  color: "rgba(237, 242, 247, 0.84)",
                  fontSize: "13px",
                  lineHeight: 1.7,
                }}
              >
                {hiddenDropsCount > 0
                  ? isVideoContent
                    ? `${hiddenDropsCount} chute(s) supplementaire(s) restent masquees dans le rapport gratuit.`
                    : `${hiddenDropsCount} point(s) supplementaire(s) restent masques dans le rapport gratuit.`
                  : "Le rapport complet ajoute surtout plus de contexte et une priorisation plus fine."}
              </div>
            </Panel>

            <Panel style={{ marginBottom: "14px" }}>
              <SectionHeader
                eyebrow="Preview actions"
                title="Les premieres corrections visibles"
              />

              {previewActions.length > 0 ? (
                <div style={{ display: "grid", gap: "10px" }}>
                  {previewActions.map((action, index) => (
                    <div
                      key={`${index}-${action}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "34px minmax(0, 1fr)",
                        gap: "12px",
                        alignItems: "start",
                        padding: "14px 16px",
                        borderRadius: "18px",
                        border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <span
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid rgba(0, 212, 255, 0.2)",
                          background: "rgba(0, 212, 255, 0.1)",
                          color: "var(--accent)",
                          fontSize: "12px",
                          fontWeight: 900,
                        }}
                      >
                        {index + 1}
                      </span>
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: "14px",
                          lineHeight: 1.75,
                          color: "rgba(237, 242, 247, 0.88)",
                        }}
                      >
                        {action}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    lineHeight: 1.75,
                    color: "var(--text-secondary)",
                  }}
                >
                  Aucune action simple n&apos;a ete remontee dans le teaser gratuit.
                </p>
              )}

              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: "13px",
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                }}
              >
                {hiddenActionsCount > 0
                  ? `${hiddenActionsCount} action(s) supplementaire(s) restent reservees au rapport complet.`
                  : "Le rapport complet sert surtout a passer de l'aperçu a la priorisation detaillee."}
              </p>
            </Panel>

            <InlineChatbot
              diagnosticContext={buildChatDiagnosticContext(report)}
              variant="floating"
              defaultOpen
              title="Assistant Attentiq"
              subtitle="Une question sur ce diagnostic ?"
              suggestedPrompts={assistantPrompts}
              footerNote="Assistant limite a ce teaser et a votre diagnostic actuel."
              maxAssistantReplies={1}
              paywallHref={
                contentKind === "video"
                  ? "/videos#tarifs"
                  : contentKind === "text"
                    ? "/text#tarifs"
                    : "/images#tarifs"
              }
            />

            <Panel
              accentBorder="rgba(0, 212, 255, 0.18)"
              accentGlow="rgba(0, 212, 255, 0.1)"
              tone="linear-gradient(180deg, rgba(0, 212, 255, 0.08) 0%, rgba(9, 13, 18, 0.96) 100%)"
              style={{ marginBottom: "14px" }}
            >
              <SectionHeader
                eyebrow="Ce qui reste verrouille"
                title="Le rapport complet va beaucoup plus loin"
              />

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                <LockedPreviewCard
                  title={isVideoContent ? "Timeline complete" : "Timeline detaillee"}
                  helper={
                    isVideoContent
                      ? "Toutes les chutes sont visibles avec leur niveau d'impact et leur categorie verbale, rythme ou visuelle."
                      : "Tous les points de friction sont visibles avec leur niveau d'impact et leur categorie principale."
                  }
                />
                <LockedPreviewCard
                  title="Diagnostic structurel detaille"
                  helper="Le complet reconnecte les chutes entre elles et explique la logique de rupture."
                />
                <LockedPreviewCard
                  title="Plan d'actions priorise"
                  helper="Vous voyez quoi corriger d'abord, quoi couper ensuite, et ce qui peut attendre."
                />
              </div>
            </Panel>

            <StripeCta
              jobId={reportJobId}
              videoUrl={report.data.metadata?.url ?? null}
            />
          </>
        )}

        <Panel
          accentBorder="rgba(255,255,255,0.08)"
          tone="linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(8, 12, 18, 0.96) 100%)"
        >
          <SectionHeader
            eyebrow="Suite"
            title={isPremiumUnlocked ? "Executer ou comparer" : "Repartir ou debloquer"}
          />
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              lineHeight: 1.8,
              color: "rgba(237, 242, 247, 0.82)",
            }}
          >
            {isPremiumUnlocked
              ? `Le rapport complet sert maintenant a executer. Corrigez d'abord la priorite numero un, puis relancez un autre ${contentLabel} pour comparer une nouvelle version.`
              : "Le gratuit sert a qualifier rapidement la valeur du diagnostic. Soit vous debloquez le rapport complet, soit vous essayez un autre format gratuit (video, texte ou image)."}
          </p>

          <div
            style={{
              marginTop: "18px",
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <Link
              href={nextFreeFormatHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "48px",
                padding: "0 18px",
                borderRadius: "999px",
                textDecoration: "none",
                background: "linear-gradient(135deg, var(--accent), #79e7ff)",
                color: "#041017",
                fontSize: "14px",
                fontWeight: 900,
              }}
            >
              Essayer un autre format gratuit
            </Link>
            <Link
              href={guideHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "48px",
                padding: "0 18px",
                borderRadius: "999px",
                textDecoration: "none",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontWeight: 800,
              }}
            >
              Comprendre le diagnostic
            </Link>
          </div>
        </Panel>
      </div>
    </main>
  );
}
