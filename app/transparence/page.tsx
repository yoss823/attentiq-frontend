import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ce qu'Attentiq fait — et ce qu'il ne fait pas | Attentiq",
  description:
    "Transparence sur les capacités et limites d'Attentiq. Ce que l'outil fait bien, ce qu'il ne peut pas garantir, et comment vos données sont traitées.",
};

const strengths = [
  "Identifier des signaux structurels dans la video (rythme, accroche, ruptures narratives)",
  "Donner des timestamps precis sur les zones a risque de decrochage",
  "Traduire ces signaux en langage actionnable pour vos prochaines videos",
  "Fonctionner sans acces a votre compte (pas besoin de connexion)",
];

const limits = [
  "Il n'analyse pas l'algorithme des plateformes ni les tendances du moment",
  "Il ne peut pas predire les vues, la viralite ou la croissance",
  "Il n'a pas acces aux donnees reelles de retention de votre compte",
  "Les recommandations sont des pistes diagnostiques — pas des certitudes",
];

const edgeCases = [
  {
    title: "Videos tres courtes (< 10 s)",
    detail: "Peu de signal a analyser. Le diagnostic devient moins stable.",
  },
  {
    title: "Audio indisponible",
    detail:
      "L'analyse reste possible, mais elle est partielle — la transcription manque.",
  },
  {
    title: "Comptes prives ou videos supprimees",
    detail:
      "Inaccessibles. L'outil ne peut pas analyser ce qu'il ne peut pas telecharger.",
  },
];

const privacyPoints = [
  "La video est telechargee temporairement pour l'analyse puis supprimee",
  "Aucun stockage des URLs ou rapports apres traitement",
  "Aucune donnee vendue ou partagee avec des tiers",
];

export default function TransparencePage() {
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
          style={{ paddingBottom: "36px", paddingTop: "32px" }}
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
              Transparence
            </span>
          </div>

          <h1
            style={{
              margin: "0 0 14px",
              fontSize: "clamp(1.8rem, 6vw, 3.2rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.06em",
              color: "var(--text-primary)",
            }}
          >
            Ce qu&apos;Attentiq fait — et ce qu&apos;il ne fait pas
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
            Nous preferons etre clairs sur les limites de cet outil plutot que
            de vous promettre des resultats que nous ne pouvons pas garantir.
          </p>
        </section>

        {/* Content blocks */}
        <div style={{ display: "grid", gap: "12px" }}>
          {/* Ce que l'outil fait bien */}
          <section
            className="rise d2"
            style={{
              borderRadius: "22px",
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.03)",
              padding: "22px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(0, 212, 255, 0.08)",
                  border: "1px solid rgba(0, 212, 255, 0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "var(--accent)",
                }}
              >
                01
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                }}
              >
                Ce que l&apos;outil fait bien
              </h2>
            </div>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: "14px",
                lineHeight: 1.75,
                color: "var(--text-secondary)",
              }}
            >
              Attentiq est utile quand vous cherchez a comprendre comment une
              video perd l&apos;attention sur le plan structurel. Il lit la
              video comme un assemblage de signaux — pas comme une promesse de
              resultats.
            </p>
            <div style={{ display: "grid", gap: "10px" }}>
              {strengths.map((item) => (
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
          </section>

          {/* Ce que l'outil ne peut pas garantir */}
          <section
            className="rise d3"
            style={{
              borderRadius: "22px",
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.03)",
              padding: "22px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(0, 212, 255, 0.08)",
                  border: "1px solid rgba(0, 212, 255, 0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "var(--accent)",
                }}
              >
                02
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                }}
              >
                Ce que l&apos;outil ne peut pas garantir
              </h2>
            </div>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: "14px",
                lineHeight: 1.75,
                color: "var(--text-secondary)",
              }}
            >
              Cet outil n&apos;est pas branche sur une verite cachee des
              plateformes. Il donne une lecture serieuse, mais bornee.
            </p>
            <div style={{ display: "grid", gap: "10px" }}>
              {limits.map((item) => (
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
          </section>

          {/* Cas limites */}
          <section
            className="rise d4"
            style={{
              borderRadius: "22px",
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.03)",
              padding: "22px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(0, 212, 255, 0.08)",
                  border: "1px solid rgba(0, 212, 255, 0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "var(--accent)",
                }}
              >
                03
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                }}
              >
                Cas ou le diagnostic est moins pertinent
              </h2>
            </div>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: "14px",
                lineHeight: 1.75,
                color: "var(--text-secondary)",
              }}
            >
              Il existe des contextes ou la lecture reste possible mais perd en
              finesse. Mieux vaut le savoir a l&apos;avance.
            </p>
            <div
              style={{
                display: "grid",
                gap: "10px",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              {edgeCases.map((ec) => (
                <div
                  key={ec.title}
                  style={{
                    borderRadius: "18px",
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.03)",
                    padding: "16px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: "14px",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                    }}
                  >
                    {ec.title}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      lineHeight: 1.7,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {ec.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Confidentialite */}
          <section
            className="rise d5"
            style={{
              borderRadius: "22px",
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.03)",
              padding: "22px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(0, 212, 255, 0.08)",
                  border: "1px solid rgba(0, 212, 255, 0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "var(--accent)",
                }}
              >
                04
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                }}
              >
                Confidentialite des donnees
              </h2>
            </div>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: "14px",
                lineHeight: 1.75,
                color: "var(--text-secondary)",
              }}
            >
              La confiance ne repose pas seulement sur le ton. Elle repose sur
              ce que nous faisons — et ne faisons pas — avec vos donnees.
            </p>
            <div style={{ display: "grid", gap: "10px" }}>
              {privacyPoints.map((item) => (
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
          </section>

          {/* CTA */}
          <div
            className="rise d6"
            style={{
              borderRadius: "28px",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              background:
                "linear-gradient(160deg, rgba(0, 212, 255, 0.08) 0%, rgba(12, 17, 23, 0.98) 60%)",
              padding: "36px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontWeight: 800,
                color: "var(--accent)",
              }}
            >
              Pret ?
            </p>
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: "clamp(1.3rem, 4vw, 2rem)",
                lineHeight: 1,
                letterSpacing: "-0.05em",
                color: "var(--text-primary)",
              }}
            >
              Si le diagnostic vous aide, il doit aussi pouvoir dire ce
              qu&apos;il ne sait pas faire.
            </h2>
            <p
              style={{
                margin: "0 0 22px",
                fontSize: "14px",
                lineHeight: 1.8,
                color: "rgba(237, 242, 247, 0.8)",
              }}
            >
              Vous savez maintenant exactement ce que vous obtenez — et ce que
              vous n&apos;obtenez pas.
            </p>
            <Link
              href="/analyze"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "13px 24px",
                borderRadius: "999px",
                textDecoration: "none",
                background: "linear-gradient(135deg, var(--accent), #79e7ff)",
                color: "#041017",
                fontSize: "14px",
                fontWeight: 900,
                boxShadow: "0 18px 52px rgba(0, 212, 255, 0.18)",
              }}
            >
              Analyser une video
            </Link>
          </div>
        </div>

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
            Attentiq — Analyse d&apos;attention multi-formats
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
