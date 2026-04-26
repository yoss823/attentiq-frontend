import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Comment fonctionne Attentiq ?",
  description:
    "3 étapes. 90 secondes. Un diagnostic de rétention vidéo que vous ne trouverez nulle part ailleurs.",
};

const steps = [
  {
    number: "01",
    title: "Vous collez une URL TikTok publique",
    description:
      "N'importe quelle video publique, la votre ou celle d'un concurrent.",
  },
  {
    number: "02",
    title: "L'IA analyse chaque seconde",
    description:
      "Transcription audio, analyse visuelle frame par frame, detection des moments de decrochage. Temps d'analyse : 60 a 90 secondes.",
  },
  {
    number: "03",
    title: "Vous recevez un diagnostic actionnable",
    description:
      "Score de retention, points de chute precis (en secondes), causes identifiees, actions pour vos prochaines videos.",
  },
];

const reportContains = [
  "Le score de retention global (1 a 10)",
  "Les secondes exactes ou l'attention chute",
  "La cause de chaque chute (visuelle ou verbale)",
  "La regle de decrochage principale de votre contenu",
  "La perception que les spectateurs ont de vous",
  "3 a 5 actions concretes pour vos prochaines videos",
];

const reportDoesNotContain = [
  "Ce n'est pas une prediction de vues",
  "Ce n'est pas une promesse de viralite",
  "Ce n'est pas un outil algorithmique",
];

export default function GuidePage() {
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
              Guide
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
            Comment fonctionne Attentiq ?
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
            3 etapes. 90 secondes. Un diagnostic que vous ne trouverez nulle
            part ailleurs.
          </p>
        </section>

        {/* 3 Steps */}
        <section className="rise d2" style={{ marginBottom: "40px" }}>
          <div style={{ display: "grid", gap: "12px" }}>
            {steps.map((step) => (
              <div
                key={step.number}
                style={{
                  borderRadius: "22px",
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.03)",
                  padding: "22px 18px",
                  display: "grid",
                  gridTemplateColumns: "48px minmax(0, 1fr)",
                  gap: "16px",
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "rgba(0, 212, 255, 0.08)",
                    border: "1px solid rgba(0, 212, 255, 0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "var(--accent)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {step.number}
                </div>
                <div>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontSize: "16px",
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      color: "var(--text-primary)",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: 1.75,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ce que le rapport contient / ne contient pas */}
        <section className="rise d3" style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "grid",
              gap: "12px",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
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
                Ce que le rapport contient
              </h2>
              <div style={{ display: "grid", gap: "10px" }}>
                {reportContains.map((item) => (
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
                  margin: "0 0 10px",
                  fontSize: "17px",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                }}
              >
                Ce que le rapport ne contient{" "}
                <span style={{ color: "#f87171" }}>pas</span>
              </h2>
              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: "13px",
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                }}
              >
                La transparence, c&apos;est aussi savoir ce qu&apos;on ne
                promet pas.
              </p>
              <div style={{ display: "grid", gap: "10px" }}>
                {reportDoesNotContain.map((item) => (
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
                        background: "rgba(248, 113, 113, 0.12)",
                        border: "1px solid rgba(248, 113, 113, 0.2)",
                        color: "#f87171",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "10px",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      ×
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rise d4">
          <div
            style={{
              borderRadius: "28px",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              background:
                "linear-gradient(160deg, rgba(0, 212, 255, 0.08) 0%, rgba(12, 17, 23, 0.98) 60%)",
              padding: "36px 24px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: "clamp(1.5rem, 5vw, 2.4rem)",
                lineHeight: 0.98,
                letterSpacing: "-0.06em",
                color: "var(--text-primary)",
              }}
            >
              Pret a voir ce que cache votre video ?
            </h2>
            <p
              style={{
                margin: "0 0 22px",
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
              Analyser ma video gratuitement
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
            Attentiq — Diagnostic IA de retention video
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
