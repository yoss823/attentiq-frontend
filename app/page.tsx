"use client";

import Link from "next/link";
import { ATTENTIQ_OFFERS } from "@/lib/offer-config";

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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-6">
        {/* Nav */}
        <nav className="flex items-center justify-between py-5 px-2">
          <span className="inline-flex items-center gap-2 font-bold text-lg tracking-tight text-white">
            <span className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg px-2 py-0.5 text-xs font-extrabold text-white tracking-widest">
              AT
            </span>
            Attentiq
          </span>
          <Link
            href="/analyze"
            className="bg-brand-600/10 border border-brand-600/30 text-brand-300 rounded-xl px-4 py-2 text-sm font-semibold hover:bg-brand-600/20 transition-colors"
          >
            Lancer un diagnostic
          </Link>
        </nav>

        {/* Hero */}
        <section className="max-w-3xl mx-auto py-18 pb-14 text-center">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-orange-400 mb-5">
            Diagnostic de rétention IA
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-5 text-white">
            Sachez où votre vidéo{" "}
            <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
              fait décrocher
            </span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto mb-9">
            Attentiq analyse votre contenu et identifie les secondes exactes où
            l&apos;attention chute — avec les causes et un plan d&apos;actions concret.
          </p>
          <Link
            href="/analyze"
            className="inline-block bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-base rounded-xl px-7 py-4 shadow-lg shadow-brand-900/40 hover:opacity-90 transition-opacity"
          >
            Analyser une vidéo/photo/texte par exemple →
          </Link>
        </section>

        {/* Teaser gratuit */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-9 px-10">
            <p className="text-xs font-bold tracking-[0.16em] uppercase text-brand-300 mb-2.5">
              Teaser gratuit
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2.5 text-white">
              2 min max pour décider
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Lancez une analyse gratuite. Vous voyez immédiatement les 3
              premières chutes d&apos;attention et 2 actions prioritaires — sans
              carte bancaire. Le rapport complet se débloque en un clic si vous
              voulez aller plus loin.
            </p>
          </div>
        </section>

        {/* Differentiation */}
        <section className="max-w-4xl mx-auto mb-20">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight mb-8 text-white">
            Ce que les plateformes ne vous disent pas
          </h2>
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
                className={`bg-white/[0.03] rounded-2xl p-7 ${
                  col.isAccent
                    ? "border border-brand-600/30"
                    : "border border-white/[0.06]"
                }`}
              >
                <p
                  className={`text-xs font-bold tracking-[0.14em] uppercase mb-4 ${
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
                        className={`w-4.5 h-4.5 rounded-full inline-flex items-center justify-center font-extrabold text-xs shrink-0 ${
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
        <section className="max-w-4xl mx-auto mb-20">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-white">
            À quoi ressemble un rapport ?
          </h2>
          <p className="text-center text-slate-600 text-sm mb-7">
            Exemple anonymisé — données réelles d&apos;une vidéo analysée
          </p>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
            {/* Score */}
            <div className="flex items-center gap-5 mb-7">
              <div className="w-18 h-18 rounded-full border-[3px] border-orange-400 flex items-center justify-center shrink-0">
                <span className="text-2xl font-extrabold text-orange-400">6.4</span>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Score de rétention</p>
                <p className="text-base font-semibold text-white">
                  Rétention fragile — 3 chutes critiques détectées
                </p>
              </div>
            </div>

            {/* Drops */}
            <p className="text-xs font-bold tracking-[0.14em] uppercase text-orange-400 mb-3">
              Chutes d&apos;attention
            </p>
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
                className="flex gap-3.5 mb-3 px-4 py-3 bg-orange-500/[0.07] rounded-xl border border-orange-500/[0.18]"
              >
                <span className="text-xs font-bold text-orange-400 min-w-[36px] pt-0.5">
                  {drop.time}
                </span>
                <div>
                  <p className="text-sm font-semibold mb-0.5 text-white">{drop.label}</p>
                  <p className="text-xs text-slate-400">{drop.desc}</p>
                </div>
              </div>
            ))}

            {/* Actions */}
            <p className="text-xs font-bold tracking-[0.14em] uppercase text-brand-300 mt-5 mb-3">
              Actions prioritaires
            </p>
            {[
              "Reformuler le hook avec une promesse explicite dès la 1re seconde.",
              "Ajouter un texte de transition entre les séquences 2 et 3.",
            ].map((action) => (
              <div
                key={action}
                className="flex gap-2.5 mb-2.5 px-3.5 py-2.5 bg-brand-600/[0.07] rounded-xl border border-brand-600/[0.18] text-sm text-white"
              >
                <span className="text-brand-300 font-bold">→</span>
                {action}
              </div>
            ))}

            <p className="text-center text-xs text-slate-700 mt-5">
              + 1 chute et 1 action supplémentaires dans le rapport complet
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section className="max-w-5xl mx-auto mb-20">
          <p className="text-center text-xs font-bold tracking-[0.16em] uppercase text-orange-400 mb-2.5">
            Offres Sprint 1
          </p>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight mb-9 text-white">
            Choisissez votre formule
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {ATTENTIQ_OFFERS.map((offer) => (
              <div
                key={offer.slug}
                className={`relative rounded-2xl px-6 py-7 ${
                  offer.featured
                    ? "bg-gradient-to-b from-brand-600/10 to-slate-950/95 border border-brand-600/30"
                    : "bg-white/[0.03] border border-white/[0.06]"
                }`}
              >
                {offer.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-[10px] font-bold tracking-[0.12em] uppercase rounded-full px-3.5 py-1">
                    Recommandé
                  </span>
                )}
                <p
                  className={`text-xs font-bold tracking-[0.14em] uppercase mb-1.5 ${
                    offer.featured ? "text-brand-300" : "text-slate-500"
                  }`}
                >
                  {offer.kicker}
                </p>
                <p className="text-3xl font-extrabold tracking-tight mb-1 text-white">
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
                      <span className="w-4.5 h-4.5 rounded-full bg-brand-600/10 border border-brand-600/20 text-brand-300 inline-flex items-center justify-center font-extrabold text-xs shrink-0">
                        ✓
                      </span>
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  href={offer.checkoutPath}
                  className={`block text-center font-bold text-sm rounded-xl py-3 text-white transition-opacity hover:opacity-90 ${
                    offer.featured
                      ? "bg-gradient-to-br from-brand-600 to-brand-700"
                      : "bg-white/[0.06] border border-white/[0.06]"
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
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight mb-8 text-white">
            Questions fréquentes
          </h2>
          <div className="flex flex-col gap-3.5">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-6 py-5"
              >
                <p className="font-bold text-sm mb-2 text-white">{item.q}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] py-7 px-2 flex items-center justify-between flex-wrap gap-3">
          <span className="font-bold text-base text-white">Attentiq</span>
          <div className="flex gap-6">
            {[
              { label: "Transparence", href: "/transparence" },
              { label: "Guide", href: "/guide" },
              { label: "Tarifs", href: "/checkout/single" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-slate-700">
            © {new Date().getFullYear()} Attentiq
          </p>
        </footer>
      </div>
    </main>
  );
}
