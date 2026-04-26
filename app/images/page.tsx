import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AnalyzeTextImageExperience from "@/components/analyze-text-image-experience";

export const metadata: Metadata = {
  title: "Analysez vos photos — Attentiq",
  description:
    "Diagnostic IA de rétention pour vos visuels. 3 formules : 9€ (1 photo), 29€/mois (5 photos), 59€/mois (illimité).",
};

const features = [
  "Score d'impact visuel (1 à 10)",
  "Identification des zones qui captent ou perdent l'attention",
  "Analyse de la hiérarchie visuelle",
  "Recommandations de composition",
  "Détection des éléments de friction",
  "Plan d'actions concret et actionnable",
];

const plans = [
  {
    kicker: "Pour tester une fois",
    priceLabel: "9€",
    cadenceLabel: undefined,
    summary: "Analysez une photo en profondeur, sans engagement.",
    featureList: [
      "1 analyse complète",
      "Score d'impact visuel détaillé",
      "Plan d'actions personnalisé",
    ],
    ctaLabel: "Choisir 9€ (image)",
    ctaHref: "/images#tarifs",
    featured: false,
  },
  {
    kicker: "Pour publier chaque semaine",
    priceLabel: "29€",
    cadenceLabel: "/mois",
    summary: "5 analyses par mois pour optimiser vos visuels en continu.",
    featureList: [
      "5 analyses complètes / mois",
      "Même profondeur d'analyse",
      "Idéal pour une routine créative",
    ],
    ctaLabel: "Choisir 29€/mois (image)",
    ctaHref: "/images#tarifs",
    featured: true,
  },
  {
    kicker: "Pour un volume élevé",
    priceLabel: "59€",
    cadenceLabel: "/mois",
    summary: "Analyses illimitées pour les équipes et créatifs intensifs.",
    featureList: [
      "Analyses illimitées / mois",
      "Aucune limite de volume",
      "Pensé pour une production soutenue",
    ],
    ctaLabel: "Choisir 59€/mois (image)",
    ctaHref: "/images#tarifs",
    featured: false,
  },
];

export default function ImagesPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.14), transparent 28%), var(--bg-base)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.18) 68%, transparent 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "980px",
          margin: "0 auto",
          padding: "28px 16px 80px",
        }}
      >
        {/* Nav */}
        <nav
          className="rise d1"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(0, 212, 255, 0.1)",
                border: "1px solid rgba(0, 212, 255, 0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.1em",
                color: "var(--accent)",
              }}
            >
              AT
            </div>
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Attentiq
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link
              href="/guide"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                textDecoration: "none",
              }}
            >
              Comment ca marche
            </Link>
            <Link
              href="/transparence"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                textDecoration: "none",
                marginLeft: "8px",
              }}
            >
              Transparence
            </Link>
            <Link
              href="/videos"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 18px",
                borderRadius: "999px",
                textDecoration: "none",
                background: "linear-gradient(135deg, var(--accent), #79e7ff)",
                color: "#041017",
                fontSize: "13px",
                fontWeight: 900,
                marginLeft: "8px",
                boxShadow: "0 12px 36px rgba(0, 212, 255, 0.18)",
              }}
            >
              Videos
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section
          className="rise d2"
          style={{ paddingBottom: "56px", paddingTop: "48px" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 12px",
              borderRadius: "999px",
              background: "rgba(0, 212, 255, 0.08)",
              border: "1px solid rgba(0, 212, 255, 0.18)",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "999px",
                background: "var(--accent)",
                boxShadow: "0 0 10px var(--accent-glow)",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--accent)",
              }}
            >
              Analyse visuelle IA
            </span>
          </div>

          <h1
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(2.4rem, 8vw, 4.8rem)",
              lineHeight: 0.94,
              letterSpacing: "-0.07em",
              color: "var(--text-primary)",
              maxWidth: "16ch",
            }}
          >
            Analysez vos photos.
          </h1>

          <p
            style={{
              margin: "0 0 28px",
              fontSize: "17px",
              lineHeight: 1.8,
              color: "rgba(237, 242, 247, 0.8)",
              maxWidth: "44rem",
            }}
          >
            Attentiq identifie les zones de votre visuel qui captent ou perdent
            l&apos;attention — avec les causes et un plan d&apos;actions concret
            pour composer plus efficacement.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/images#tarifs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 26px",
                borderRadius: "999px",
                textDecoration: "none",
                background: "linear-gradient(135deg, var(--accent), #79e7ff)",
                color: "#041017",
                fontSize: "15px",
                fontWeight: 900,
                boxShadow: "0 18px 52px rgba(0, 212, 255, 0.2)",
              }}
            >
              Voir les offres image →
            </Link>
            <Link
              href="/guide"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 22px",
                borderRadius: "999px",
                textDecoration: "none",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              Comment ca marche
            </Link>
          </div>

          <Suspense fallback={null}>
            <AnalyzeTextImageExperience mode="image" />
          </Suspense>
        </section>

        {/* Features */}
        <section className="rise d3" style={{ marginBottom: "56px" }}>
          <div
            style={{
              borderRadius: "28px",
              border: "1px solid var(--border)",
              background:
                "linear-gradient(180deg, rgba(12, 17, 23, 0.95) 0%, rgba(7, 11, 16, 0.96) 100%)",
              padding: "28px 22px",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontWeight: 800,
                color: "var(--accent)",
              }}
            >
              Ce que vous obtenez
            </p>
            <h2
              style={{
                margin: "0 0 20px",
                fontSize: "clamp(1.4rem, 4vw, 2rem)",
                lineHeight: 1,
                letterSpacing: "-0.05em",
                color: "var(--text-primary)",
              }}
            >
              Un diagnostic complet de votre visuel
            </h2>
            <div
              style={{
                display: "grid",
                gap: "10px",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              {features.map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "14px",
                    color: "rgba(237, 242, 247, 0.84)",
                  }}
                >
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "rgba(0, 212, 255, 0.12)",
                      border: "1px solid rgba(0, 212, 255, 0.22)",
                      color: "var(--accent)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "10px",
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="tarifs" className="rise d4" style={{ marginBottom: "56px" }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontWeight: 800,
              color: "var(--text-secondary)",
            }}
          >
            Tarifs
          </p>
          <h2
            style={{
              margin: "0 0 24px",
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              lineHeight: 1,
              letterSpacing: "-0.05em",
              color: "var(--text-primary)",
            }}
          >
            Choisissez votre formule
          </h2>

          <div
            style={{
              display: "grid",
              gap: "14px",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {plans.map((plan) => (
              <article
                key={plan.ctaHref}
                style={{
                  borderRadius: "24px",
                  border: plan.featured
                    ? "1px solid rgba(0, 212, 255, 0.24)"
                    : "1px solid var(--border)",
                  background: plan.featured
                    ? "linear-gradient(180deg, rgba(0, 212, 255, 0.1) 0%, rgba(10, 14, 20, 0.96) 100%)"
                    : "rgba(255,255,255,0.03)",
                  padding: "22px 18px",
                  position: "relative",
                }}
              >
                {plan.featured && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "5px 12px",
                      borderRadius: "999px",
                      background:
                        "linear-gradient(135deg, var(--accent), #79e7ff)",
                      color: "#041017",
                      fontSize: "10px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Recommande
                  </div>
                )}

                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 800,
                    color: plan.featured
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  }}
                >
                  {plan.kicker}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "5px",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "38px",
                      lineHeight: 0.95,
                      letterSpacing: "-0.08em",
                      fontWeight: 900,
                      color: "var(--text-primary)",
                    }}
                  >
                    {plan.priceLabel}
                  </span>
                  {plan.cadenceLabel && (
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {plan.cadenceLabel}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    margin: "0 0 16px",
                    fontSize: "14px",
                    lineHeight: 1.7,
                    color: "var(--text-secondary)",
                  }}
                >
                  {plan.summary}
                </p>

                <div
                  style={{ marginBottom: "16px", display: "grid", gap: "8px" }}
                >
                  {plan.featureList.map((f) => (
                    <div
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "13px",
                        color: "var(--text-primary)",
                      }}
                    >
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: "rgba(0, 212, 255, 0.12)",
                          border: "1px solid rgba(0, 212, 255, 0.22)",
                          color: "var(--accent)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "10px",
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
                  href={plan.ctaHref}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "13px 18px",
                    borderRadius: "999px",
                    textDecoration: "none",
                    background: plan.featured
                      ? "linear-gradient(135deg, var(--accent), #79e7ff)"
                      : "rgba(255,255,255,0.06)",
                    border: plan.featured
                      ? "none"
                      : "1px solid rgba(255,255,255,0.1)",
                    color: plan.featured ? "#041017" : "var(--text-primary)",
                    fontSize: "14px",
                    fontWeight: 900,
                    boxShadow: plan.featured
                      ? "0 18px 52px rgba(0, 212, 255, 0.18)"
                      : "none",
                  }}
                >
                  {plan.ctaLabel}
                </Link>
              </article>
            ))}
          </div>
          <p
            style={{
              margin: "14px 0 0",
              fontSize: "13px",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
            }}
          >
            Paiement image en cours de raccordement. En attendant, contactez-nous
            depuis le chat pour activer votre formule.
          </p>
        </section>

        {/* CTA */}
        <section className="rise d5" style={{ marginBottom: "56px" }}>
          <div
            style={{
              borderRadius: "28px",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              background:
                "linear-gradient(160deg, rgba(0, 212, 255, 0.08) 0%, rgba(12, 17, 23, 0.98) 60%)",
              padding: "40px 28px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: "clamp(1.6rem, 5vw, 2.6rem)",
                lineHeight: 0.98,
                letterSpacing: "-0.06em",
                color: "var(--text-primary)",
              }}
            >
              Pret a voir ce que cache votre photo ?
            </h2>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "15px",
                lineHeight: 1.8,
                color: "rgba(237, 242, 247, 0.8)",
              }}
            >
              Importez votre visuel. L&apos;analyse prend quelques secondes.
            </p>
            <Link
              href="/images#tarifs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 28px",
                borderRadius: "999px",
                textDecoration: "none",
                background: "linear-gradient(135deg, var(--accent), #79e7ff)",
                color: "#041017",
                fontSize: "15px",
                fontWeight: 900,
                boxShadow: "0 18px 52px rgba(0, 212, 255, 0.2)",
              }}
            >
              Voir les offres image
            </Link>
            <p
              style={{
                margin: "14px 0 0",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              Aucune creation de compte requise.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "24px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            Attentiq — Analyse d&apos;attention multi-formats
          </p>
          <nav style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[
              { href: "/guide", label: "Comment ca marche" },
              { href: "/transparence", label: "Transparence" },
              { href: "/videos", label: "Vidéos" },
              { href: "/text", label: "Textes" },
              { href: "/images", label: "Photos" },
              { href: "/analyze", label: "Analyser" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </footer>
      </div>
    </main>
  );
}
