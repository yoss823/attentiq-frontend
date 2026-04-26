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
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 60% 0%, #0e7490 0%, #0f172a 55%, #431407 100%)",
        color: "#f8fafc",
        fontFamily: "var(--font-dm-sans, sans-serif)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid texture overlay */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 0%, black 30%, transparent 80%)",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black 30%, transparent 80%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 32px",
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.02em",
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg,#06b6d4,#f97316)",
                borderRadius: 8,
                padding: "2px 8px",
                fontSize: 13,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "0.04em",
              }}
            >
              AT
            </span>
            Attentiq
          </span>
          <Link
            href="/analyze"
            style={{
              background: "rgba(6,182,212,.15)",
              border: "1px solid rgba(6,182,212,.35)",
              color: "#67e8f9",
              borderRadius: 10,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              transition: "background .2s",
            }}
          >
            Lancer un diagnostic
          </Link>
        </nav>

        {/* Hero */}
        <section
          style={{
            maxWidth: 780,
            margin: "0 auto",
            padding: "72px 24px 56px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#f97316",
              marginBottom: 20,
            }}
          >
            Diagnostic de rétention IA
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: 20,
            }}
          >
            Sachez où votre vidéo{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#f97316,#fb923c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              fait décrocher
            </span>
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "#94a3b8",
              lineHeight: 1.65,
              maxWidth: 560,
              margin: "0 auto 36px",
            }}
          >
            Attentiq analyse votre contenu et identifie les secondes exactes où
            l&apos;attention chute — avec les causes et un plan d&apos;actions concret.
          </p>
          <Link
            href="/analyze"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg,#0891b2,#0e7490)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 12,
              padding: "14px 28px",
              textDecoration: "none",
              boxShadow: "0 0 32px rgba(6,182,212,.35)",
              transition: "opacity .2s",
            }}
          >
            Analyser une vidéo/photo/texte par exemple →
          </Link>
        </section>

        {/* Teaser gratuit */}
        <section
          style={{
            maxWidth: 860,
            margin: "0 auto 80px",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.09)",
              borderRadius: 20,
              padding: "36px 40px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#06b6d4",
                marginBottom: 10,
              }}
            >
              Teaser gratuit
            </p>
            <h2
              style={{
                fontSize: "clamp(1.3rem, 3vw, 1.9rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: 10,
              }}
            >
              2 min max pour décider
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.6 }}>
              Lancez une analyse gratuite. Vous voyez immédiatement les 3
              premières chutes d&apos;attention et 2 actions prioritaires — sans
              carte bancaire. Le rapport complet se débloque en un clic si vous
              voulez aller plus loin.
            </p>
          </div>
        </section>

        {/* Differentiation */}
        <section
          style={{
            maxWidth: 860,
            margin: "0 auto 80px",
            padding: "0 24px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 32,
            }}
          >
            Ce que les plateformes ne vous disent pas
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {[
              {
                label: "Ce que les plateformes vous donnent",
                color: "#64748b",
                items: [
                  "Vues totales",
                  "Taux de complétion global",
                  "Likes / partages",
                  "Portée estimée",
                ],
              },
              {
                label: "Ce qu'Attentiq ajoute",
                color: "#06b6d4",
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
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: `1px solid ${col.color}33`,
                  borderRadius: 16,
                  padding: "28px 28px",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: col.color,
                    marginBottom: 16,
                  }}
                >
                  {col.label}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {col.items.map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 14,
                        color: "#cbd5e1",
                        marginBottom: 10,
                      }}
                    >
                      <span style={{ color: col.color, fontSize: 16 }}>
                        {col.color === "#06b6d4" ? "✓" : "·"}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Anonymized preview */}
        <section
          style={{
            maxWidth: 860,
            margin: "0 auto 80px",
            padding: "0 24px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            À quoi ressemble un rapport ?
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "#64748b",
              fontSize: 13,
              marginBottom: 28,
            }}
          >
            Exemple anonymisé — données réelles d&apos;une vidéo analysée
          </p>
          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.09)",
              borderRadius: 20,
              padding: "32px",
            }}
          >
            {/* Score */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  border: "3px solid #f97316",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{ fontSize: 22, fontWeight: 800, color: "#f97316" }}
                >
                  6.4
                </span>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    marginBottom: 4,
                  }}
                >
                  Score de rétention
                </p>
                <p style={{ fontSize: 15, fontWeight: 600 }}>
                  Rétention fragile — 3 chutes critiques détectées
                </p>
              </div>
            </div>

            {/* Drops */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#f97316",
                marginBottom: 12,
              }}
            >
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
                style={{
                  display: "flex",
                  gap: 14,
                  marginBottom: 12,
                  padding: "12px 16px",
                  background: "rgba(249,115,22,.07)",
                  borderRadius: 10,
                  border: "1px solid rgba(249,115,22,.18)",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#f97316",
                    minWidth: 36,
                    paddingTop: 1,
                  }}
                >
                  {drop.time}
                </span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                    {drop.label}
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>{drop.desc}</p>
                </div>
              </div>
            ))}

            {/* Actions */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#06b6d4",
                margin: "20px 0 12px",
              }}
            >
              Actions prioritaires
            </p>
            {[
              "Reformuler le hook avec une promesse explicite dès la 1re seconde.",
              "Ajouter un texte de transition entre les séquences 2 et 3.",
            ].map((action) => (
              <div
                key={action}
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 10,
                  padding: "10px 14px",
                  background: "rgba(6,182,212,.07)",
                  borderRadius: 10,
                  border: "1px solid rgba(6,182,212,.18)",
                  fontSize: 13,
                  color: "#cbd5e1",
                }}
              >
                <span style={{ color: "#06b6d4", fontWeight: 700 }}>→</span>
                {action}
              </div>
            ))}

            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "#475569",
                marginTop: 20,
              }}
            >
              + 1 chute et 1 action supplémentaires dans le rapport complet
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section
          style={{
            maxWidth: 960,
            margin: "0 auto 80px",
            padding: "0 24px",
          }}
        >
          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#f97316",
              marginBottom: 10,
            }}
          >
            Offres Sprint 1
          </p>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 36,
            }}
          >
            Choisissez votre formule
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {ATTENTIQ_OFFERS.map((offer) => (
              <div
                key={offer.slug}
                style={{
                  background: offer.featured
                    ? "linear-gradient(160deg,rgba(6,182,212,.12),rgba(14,116,144,.08))"
                    : "rgba(255,255,255,.04)",
                  border: offer.featured
                    ? "1px solid rgba(6,182,212,.4)"
                    : "1px solid rgba(255,255,255,.09)",
                  borderRadius: 18,
                  padding: "28px 24px",
                  position: "relative",
                }}
              >
                {offer.featured && (
                  <span
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "linear-gradient(90deg,#0891b2,#0e7490)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      borderRadius: 20,
                      padding: "4px 14px",
                    }}
                  >
                    Recommandé
                  </span>
                )}
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                    marginBottom: 6,
                  }}
                >
                  {offer.kicker}
                </p>
                <p
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    marginBottom: 4,
                  }}
                >
                  {offer.priceLabel}
                  {offer.cadenceLabel && (
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#64748b",
                      }}
                    >
                      {offer.cadenceLabel}
                    </span>
                  )}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    marginBottom: 20,
                    lineHeight: 1.5,
                  }}
                >
                  {offer.summary}
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 24px",
                  }}
                >
                  {offer.featureList.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        fontSize: 13,
                        color: "#cbd5e1",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ color: "#06b6d4", marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={offer.checkoutPath}
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: offer.featured
                      ? "linear-gradient(135deg,#0891b2,#0e7490)"
                      : "rgba(255,255,255,.08)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    borderRadius: 10,
                    padding: "12px",
                    textDecoration: "none",
                    border: offer.featured
                      ? "none"
                      : "1px solid rgba(255,255,255,.12)",
                  }}
                >
                  {offer.ctaLabel}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section
          style={{
            maxWidth: 680,
            margin: "0 auto 80px",
            padding: "0 24px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 32,
            }}
          >
            Questions fréquentes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FAQ.map((item) => (
              <div
                key={item.q}
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.09)",
                  borderRadius: 14,
                  padding: "20px 24px",
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  {item.q}
                </p>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid rgba(255,255,255,.07)",
            maxWidth: 1100,
            margin: "0 auto",
            padding: "28px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 15 }}>Attentiq</span>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "Transparence", href: "/transparence" },
              { label: "Guide", href: "/guide" },
              { label: "Tarifs", href: "/checkout/single" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontSize: 13,
                  color: "#64748b",
                  textDecoration: "none",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#334155" }}>
            © {new Date().getFullYear()} Attentiq
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes rise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        main > div > section, main > div > nav {
          animation: rise .55s ease both;
        }
      `}</style>
    </main>
  );
}
