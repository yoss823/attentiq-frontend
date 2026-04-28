import type { Metadata } from "next";
import Link from "next/link";
import {
  formatLandingEuroCents,
  getLandingListPriceCents,
  LANDING_LAUNCH_DISCOUNT_PERCENT,
  LANDING_PAID_PLANS,
} from "@/lib/landing-pricing-plans";

export const metadata: Metadata = {
  title: "Analysez vos vidéos — Attentiq",
  description:
    "Analyse vidéo pour Shorts, Reels et TikTok : 1 analyse gratuite video (aperçu court), puis rapport complet payant.",
};

const platforms = [
  { label: "YouTube Shorts", icon: "▶" },
  { label: "Instagram Reels", icon: "◈" },
  { label: "TikTok", icon: "♪" },
];

const features = [
  "Score de rétention global (1 à 10)",
  "Secondes exactes où l'attention chute",
  "Cause de chaque chute (visuelle ou verbale)",
  "3 à 5 actions concrètes pour vos prochaines vidéos",
  "Analyse audio + visuelle frame par frame",
  "Rapport téléchargeable",
];

const plans = LANDING_PAID_PLANS;

export default function VideosPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
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

      <div className="attentiq-shell">
        {/* Nav */}
        <nav className="attentiq-nav rise d1">
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              minHeight: 44,
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "4px",
              flexWrap: "wrap",
            }}
          >
            <Link href="/guide?format=video" className="attentiq-nav-link">
              Comment ça marche
            </Link>
            <Link href="/transparence" className="attentiq-nav-link">
              Transparence
            </Link>
            <Link
              href="/analyze"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                padding: "0 18px",
                borderRadius: "999px",
                textDecoration: "none",
                background: "linear-gradient(135deg, var(--accent), #79e7ff)",
                color: "#041017",
                fontSize: "13px",
                fontWeight: 900,
                boxShadow: "0 12px 36px rgba(0, 212, 255, 0.18)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Analyser
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section
          className="rise d2"
          style={{
            paddingBottom: "clamp(2.5rem, 8vw, 3.5rem)",
            paddingTop: "clamp(1.25rem, 5vw, 3rem)",
          }}
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
              Analyse vidéo
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
            Analysez vos vidéos.
          </h1>

          <p
            style={{
              margin: "0 0 12px",
              fontSize: "17px",
              lineHeight: 1.8,
              color: "rgba(237, 242, 247, 0.8)",
              maxWidth: "44rem",
            }}
          >
            Attentiq montre vite où l&apos;attention casse, puis quoi corriger en
            priorité.
          </p>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: "16px",
              lineHeight: 1.75,
              color: "rgba(237, 242, 247, 0.72)",
              maxWidth: "44rem",
            }}
          >
            <strong style={{ color: "rgba(237, 242, 247, 0.95)" }}>
              Gratuit :
            </strong>{" "}
            jusqu&apos;à{" "}
            <strong style={{ color: "rgba(237, 242, 247, 0.95)" }}>
              1 analyse vidéo
            </strong>{" "}
            avec un aperçu court (1 à 2 signaux).{" "}
            <strong style={{ color: "rgba(237, 242, 247, 0.95)" }}>
              Payant :
            </strong>{" "}
            rapport complet détaillé (timestamps exacts + plan priorisé).
          </p>

          {/* Platform badges */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "28px",
            }}
          >
            {platforms.map((p) => (
              <div
                key={p.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "7px 13px",
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.03)",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
              >
                <span style={{ color: "var(--accent)", fontSize: "12px" }}>
                  {p.icon}
                </span>
                {p.label}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/analyze"
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
              Analyser gratuitement →
            </Link>
            <Link
              href="/guide?format=video"
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
              Comment ça marche
            </Link>
          </div>
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
              Un diagnostic complet en 90 secondes
            </h2>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: "14px",
                lineHeight: 1.65,
                color: "rgba(237, 242, 247, 0.65)",
                maxWidth: "44rem",
              }}
            >
              Le gratuit montre un aperçu court (1 à 2 signaux).
              Ci-dessous : ce que débloque le rapport payant.
            </p>
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
        <section id="tarifs" className="rise d4" style={{ marginBottom: "56px", scrollMarginTop: "96px" }}>
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
              margin: "0 0 10px",
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              lineHeight: 1,
              letterSpacing: "-0.05em",
              color: "var(--text-primary)",
            }}
          >
            Choisissez votre formule
          </h2>
          <p
            style={{
              margin: "0 0 24px",
              fontSize: "14px",
              lineHeight: 1.65,
              color: "rgba(237, 242, 247, 0.65)",
              maxWidth: "40rem",
            }}
          >
            Gratuit : 1 analyse video avec aperçu court via le bouton «
            Analyser gratuitement » dans la bannière — sans carte bancaire.
          </p>

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
                    Recommandé
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
                <span
                  style={{
                    display: "inline-flex",
                    marginBottom: "8px",
                    padding: "4px 9px",
                    borderRadius: "999px",
                    border: "1px solid rgba(16, 185, 129, 0.28)",
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#6ee7b7",
                    fontSize: "10px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  Offre de lancement -{LANDING_LAUNCH_DISCOUNT_PERCENT}%
                </span>

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
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      textDecoration: "line-through",
                    }}
                  >
                    {formatLandingEuroCents(getLandingListPriceCents(plan.priceCents))}
                  </span>
                  <span
                    style={{
                      fontSize: "38px",
                      lineHeight: 0.95,
                      letterSpacing: "-0.08em",
                      fontWeight: 900,
                      color: "var(--text-primary)",
                    }}
                  >
                    {formatLandingEuroCents(plan.priceCents)}
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
              Pret a voir ce que cache votre video ?
            </h2>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "15px",
                lineHeight: 1.8,
                color: "rgba(237, 242, 247, 0.8)",
              }}
            >
              Collez une URL. L&apos;analyse prend 90 secondes.
            </p>
            <Link
              href="/analyze"
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
              Analyser gratuitement
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
            Attentiq — Analyse vidéo et rétention
          </p>
          <nav style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[
              { href: "/guide?format=video", label: "Comment ça marche" },
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
