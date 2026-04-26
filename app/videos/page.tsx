import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Analyse vidéo — YouTube Shorts, Reels, TikTok | Attentiq",
  description:
    "Analysez la rétention de vos vidéos courtes : YouTube Shorts, Instagram Reels, TikTok. 1 test gratuit, puis abonnement.",
};

const platforms = [
  {
    number: "01",
    title: "YouTube Shorts",
    description:
      "Collez l'URL d'un Short public. L'IA analyse chaque seconde pour identifier les moments de décrochage et vous donner des actions concrètes.",
  },
  {
    number: "02",
    title: "Instagram Reels",
    description:
      "Analysez vos Reels ou ceux de vos concurrents. Comprenez pourquoi certains formats retiennent mieux l'attention que d'autres.",
  },
  {
    number: "03",
    title: "TikTok",
    description:
      "Diagnostic complet de vos TikToks : score de rétention, timestamps de chute, causes identifiées et recommandations actionnables.",
  },
];

const included = [
  "Score de rétention global (1 à 10)",
  "Timestamps exacts des chutes d'attention",
  "Cause de chaque décrochage (visuel ou verbal)",
  "Perception des spectateurs sur votre contenu",
  "3 à 5 actions concrètes pour vos prochaines vidéos",
];

export default function VideosPage() {
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
              Analyse vidéo
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
            Comprenez pourquoi vos vidéos perdent l&apos;attention
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
            YouTube Shorts, Instagram Reels, TikTok — l&apos;IA analyse chaque
            seconde de votre vidéo et vous donne un diagnostic actionnable en
            90 secondes.
          </p>
        </section>

        {/* Platforms */}
        <section className="rise d2" style={{ marginBottom: "40px" }}>
          <div style={{ display: "grid", gap: "12px" }}>
            {platforms.map((platform) => (
              <div
                key={platform.number}
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
                  {platform.number}
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
                    {platform.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: 1.75,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {platform.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ce que le rapport contient */}
        <section className="rise d3" style={{ marginBottom: "40px" }}>
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
              {included.map((item) => (
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
        <section className="rise d4" style={{ marginBottom: "40px" }}>
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
              Tarif
            </p>
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: "clamp(1.5rem, 5vw, 2.4rem)",
                lineHeight: 0.98,
                letterSpacing: "-0.06em",
                color: "var(--text-primary)",
              }}
            >
              1 test gratuit, puis abonnement
            </h2>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: "15px",
                lineHeight: 1.8,
                color: "rgba(237, 242, 247, 0.8)",
              }}
            >
              Essayez gratuitement sur une vidéo de votre choix. Si le
              diagnostic vous aide, continuez avec un abonnement pour analyser
              autant de vidéos que vous le souhaitez.
            </p>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "13px",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              1 test gratuit, puis abonnement obligatoire
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
              Analyser une vidéo
            </Link>
            <p
              style={{
                margin: "14px 0 0",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              Aucune carte requise pour le premier test.
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
