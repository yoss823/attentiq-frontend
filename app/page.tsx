import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Attentiq — Diagnostic d'attention pour vos vidéos, photos et textes",
  description:
    "Attentiq analyse vos vidéos, photos ou textes seconde par seconde et identifie exactement où vous perdez l'attention — et pourquoi.",
  openGraph: {
    title: "Attentiq — Diagnostic d'attention pour vos vidéos, photos et textes",
    description:
      "Attentiq analyse vos vidéos, photos ou textes seconde par seconde et identifie exactement où vous perdez l'attention — et pourquoi.",
    siteName: "Attentiq",
  },
};

const features = [
  {
    number: "01",
    icon: "🔗",
    title: "Soumettez votre contenu",
    description:
      "Vidéo TikTok, Instagram ou YouTube, image JPG/PNG, ou texte copié-collé. N'importe quel format public.",
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
      "Score de rétention, points de chute précis, causes identifiées, actions concrètes pour vos prochaines créations.",
  },
];

const signals = [
  "Score de rétention global (1 à 10)",
  "Secondes exactes où l'attention chute",
  "Cause de chaque chute (visuelle ou verbale)",
  "Règle de décrochage principale de votre contenu",
  "3 à 5 actions concrètes pour vos prochaines créations",
];

const formats = [
  { icon: "🎬", label: "Vidéo", detail: "TikTok, Instagram, YouTube, upload" },
  { icon: "🖼️", label: "Photo", detail: "JPG, PNG, WebP" },
  { icon: "📝", label: "Texte", detail: "Copier-coller votre contenu" },
];

export default function HomePage() {
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
              className="rounded-full px-4 py-2 text-sm font-semibold transition hover:opacity-90"
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
        <section className="pb-16 pt-16 sm:pt-28">
          <div className="rise" style={{ animationDelay: "0.05s" }}>
            <p
              className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent)",
                border: "1px solid var(--border-accent)",
              }}
            >
              Diagnostic IA · Vidéo · Photo · Texte
            </p>
            <h1
              className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl"
              style={{ color: "var(--text-primary)", lineHeight: 1.05 }}
            >
              Vous perdez l&apos;attention.{" "}
              <span style={{ color: "var(--accent)" }}>
                Attentiq vous dit où.
              </span>
            </h1>
            <p
              className="mt-6 max-w-2xl text-lg leading-8"
              style={{ color: "var(--text-secondary)" }}
            >
              Attentiq analyse vos vidéos, photos ou textes seconde par seconde
              et identifie exactement où vous perdez l&apos;attention — et
              pourquoi. Diagnostic en 60 à 90 secondes.
            </p>
          </div>

          <div
            className="rise mt-10 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "0.15s" }}
          >
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold transition hover:opacity-90"
              style={{ background: "var(--accent)", color: "#060a0f" }}
            >
              Analyser une vidéo/photo/texte par exemple →
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-medium transition"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Comment ça marche
            </Link>
          </div>

          {/* Format badges */}
          <div
            className="rise mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "0.22s" }}
          >
            {formats.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <span>{f.icon}</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {f.label}
                </span>
                <span className="text-xs">{f.detail}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="pb-20">
          <div className="rise mb-8" style={{ animationDelay: "0.1s" }}>
            <p
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--accent)" }}
            >
              Comment ça marche
            </p>
            <h2
              className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
              style={{ color: "var(--text-primary)" }}
            >
              3 étapes. 90 secondes.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature, i) => (
              <article
                key={feature.number}
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
                    {feature.number}
                  </span>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3
                  className="mb-3 text-base font-semibold leading-snug tracking-[-0.02em]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-7"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* What you get */}
        <section className="pb-20">
          <div
            className="rise rounded-2xl p-6 sm:p-8"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <h2
              className="mb-6 text-xl font-semibold tracking-[-0.03em]"
              style={{ color: "var(--text-primary)" }}
            >
              Ce que vous obtenez
            </h2>
            <ul className="space-y-3">
              {signals.map((item) => (
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
        </section>

        {/* Final CTA */}
        <section>
          <div
            className="rise rounded-2xl px-6 py-10 text-center sm:py-14"
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
              className="mb-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
              style={{ color: "var(--text-primary)" }}
            >
              Votre prochain contenu mérite un vrai diagnostic.
            </h2>
            <p
              className="mb-8 text-sm leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              Vos données ne sont pas stockées. Le contenu est analysé puis
              supprimé.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold transition hover:opacity-90"
              style={{ background: "var(--accent)", color: "#060a0f" }}
            >
              Analyser une vidéo/photo/texte par exemple →
            </Link>
          </div>
        </section>

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
