import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Analyse de texte — Accroches, scripts, captions | Attentiq",
  description:
    "Analysez vos textes, accroches et scripts avec l'IA. 3 offres : 4 €, 14 €/mois, 29 €/mois.",
};

const features = [
  "Score d'accroche et d'engagement du texte",
  "Identification des formulations qui perdent le lecteur",
  "Suggestions de reformulation actionnables",
  "Analyse du rythme et de la structure narrative",
  "Comparaison avec les patterns qui performent",
];

const pricingTiers = [
  {
    id: "starter",
    label: "Starter",
    price: "4 €",
    period: "une fois",
    description: "1 texte analysé",
    detail:
      "Idéal pour tester le diagnostic sur une accroche ou un script précis.",
    cta: "Analyser 1 texte",
    href: "/analyze",
    featured: false,
  },
  {
    id: "pro",
    label: "Pro",
    price: "14 €",
    period: "/mois",
    description: "5 textes / mois",
    detail:
      "Pour les créateurs qui publient régulièrement et veulent affiner leur écriture.",
    cta: "Commencer Pro",
    href: "/analyze",
    featured: true,
  },
  {
    id: "illimite",
    label: "Illimité",
    price: "29 €",
    period: "/mois",
    description: "Textes illimités",
    detail:
      "Pour les équipes et créateurs intensifs. Analysez autant de textes que nécessaire.",
    cta: "Commencer Illimité",
    href: "/analyze",
    featured: false,
  },
];

export default function TextPage() {
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
          maxWidth: "760px",
          margin: "0 auto",
          padding: "28px 16px 72px",
        }}
      >
        {/* Nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "32px",
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

          <Link
            href="/analyze"
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
              boxShadow: "0 12px 36px rgba(0, 212, 255, 0.18)",
            }}
          >
            Analyser
          </Link>
        </nav>

        {/* Hero */}
        <section
          className="rise d1"
          style={{ paddingBottom: "40px", paddingTop: "32px" }}
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
              marginBottom: "18px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--accent)",
              }}
            >
              Analyse de texte
            </span>
          </div>

          <h1
            style={{
              margin: "0 0 14px",
              fontSize: "clamp(2rem, 7vw, 3.6rem)",
              lineHeight: 0.96,
              letterSpacing: "-0.07em",
              color: "var(--text-primary)",
            }}
          >
            Vos textes analysés par l&apos;IA
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              lineHeight: 1.8,
              color: "rgba(237, 242, 247, 0.8)",
              maxWidth: "44rem",
            }}
          >
            Accroches, scripts, captions, emails — l&apos;IA identifie les
            formulations qui perdent le lecteur et vous propose des
            reformulations actionnables.
          </p>
        </section>

        {/* Features */}
        <section className="rise d2" style={{ marginBottom: "40px" }}>
          <div
            style={{
              borderRadius: "22px",
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.03)",
              padding: "22px 18px",
            }}
          >
            <h2
              style={{
                margin: "0 0 16px",
                fontSize: "17px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              Ce que le diagnostic texte inclut
            </h2>
            <div style={{ display: "grid", gap: "10px" }}>
              {features.map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "14px",
                    lineHeight: 1.65,
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
                      marginTop: "2px",
                    }}
                  >
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="rise d3" style={{ marginBottom: "40px" }}>
          <p
            style={{
              margin: "0 0 16px",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontWeight: 800,
              color: "var(--accent)",
            }}
          >
            Tarifs
          </p>
          <div
            style={{
              display: "grid",
              gap: "12px",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            }}
          >
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                style={{
                  borderRadius: "22px",
                  border: tier.featured
                    ? "1px solid rgba(0, 212, 255, 0.35)"
                    : "1px solid var(--border)",
                  background: tier.featured
                    ? "linear-gradient(160deg, rgba(0, 212, 255, 0.1) 0%, rgba(12, 17, 23, 0.98) 60%)"
                    : "rgba(255,255,255,0.03)",
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {tier.featured && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignSelf: "flex-start",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background: "rgba(0, 212, 255, 0.12)",
                      border: "1px solid rgba(0, 212, 255, 0.22)",
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: "var(--accent)",
                    }}
                  >
                    Populaire
                  </div>
                )}
                <div>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {tier.label}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "clamp(1.8rem, 5vw, 2.4rem)",
                        fontWeight: 900,
                        letterSpacing: "-0.05em",
                        color: "var(--text-primary)",
                      }}
                    >
                      {tier.price}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {tier.period}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: tier.featured ? "var(--accent)" : "var(--text-primary)",
                    }}
                  >
                    {tier.description}
                  </p>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    lineHeight: 1.7,
                    color: "var(--text-secondary)",
                    flexGrow: 1,
                  }}
                >
                  {tier.detail}
                </p>
                <Link
                  href={tier.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px 20px",
                    borderRadius: "999px",
                    textDecoration: "none",
                    background: tier.featured
                      ? "linear-gradient(135deg, var(--accent), #79e7ff)"
                      : "rgba(255,255,255,0.06)",
                    border: tier.featured
                      ? "none"
                      : "1px solid var(--border)",
                    color: tier.featured ? "#041017" : "var(--text-primary)",
                    fontSize: "13px",
                    fontWeight: 900,
                    boxShadow: tier.featured
                      ? "0 12px 36px rgba(0, 212, 255, 0.18)"
                      : "none",
                  }}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "24px",
            marginTop: "40px",
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
            Attentiq — Diagnostic IA de rétention vidéo
          </p>
          <nav style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[
              { href: "/guide", label: "Comment ca marche" },
              { href: "/transparence", label: "Transparence" },
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
