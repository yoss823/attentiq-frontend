import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ce qu'Attentiq fait — et ce qu'il ne fait pas | Attentiq",
  description:
    "Transparence sur les capacités et limites d'Attentiq. Ce que l'outil fait bien, ce qu'il ne peut pas garantir, et comment vos données sont traitées.",
};

const strengths = [
  "Identifier des signaux structurels dans la vidéo (rythme, accroche, ruptures narratives)",
  "Donner des timestamps précis sur les zones à risque de décrochage",
  "Traduire ces signaux en langage actionnable pour vos prochaines vidéos",
  "Fonctionner sans accès à votre compte (pas besoin de connexion TikTok)",
];

const limits = [
  "Il n'analyse pas l'algorithme TikTok ni les tendances du moment",
  "Il ne peut pas prédire les vues, la viralité ou la croissance",
  "Il n'a pas accès aux données réelles de rétention de votre compte",
  "Les recommandations sont des pistes diagnostiques — pas des certitudes",
];

const edgeCases = [
  {
    title: "Vidéos très courtes (< 10 s)",
    detail: "Peu de signal à analyser. Le diagnostic devient moins stable.",
  },
  {
    title: "Audio indisponible",
    detail:
      "L'analyse reste possible, mais elle est partielle — la transcription manque.",
  },
  {
    title: "Comptes privés ou vidéos supprimées",
    detail: "Inaccessibles. L'outil ne peut pas analyser ce qu'il ne peut pas télécharger.",
  },
];

const privacyPoints = [
  "La vidéo est téléchargée temporairement pour l'analyse puis supprimée",
  "Aucun stockage des URLs ou rapports après traitement",
  "Aucune donnée vendue ou partagée avec des tiers",
];

function SectionBlock({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl p-6 sm:p-8"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="mb-6 flex items-center gap-4">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold"
          style={{
            background: "var(--accent-dim)",
            color: "var(--accent)",
            border: "1px solid var(--border-accent)",
          }}
        >
          {index}
        </span>
        <h2
          className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
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
            className="text-sm leading-7"
            style={{ color: "var(--text-secondary)" }}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CrossList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
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
            className="text-sm leading-7"
            style={{ color: "var(--text-secondary)" }}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function TransparencePage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Subtle grid */}
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

      <div className="relative mx-auto max-w-4xl px-5 pb-24 pt-6 sm:px-8">
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
              className="hidden rounded-full px-4 py-2 text-sm font-medium transition sm:block"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Comment ça marche
            </Link>
            <Link
              href="/transparence"
              className="hidden rounded-full px-4 py-2 text-sm font-medium sm:block"
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent)",
                border: "1px solid var(--border-accent)",
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
        <section className="pb-14 pt-16 sm:pt-24">
          <div className="rise" style={{ animationDelay: "0.05s" }}>
            <p
              className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent)",
                border: "1px solid var(--border-accent)",
              }}
            >
              Transparence
            </p>
            <h1
              className="max-w-3xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl lg:text-5xl"
              style={{ color: "var(--text-primary)", lineHeight: 1.1 }}
            >
              Ce qu&apos;Attentiq fait — et ce qu&apos;il ne fait pas
            </h1>
            <p
              className="mt-6 max-w-2xl text-base leading-8 sm:text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              Nous préférons être clairs sur les limites de cet outil plutôt
              que de vous promettre des résultats que nous ne pouvons pas
              garantir.
            </p>
          </div>
        </section>

        {/* Content blocks */}
        <div className="space-y-5">
          <SectionBlock index="01" title="Ce que l'outil fait bien">
            <p
              className="mb-5 text-sm leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              Attentiq est utile quand vous cherchez à comprendre comment une
              vidéo perd l&apos;attention sur le plan structurel. Il lit la
              vidéo comme un assemblage de signaux — pas comme une promesse de
              résultats.
            </p>
            <CheckList items={strengths} />
          </SectionBlock>

          <SectionBlock index="02" title="Ce que l'outil ne peut pas garantir">
            <p
              className="mb-5 text-sm leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              Cet outil n&apos;est pas branché sur une vérité cachée de TikTok.
              Il donne une lecture sérieuse, mais bornée.
            </p>
            <CrossList items={limits} />
          </SectionBlock>

          <SectionBlock
            index="03"
            title="Cas où le diagnostic est moins pertinent"
          >
            <p
              className="mb-5 text-sm leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              Il existe des contextes où la lecture reste possible mais perd en
              finesse. Mieux vaut le savoir à l&apos;avance.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {edgeCases.map((ec) => (
                <div
                  key={ec.title}
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    className="mb-2 text-sm font-semibold leading-5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {ec.title}
                  </p>
                  <p
                    className="text-sm leading-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {ec.detail}
                  </p>
                </div>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock index="04" title="Confidentialité des données">
            <p
              className="mb-5 text-sm leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              La confiance ne repose pas seulement sur le ton. Elle repose sur
              ce que nous faisons — et ne faisons pas — avec vos données.
            </p>
            <CheckList items={privacyPoints} />
          </SectionBlock>

          {/* CTA */}
          <div
            className="rounded-2xl px-6 py-10 text-center sm:py-12"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-accent)",
            }}
          >
            <p
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--accent)" }}
            >
              Prêt ?
            </p>
            <h2
              className="mb-3 text-xl font-semibold tracking-[-0.03em] sm:text-2xl"
              style={{ color: "var(--text-primary)" }}
            >
              Si le diagnostic vous aide, il doit aussi pouvoir dire ce
              qu&apos;il ne sait pas faire.
            </h2>
            <p
              className="mb-7 text-sm leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              Vous savez maintenant exactement ce que vous obtenez — et ce que
              vous n&apos;obtenez pas.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold transition hover:opacity-90"
              style={{ background: "var(--accent)", color: "#060a0f" }}
            >
              Analyser une vidéo
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="border-t py-8 mt-10"
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
