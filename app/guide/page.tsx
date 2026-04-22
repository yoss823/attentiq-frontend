import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Comment fonctionne Attentiq ?",
  description:
    "3 étapes. 90 secondes. Un diagnostic de rétention vidéo que vous ne trouverez nulle part ailleurs.",
};

const steps = [
  {
    number: "01",
    icon: "🔗",
    title: "Vous collez une URL TikTok",
    description:
      "N'importe quelle vidéo publique, la vôtre ou celle d'un concurrent.",
  },
  {
    number: "02",
    icon: "🔍",
    title: "L'IA analyse chaque seconde",
    description:
      "Transcription audio, analyse visuelle frame par frame, détection des moments de décrochage. Temps d'analyse : 60 à 90 secondes.",
  },
  {
    number: "03",
    icon: "📊",
    title: "Vous recevez un diagnostic actionnable",
    description:
      "Score de rétention, points de chute précis (en secondes), causes identifiées, actions pour vos prochaines vidéos.",
  },
];

const reportContains = [
  "Le score de rétention global (1 à 10)",
  "Les secondes exactes où l'attention chute",
  "La cause de chaque chute (visuelle ou verbale)",
  "La règle de décrochage principale de votre contenu",
  "La perception que les spectateurs ont de vous",
  "3 à 5 actions concrètes pour vos prochaines vidéos",
];

const reportDoesNotContain = [
  "Ce n'est pas une prédiction de vues",
  "Ce n'est pas une promesse de viralité",
  "Ce n'est pas un outil algorithmique",
];

const exampleDrops = [
  {
    time: "0:04",
    severity: "medium",
    severityLabel: "Medium",
    cause:
      "L'ouverture démarre sur un plan trop statique. Aucune promesse verbale dans les 2 premières secondes.",
  },
  {
    time: "0:17",
    severity: "high",
    severityLabel: "High",
    cause:
      "Répétition verbale : l'information sur le temps de cuisson est annoncée deux fois en 4 secondes. L'audience perd le fil.",
  },
  {
    time: "0:31",
    severity: "medium",
    severityLabel: "Medium",
    cause:
      "Transition vers le dressage trop longue — 6 secondes sans action ni parole.",
  },
];

const exampleActions = [
  "Commencer par la promesse (\"Je vais vous montrer la vraie carbonara en 60 secondes\")",
  "Supprimer la répétition à 0:17",
  "Accélérer ou couper la transition à 0:31",
];

function SeverityBadge({ level }: { level: string }) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    high: {
      bg: "rgba(239,68,68,0.12)",
      text: "#f87171",
      border: "rgba(239,68,68,0.25)",
    },
    medium: {
      bg: "rgba(251,146,60,0.12)",
      text: "#fb923c",
      border: "rgba(251,146,60,0.25)",
    },
    low: {
      bg: "rgba(250,204,21,0.1)",
      text: "#fbbf24",
      border: "rgba(250,204,21,0.2)",
    },
  };
  const s = styles[level] || styles.low;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {level}
    </span>
  );
}

export default function GuidePage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Subtle grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 pb-24 pt-6 sm:px-8">
        {/* Nav */}
        <nav className="rise flex items-center justify-between py-2">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold tracking-widest"
              style={{
                background: "var(--accent-dim)",
                border: "1px solid var(--border-accent)",
                color: "var(--accent)",
              }}
            >
              AT
            </div>
            <span
              className="text-base font-semibold tracking-[-0.02em]"
              style={{ color: "var(--text-primary)" }}
            >
              Attentiq
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/guide"
              className="hidden rounded-full px-4 py-2 text-sm font-medium sm:block"
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent)",
                border: "1px solid var(--border-accent)",
              }}
            >
              Comment ça marche
            </Link>
            <Link
              href="/transparence"
              className="hidden rounded-full px-4 py-2 text-sm font-medium transition sm:block"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Transparence
            </Link>
            <Link
              href="/analyze"
              className="rounded-full px-4 py-2 text-sm font-semibold transition"
              style={{
                background: "var(--accent)",
                color: "#060a0f",
              }}
            >
              Analyser
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="pb-16 pt-16 sm:pt-24">
          <div className="rise" style={{ animationDelay: "0.05s" }}>
            <p
              className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent)",
                border: "1px solid var(--border-accent)",
              }}
            >
              Guide
            </p>
            <h1
              className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl"
              style={{ color: "var(--text-primary)", lineHeight: 1.05 }}
            >
              Comment fonctionne Attentiq ?
            </h1>
            <p
              className="mt-6 max-w-2xl text-lg leading-8"
              style={{ color: "var(--text-secondary)" }}
            >
              3 étapes. 90 secondes. Un diagnostic que vous ne trouverez nulle
              part ailleurs.
            </p>
          </div>
        </section>

        {/* 3 Steps */}
        <section className="pb-20">
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, i) => (
              <article
                key={step.number}
                className="rise relative rounded-2xl p-6"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  animationDelay: `${0.1 + i * 0.1}s`,
                }}
              >
                <div className="mb-5 flex items-start justify-between">
                  <span
                    className="font-mono text-xs font-semibold tracking-[0.2em]"
                    style={{ color: "var(--accent)" }}
                  >
                    {step.number}
                  </span>
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <h3
                  className="mb-3 text-base font-semibold leading-snug tracking-[-0.02em]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-7"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Ce que le rapport contient / ne contient pas */}
        <section className="pb-20">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Contains */}
            <div
              className="rise rounded-2xl p-6 sm:p-8"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                animationDelay: "0.15s",
              }}
            >
              <h2
                className="mb-6 text-xl font-semibold tracking-[-0.03em]"
                style={{ color: "var(--text-primary)" }}
              >
                Ce que le rapport contient
              </h2>
              <ul className="space-y-3">
                {reportContains.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs"
                      style={{
                        background: "var(--accent-dim)",
                        color: "var(--accent)",
                      }}
                    >
                      ✓
                    </span>
                    <span
                      className="text-sm leading-6"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Does not contain */}
            <div
              className="rise rounded-2xl p-6 sm:p-8"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                animationDelay: "0.2s",
              }}
            >
              <h2
                className="mb-6 text-xl font-semibold tracking-[-0.03em]"
                style={{ color: "var(--text-primary)" }}
              >
                Ce que le rapport ne contient{" "}
                <span style={{ color: "#f87171" }}>pas</span>
              </h2>
              <p
                className="mb-5 text-sm leading-7"
                style={{ color: "var(--text-secondary)" }}
              >
                La transparence, c&apos;est aussi savoir ce qu&apos;on ne promet
                pas.
              </p>
              <ul className="space-y-3">
                {reportDoesNotContain.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        background: "rgba(239,68,68,0.12)",
                        color: "#f87171",
                        border: "1px solid rgba(239,68,68,0.2)",
                      }}
                    >
                      ×
                    </span>
                    <span
                      className="text-sm leading-6"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Example report mockup */}
        <section className="pb-20">
          <div className="rise mb-6" style={{ animationDelay: "0.1s" }}>
            <p
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--accent)" }}
            >
              Exemple de rapport
            </p>
            <h2
              className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
              style={{ color: "var(--text-primary)" }}
            >
              À quoi ressemble un diagnostic réel ?
            </h2>
            <p
              className="mt-3 max-w-2xl text-base leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              Ci-dessous, un exemple fictif mais représentatif. Chiffres
              concrets, timestamps réels, causes précises.
            </p>
          </div>

          <div
            className="rise rounded-2xl overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              animationDelay: "0.2s",
            }}
          >
            {/* Report header */}
            <div
              className="flex flex-wrap items-start justify-between gap-4 border-b p-5 sm:p-6"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <p
                  className="font-mono text-[11px] font-medium uppercase tracking-[0.18em]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Diagnostic Attentiq — exemple fictif
                </p>
                <p
                  className="mt-2 text-base font-semibold tracking-[-0.02em]"
                  style={{ color: "var(--text-primary)" }}
                >
                  Pasta carbonara en 3 étapes —{" "}
                  <span style={{ color: "var(--accent)" }}>@chefmaxime</span>
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Score global
                </p>
                <p
                  className="mt-1 font-mono text-3xl font-bold"
                  style={{ color: "var(--accent)" }}
                >
                  6
                  <span
                    className="text-base font-normal"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    /10
                  </span>
                </p>
              </div>
            </div>

            {/* Drops */}
            <div className="p-5 sm:p-6">
              <p
                className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--text-secondary)" }}
              >
                Chutes d&apos;attention détectées
              </p>
              <div className="space-y-3">
                {exampleDrops.map((drop) => (
                  <div
                    key={drop.time}
                    className="rounded-xl p-4"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span
                        className="font-mono text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {drop.time}
                      </span>
                      <SeverityBadge level={drop.severity} />
                    </div>
                    <p
                      className="text-sm leading-6"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {drop.cause}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div
                className="mt-5 grid gap-3 rounded-xl p-4 sm:grid-cols-2"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <p
                    className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Règle de décrochage
                  </p>
                  <p
                    className="text-sm font-medium leading-6"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Promesse retardée + répétitions mid-vidéo
                  </p>
                </div>
                <div>
                  <p
                    className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Perception spectateur
                  </p>
                  <p
                    className="text-sm font-medium leading-6"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Créateur compétent mais vidéo qui manque de rythme
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4">
                <p
                  className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Actions pour la prochaine vidéo
                </p>
                <ol className="space-y-2.5">
                  {exampleActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
                        style={{
                          background: "var(--accent-dim)",
                          color: "var(--accent)",
                          border: "1px solid var(--border-accent)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <p
                        className="text-sm leading-6"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {action}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-10">
          <div
            className="rise rounded-2xl px-6 py-12 text-center sm:py-16"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-accent)",
            }}
          >
            <h2
              className="mb-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
              style={{ color: "var(--text-primary)" }}
            >
              Prêt à voir ce que cache votre vidéo ?
            </h2>
            <p
              className="mb-8 text-base leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              Collez une URL. L&apos;analyse prend 90 secondes.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold transition hover:opacity-90"
              style={{ background: "var(--accent)", color: "#060a0f" }}
            >
              Analyser ma vidéo gratuitement
            </Link>
            <p
              className="mt-4 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Aucune création de compte requise.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="border-t py-8"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Attentiq — Diagnostic IA de rétention vidéo
            </p>
            <nav className="flex flex-wrap gap-4">
              {[
                { href: "/guide", label: "Comment ça marche" },
                { href: "/transparence", label: "Transparence" },
                { href: "/analyze", label: "Analyser" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
