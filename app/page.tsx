import type { Metadata } from "next";
import Link from "next/link";
import { ATTENTIQ_OFFERS } from "@/lib/offer-config";

export const metadata: Metadata = {
  title: "Attentiq — Diagnostic de rétention vidéo par IA",
  description:
    "Attentiq analyse votre contenu et identifie les secondes exactes où l'attention chute — avec les causes et un plan d'actions concret.",
};

const FAQ = [
  {
    q: "C'est quoi exactement un diagnostic Attentiq ?",
    a: "On analyse votre contenu (vidéo, photo ou texte) et on identifie les moments précis où l'attention chute — avec les causes et un plan d'actions concret.",
  },
  {
    q: "Est-ce que mes données sont partagées ?",
    a: "Non. Vos contenus sont analysés de façon anonymisée et ne sont jamais revendus ni utilisés pour entraîner des modèles tiers.",
  },
  {
    q: "Combien de temps prend l'analyse ?",
    a: "Moins de 2 minutes pour obtenir votre teaser gratuit. Le rapport complet est disponible immédiatement après paiement.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Subtle grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(51,64,245,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(51,64,245,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 pb-24 pt-6 sm:px-8">
        {/* Nav */}
        <nav className="rise flex items-center justify-between py-2">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold tracking-widest bg-brand-600/10 border border-brand-600/30 text-brand-300">
              AT
            </div>
            <span className="text-base font-semibold tracking-[-0.02em] text-white">
              Attentiq
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/guide"
              className="hidden rounded-full px-4 py-2 text-sm font-medium transition sm:block text-slate-400 border border-white/[0.08] hover:text-white"
            >
              Comment ça marche
            </Link>
            <Link
              href="/transparence"
              className="hidden rounded-full px-4 py-2 text-sm font-medium transition sm:block text-slate-400 border border-white/[0.08] hover:text-white"
            >
              Transparence
            </Link>
            <Link
              href="/analyze"
              className="rounded-full px-4 py-2 text-sm font-semibold transition bg-brand-600 text-white hover:opacity-90"
            >
              Analyser
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="pb-16 pt-16 sm:pt-24 text-center">
          <div className="rise" style={{ animationDelay: "0.05s" }}>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] bg-brand-600/10 text-brand-300 border border-brand-600/30">
              Diagnostic de rétention IA
            </p>
            <h1
              className="max-w-3xl mx-auto text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl text-white"
              style={{ lineHeight: 1.05 }}
            >
              Sachez où votre vidéo{" "}
              <span className="text-brand-300">fait décrocher</span>
            </h1>
            <p className="mt-6 max-w-xl mx-auto text-lg leading-8 text-slate-400">
              Attentiq analyse votre contenu et identifie les secondes exactes
              où l&apos;attention chute — avec les causes et un plan
              d&apos;actions concret.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold transition hover:opacity-90 bg-brand-600 text-white"
              >
                Analyser gratuitement →
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-medium transition text-slate-400 border border-white/[0.08] hover:text-white"
              >
                Comment ça marche
              </Link>
            </div>
          </div>
        </section>

        {/* Teaser gratuit */}
        <section className="mb-20">
          <div
            className="rise rounded-2xl p-8 sm:p-10 bg-white/[0.03] border border-white/[0.06]"
            style={{ animationDelay: "0.1s" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-300 mb-3">
              Teaser gratuit
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.04em] mb-3 text-white">
              2 min max pour décider
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
              Lancez une analyse gratuite. Vous voyez immédiatement les 3
              premières chutes d&apos;attention et 2 actions prioritaires — sans
              carte bancaire. Le rapport complet se débloque en un clic si vous
              voulez aller plus loin.
            </p>
          </div>
        </section>

        {/* Differentiation */}
        <section className="mb-20">
          <div className="rise mb-8" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-center text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-white">
              Ce que les plateformes ne vous disent pas
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                label: "Ce que les plateformes vous donnent",
                isAccent: false,
                items: [
                  "Vues totales",
                  "Taux de complétion global",
                  "Likes / partages",
                  "Portée estimée",
                ],
              },
              {
                label: "Ce qu'Attentiq ajoute",
                isAccent: true,
                items: [
                  "Secondes exactes de décrochage",
                  "Cause identifiée pour chaque chute",
                  "Plan d'actions priorisé",
                  "Comparaison avec vos autres vidéos",
                ],
              },
            ].map((col) => (
              <div
                key={col.label}
                className={`rise rounded-2xl p-7 ${
                  col.isAccent
                    ? "bg-white/[0.03] border border-brand-600/30"
                    : "bg-white/[0.03] border border-white/[0.06]"
                }`}
                style={{ animationDelay: "0.15s" }}
              >
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.18em] mb-4 ${
                    col.isAccent ? "text-brand-300" : "text-slate-500"
                  }`}
                >
                  {col.label}
                </p>
                <div className="grid gap-2">
                  {col.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-sm text-white"
                    >
                      <span
                        className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-xs shrink-0 ${
                          col.isAccent
                            ? "bg-brand-600/10 border border-brand-600/20 text-brand-300"
                            : "bg-white/[0.06] border border-white/[0.06] text-slate-500"
                        }`}
                      >
                        {col.isAccent ? "✓" : "·"}
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Anonymized preview */}
        <section className="mb-20">
          <div className="rise mb-6" style={{ animationDelay: "0.1s" }}>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-300">
              Exemple de rapport
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-white">
              À quoi ressemble un diagnostic ?
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              Exemple anonymisé — données représentatives d&apos;une vidéo analysée.
            </p>
          </div>

          <div
            className="rise rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06]"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Score */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] p-5 sm:p-6">
              <div>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  Diagnostic Attentiq — exemple anonymisé
                </p>
                <p className="mt-2 text-base font-semibold tracking-[-0.02em] text-white">
                  Rétention fragile — 3 chutes critiques détectées
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Score de rétention
                </p>
                <p className="mt-1 font-mono text-3xl font-bold text-brand-300">
                  6.4
                  <span className="text-base font-normal text-slate-500">
                    /10
                  </span>
                </p>
              </div>
            </div>

            {/* Drops */}
            <div className="p-5 sm:p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Chutes d&apos;attention
              </p>
              <div className="space-y-3">
                {[
                  {
                    time: "0:04",
                    label: "Hook trop lent",
                    desc: "Aucune promesse claire dans les 3 premières secondes.",
                  },
                  {
                    time: "0:11",
                    label: "Transition abrupte",
                    desc: "Coupure visuelle sans lien narratif — perte de contexte.",
                  },
                  {
                    time: "0:23",
                    label: "Fin sans CTA",
                    desc: "L'audience ne sait pas quoi faire après avoir regardé.",
                  },
                ].map((drop) => (
                  <div
                    key={drop.time}
                    className="rounded-xl p-4 bg-white/[0.04] border border-white/[0.06]"
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-semibold text-white">
                        {drop.time}
                      </span>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                        style={{
                          background: "rgba(251,146,60,0.12)",
                          color: "#fb923c",
                          border: "1px solid rgba(251,146,60,0.25)",
                        }}
                      >
                        chute
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1 text-white">{drop.label}</p>
                    <p className="text-sm leading-6 text-slate-400">{drop.desc}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Actions prioritaires
                </p>
                <ol className="space-y-2.5">
                  {[
                    "Reformuler le hook avec une promesse explicite dès la 1re seconde.",
                    "Ajouter un texte de transition entre les séquences 2 et 3.",
                  ].map((action, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold bg-brand-600/10 text-brand-300 border border-brand-600/30">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-6 text-slate-400">{action}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <p className="text-center text-xs text-slate-600 mt-5">
                + 1 chute et 1 action supplémentaires dans le rapport complet
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mb-20">
          <div className="rise mb-8" style={{ animationDelay: "0.1s" }}>
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-300 mb-3">
              Tarifs
            </p>
            <h2 className="text-center text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-white">
              Choisissez votre formule
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {ATTENTIQ_OFFERS.map((offer, i) => (
              <div
                key={offer.slug}
                className={`rise relative rounded-2xl px-6 py-7 ${
                  offer.featured
                    ? "bg-white/[0.03] border border-brand-600/30"
                    : "bg-white/[0.03] border border-white/[0.06]"
                }`}
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                {offer.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold tracking-[0.12em] uppercase rounded-full px-3.5 py-1">
                    Recommandé
                  </span>
                )}
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.18em] mb-2 ${
                    offer.featured ? "text-brand-300" : "text-slate-500"
                  }`}
                >
                  {offer.kicker}
                </p>
                <p className="text-3xl font-bold tracking-tight mb-1 text-white">
                  {offer.priceLabel}
                  {offer.cadenceLabel && (
                    <span className="text-sm font-medium text-slate-400">
                      {offer.cadenceLabel}
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-400 mb-5 leading-relaxed">
                  {offer.summary}
                </p>
                <div className="grid gap-2 mb-6">
                  {offer.featureList.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-sm text-white"
                    >
                      <span className="w-5 h-5 rounded-full bg-brand-600/10 border border-brand-600/20 text-brand-300 inline-flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </span>
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  href={offer.checkoutPath}
                  className={`block text-center font-semibold text-sm rounded-full py-3 text-white transition hover:opacity-90 ${
                    offer.featured
                      ? "bg-brand-600"
                      : "bg-white/[0.06] border border-white/[0.08]"
                  }`}
                >
                  {offer.ctaLabel}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto mb-20">
          <h2 className="text-center text-2xl sm:text-3xl font-semibold tracking-[-0.04em] mb-8 text-white">
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="rise bg-white/[0.03] border border-white/[0.06] rounded-2xl px-6 py-5"
                style={{ animationDelay: "0.1s" }}
              >
                <p className="font-semibold text-sm mb-2 text-white">{item.q}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-20">
          <div className="rise rounded-2xl px-6 py-12 text-center sm:py-16 bg-white/[0.03] border border-brand-600/30">
            <h2 className="mb-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl text-white">
              Prêt à voir ce que cache votre vidéo ?
            </h2>
            <p className="mb-8 text-base leading-7 text-slate-400">
              Collez une URL. L&apos;analyse prend 90 secondes.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold transition hover:opacity-90 bg-brand-600 text-white"
            >
              Analyser gratuitement
            </Link>
            <p className="mt-4 text-sm text-slate-400">
              Aucune création de compte requise.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-400">
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
                  className="text-sm transition hover:opacity-80 text-slate-400"
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
