import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Attentiq — Diagnostic IA de rétention',
  description:
    'Diagnostic structurel de la rétention sur les formats courts. Comprenez pourquoi votre contenu perd l\'attention et comment le fixer.',
};

export default function HomePage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* Subtle grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage:
            'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0) 100%)',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 pb-24 pt-6 sm:px-8">
        {/* Nav */}
        <nav className="rise flex items-center justify-between py-2">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold tracking-widest"
              style={{
                background: 'var(--accent-dim)',
                border: '1px solid var(--border-accent)',
                color: 'var(--accent)',
              }}
            >
              AT
            </div>
            <span
              className="text-base font-semibold tracking-[-0.02em]"
              style={{ color: 'var(--text-primary)' }}
            >
              Attentiq
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/guide"
              className="hidden rounded-full px-4 py-2 text-sm font-medium transition sm:block"
              style={{
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              Comment ça marche
            </Link>
            <Link
              href="/transparence"
              className="hidden rounded-full px-4 py-2 text-sm font-medium transition sm:block"
              style={{
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              Transparence
            </Link>
            <Link
              href="/analyze"
              className="rounded-full px-4 py-2 text-sm font-semibold transition hover:opacity-90"
              style={{
                background: 'var(--accent)',
                color: '#060a0f',
              }}
            >
              Analyser
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="pb-16 pt-16 sm:pt-28">
          <div className="rise d1">
            <p
              className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                border: '1px solid var(--border-accent)',
              }}
            >
              Diagnostic IA · Rétention
            </p>
          </div>
          <h1
            className="rise d2 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl"
            style={{ color: 'var(--text-primary)', lineHeight: 1.05 }}
          >
            Pourquoi votre contenu{' '}
            <span style={{ color: 'var(--accent)' }}>perd l&apos;attention</span>{' '}
            — et comment le fixer.
          </h1>
          <p
            className="rise d3 mt-6 max-w-2xl text-lg leading-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            Attentiq analyse votre contenu image par image et identifie les
            moments exacts où l&apos;attention chute. Diagnostic structurel en
            60 à 90 secondes.
          </p>

          <div className="rise d4 mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold transition hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#060a0f' }}
            >
              Analyser une vidéo/photo/texte par exemple
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 rounded-full px-6 py-4 text-sm font-medium transition hover:opacity-80"
              style={{
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              Comment ça marche →
            </Link>
          </div>

          <p
            className="rise d5 mt-5 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Aucune création de compte. Vos données ne sont pas stockées.
          </p>
        </section>

        {/* Visual — animated scan mockup */}
        <section className="rise d3 pb-20">
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Header bar */}
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: 'var(--accent)', opacity: 0.8 }}
                />
                <span
                  className="font-mono text-xs font-medium tracking-[0.15em]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  DIAGNOSTIC EN COURS
                </span>
              </div>
              <span
                className="font-mono text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                attentiq.ai
              </span>
            </div>

            {/* Waveform bars */}
            <div className="flex items-end justify-center gap-1 px-6 py-10 sm:gap-1.5">
              {[
                { anim: 'bar1', h: '30%' },
                { anim: 'bar2', h: '60%' },
                { anim: 'bar3', h: '40%' },
                { anim: 'bar4', h: '70%' },
                { anim: 'bar5', h: '20%' },
                { anim: 'bar6', h: '85%' },
                { anim: 'bar7', h: '50%' },
                { anim: 'bar8', h: '35%' },
                { anim: 'bar1', h: '65%' },
                { anim: 'bar2', h: '45%' },
                { anim: 'bar3', h: '80%' },
                { anim: 'bar4', h: '25%' },
                { anim: 'bar5', h: '55%' },
                { anim: 'bar6', h: '40%' },
                { anim: 'bar7', h: '75%' },
                { anim: 'bar8', h: '30%' },
                { anim: 'bar1', h: '90%' },
                { anim: 'bar2', h: '50%' },
                { anim: 'bar3', h: '35%' },
                { anim: 'bar4', h: '60%' },
                { anim: 'bar5', h: '45%' },
                { anim: 'bar6', h: '70%' },
                { anim: 'bar7', h: '25%' },
                { anim: 'bar8', h: '55%' },
              ].map((bar, i) => (
                <div
                  key={i}
                  className="w-2 rounded-sm sm:w-3"
                  style={{
                    height: '80px',
                    animation: `${bar.anim} ${1.2 + (i % 4) * 0.3}s ease-in-out infinite`,
                    animationDelay: `${i * 0.08}s`,
                    background: `linear-gradient(to top, var(--accent), rgba(0,212,255,0.3))`,
                    opacity: 0.7 + (i % 3) * 0.1,
                  }}
                />
              ))}
            </div>

            {/* Metrics row */}
            <div
              className="grid grid-cols-3 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              {[
                { label: 'Score rétention', value: '7.4', unit: '/10' },
                { label: 'Chutes détectées', value: '3', unit: '' },
                { label: 'Temps analyse', value: '68', unit: 's' },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="px-5 py-4 text-center"
                  style={{
                    borderRight: '1px solid var(--border)',
                  }}
                >
                  <p
                    className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {metric.label}
                  </p>
                  <p
                    className="font-mono text-2xl font-bold"
                    style={{ color: 'var(--accent)' }}
                  >
                    {metric.value}
                    <span
                      className="text-sm font-normal"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {metric.unit}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="pb-20">
          <div className="rise mb-10 d2">
            <p
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--accent)' }}
            >
              Ce que vous obtenez
            </p>
            <h2
              className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
              style={{ color: 'var(--text-primary)' }}
            >
              Un diagnostic, pas une promesse.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: '⏱',
                title: 'Timestamps précis',
                description:
                  'Les secondes exactes où l\'attention chute — pas une vague impression.',
              },
              {
                icon: '🔍',
                title: 'Causes identifiées',
                description:
                  'Visuel, verbal, rythme ou structure : l\'outil nomme ce qui décroche.',
              },
              {
                icon: '📋',
                title: '3 actions concrètes',
                description:
                  'Des corrections applicables à votre prochaine vidéo, pas des généralités.',
              },
              {
                icon: '🎬',
                title: 'Vidéo, photo ou texte',
                description:
                  'TikTok, Instagram, YouTube, upload direct, image ou contenu texte.',
              },
              {
                icon: '🔒',
                title: 'Données supprimées',
                description:
                  'Votre contenu est analysé puis immédiatement supprimé. Rien n\'est stocké.',
              },
              {
                icon: '⚡',
                title: '60 à 90 secondes',
                description:
                  'Résultat en moins de deux minutes. Pas d\'attente, pas de compte requis.',
              },
            ].map((feature, i) => (
              <article
                key={feature.title}
                className="rise rounded-2xl p-6"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  animationDelay: `${0.05 + i * 0.08}s`,
                }}
              >
                <div className="mb-4 text-2xl">{feature.icon}</div>
                <h3
                  className="mb-2 text-base font-semibold tracking-[-0.02em]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-7"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-10">
          <div
            className="rise rounded-2xl px-6 py-12 text-center sm:py-16"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-accent)',
            }}
          >
            <p
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--accent)' }}
            >
              Prêt ?
            </p>
            <h2
              className="mb-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
              style={{ color: 'var(--text-primary)' }}
            >
              Voyez ce que cache votre contenu.
            </h2>
            <p
              className="mb-8 text-base leading-7"
              style={{ color: 'var(--text-secondary)' }}
            >
              Vidéo, photo ou texte. Le diagnostic arrive en 60 à 90 secondes.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold transition hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#060a0f' }}
            >
              Analyser une vidéo/photo/texte par exemple
            </Link>
            <p
              className="mt-4 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Aucune création de compte requise.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="border-t py-8"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Attentiq — Diagnostic IA de rétention vidéo
            </p>
            <nav className="flex flex-wrap gap-4">
              {[
                { href: '/guide', label: 'Comment ça marche' },
                { href: '/transparence', label: 'Transparence' },
                { href: '/analyze', label: 'Analyser' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm transition hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
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

