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
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.16), transparent 28%), radial-gradient(circle at 82% 16%, rgba(251, 146, 60, 0.12), transparent 18%), var(--bg-base)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-dm-sans, sans-serif)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        {/* Nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 8px",
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
              color: "var(--text-primary)",
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent), #f97316)",
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
              background: "rgba(0, 212, 255, 0.1)",
              border: "1px solid var(--border-accent)",
              color: "var(--accent)",
              borderRadius: 10,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
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
            padding: "72px 0 56px",
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
              color: "var(--text-primary)",
            }}
          >
            Sachez où votre vidéo{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #f97316, #fb923c)",
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
              color: "var(--text-secondary)",
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
              background: "linear-gradient(135deg, #0891b2, #0e7490)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 12,
              padding: "14px 28px",
              textDecoration: "none",
              boxShadow: "0 0 32px var(--accent-glow)",
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
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
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
                color: "var(--accent)",
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
                color: "var(--text-primary)",
              }}
            >
              2 min max pour décider
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>
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
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 32,
              color: "var(--text-primary)",
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
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: col.isAccent
                    ? "1px solid var(--border-accent)"
                    : "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "28px",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: col.isAccent ? "var(--accent)" : "var(--text-secondary)",
                    marginBottom: 16,
                  }}
                >
                  {col.label}
                </p>
                <div style={{ display: "grid", gap: 8 }}>
                  {col.items.map((item) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.02)",
                        fontSize: 14,
                        color: "var(--text-primary)",
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: col.isAccent
                            ? "rgba(0, 212, 255, 0.12)"
                            : "rgba(255,255,255,0.06)",
                          border: col.isAccent
                            ? "1px solid rgba(0, 212, 255, 0.22)"
                            : "1px solid var(--border)",
                          color: col.isAccent ? "var(--accent)" : "var(--text-secondary)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 11,
                          flexShrink: 0,
                        }}
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
        <section
          style={{
            maxWidth: 860,
            margin: "0 auto 80px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 8,
              color: "var(--text-primary)",
            }}
          >
            À quoi ressemble un rapport ?
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 13,
              marginBottom: 28,
            }}
          >
            Exemple anonymisé — données réelles d&apos;une vidéo analysée
          </p>
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
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
                    color: "var(--text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  Score de rétention
                </p>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
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
                  background: "rgba(249,115,22,0.07)",
                  borderRadius: 10,
                  border: "1px solid rgba(249,115,22,0.18)",
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
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: "var(--text-primary)" }}>
                    {drop.label}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{drop.desc}</p>
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
                color: "var(--accent)",
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
                  background: "rgba(0, 212, 255, 0.07)",
                  borderRadius: 10,
                  border: "1px solid rgba(0, 212, 255, 0.18)",
                  fontSize: 13,
                  color: "var(--text-primary)",
                }}
              >
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>→</span>
                {action}
              </div>
            ))}

            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "var(--text-muted)",
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
              color: "var(--text-primary)",
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
                    ? "linear-gradient(180deg, rgba(0, 212, 255, 0.1) 0%, rgba(10, 14, 20, 0.96) 100%)"
                    : "rgba(255,255,255,0.03)",
                  border: offer.featured
                    ? "1px solid rgba(0, 212, 255, 0.26)"
                    : "1px solid var(--border)",
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
                      background: "linear-gradient(90deg, #0891b2, #0e7490)",
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
                    color: offer.featured ? "var(--accent)" : "var(--text-secondary)",
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
                    color: "var(--text-primary)",
                  }}
                >
                  {offer.priceLabel}
                  {offer.cadenceLabel && (
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {offer.cadenceLabel}
                    </span>
                  )}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    marginBottom: 20,
                    lineHeight: 1.5,
                  }}
                >
                  {offer.summary}
                </p>
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    marginBottom: 24,
                  }}
                >
                  {offer.featureList.map((f) => (
                    <div
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.02)",
                        fontSize: 13,
                        color: "var(--text-primary)",
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "rgba(0, 212, 255, 0.12)",
                          border: "1px solid rgba(0, 212, 255, 0.22)",
                          color: "var(--accent)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 11,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  href={offer.checkoutPath}
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: offer.featured
                      ? "linear-gradient(135deg, #0891b2, #0e7490)"
                      : "rgba(255,255,255,0.06)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    borderRadius: 12,
                    padding: "12px",
                    textDecoration: "none",
                    border: offer.featured
                      ? "none"
                      : "1px solid var(--border)",
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
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 32,
              color: "var(--text-primary)",
            }}
          >
            Questions fréquentes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FAQ.map((item) => (
              <div
                key={item.q}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "20px 24px",
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 8,
                    color: "var(--text-primary)",
                  }}
                >
                  {item.q}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid var(--border)",
            padding: "28px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Attentiq</span>
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
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Attentiq
          </p>
        </footer>
      </div>
    </main>
  );
}
