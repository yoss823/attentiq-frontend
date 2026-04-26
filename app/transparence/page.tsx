import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ce qu'Attentiq fait — et ce qu'il ne fait pas | Attentiq",
  description:
    "Transparence sur les capacités et limites d'Attentiq pour la vidéo courte, le texte et l'image : ce que l'outil fait, ce qu'il ne garantit pas, et vos données.",
};

const FORMAT_LINKS = [
  { href: "/videos", label: "Vidéo" },
  { href: "/text", label: "Texte" },
  { href: "/images", label: "Image" },
] as const;

const strengths = [
  "Structurer ce qui aide ou freine l'attention : vidéo (rythme, accroche, ruptures), texte (promesse, clarté, preuve), image (hiérarchie, lisibilité, intention).",
  "Donner des repères précis quand le signal le permet — timestamps sur une vidéo, passages ou zones à risque sur un texte, points de friction sur un visuel.",
  "Traduire le diagnostic en actions concrètes pour votre prochaine publication, quel que soit le format.",
  "Proposer un aperçu gratuit sans compte sur les parcours publics (selon la page d'analyse).",
];

const limits = [
  "Ne prédit ni les vues, ni la viralité, ni la croissance de votre compte.",
  "Ne s'appuie pas sur les statistiques privées de vos réseaux (analytics, rétention réelle du trafic).",
  "Ne remplace pas votre jugement créatif ni la diversité du public réel.",
  "Ne décrypte pas les règles internes des algorithmes des feeds — il lit votre contenu, pas le moteur de recommandation.",
  "Les sorties sont des lectures automatisées du signal disponible : une aide à décider, pas une certitude.",
];

const edgeCases = [
  {
    title: "Vidéo très courte (< 10 s)",
    detail: "Peu de signal à analyser. Le diagnostic devient moins stable.",
  },
  {
    title: "Audio manquant (vidéo)",
    detail:
      "L'analyse reste possible, mais partielle — la dimension verbale et le rythme pèsent plus que le visuel.",
  },
  {
    title: "Contenu privé ou indisponible",
    detail:
      "URL ou fichier inaccessible : l'outil ne peut pas analyser ce qu'il ne peut pas récupérer.",
  },
  {
    title: "Texte au-delà de la limite",
    detail:
      "L'analyse porte sur un extrait ou un périmètre réduit ; la finesse peut diminuer.",
  },
  {
    title: "Image basse résolution ou surchargée",
    detail:
      "Peu de signal exploitable : repères moins stables sur le message et la hiérarchie.",
  },
];

const privacyPoints = [
  "Vos vidéos, images et textes d'analyse sont traités pour produire le diagnostic — pas revendus à des tiers.",
  "Pas d'utilisation de vos contenus pour de la publicité ciblée ou du profilage marketing.",
  "Des cookies techniques peuvent limiter l'abus d'essai gratuit ; pas de revente de données personnelles.",
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
          maxWidth: "900px",
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
            Nous préférons être clairs sur les limites de cet outil plutôt que
            de vous promettre des résultats que nous ne pouvons pas garantir —
            sur la vidéo courte, le texte ou l&apos;image.
          </p>
          <div
            style={{
              marginTop: "22px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
              }}
            >
              Formats
            </span>
            {FORMAT_LINKS.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "1px solid rgba(0, 212, 255, 0.22)",
                  background: "rgba(0, 212, 255, 0.06)",
                  color: "var(--accent)",
                  fontSize: "13px",
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                {f.label}
              </Link>
            ))}
          </div>
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
              Attentiq aide à voir <strong style={{ color: "rgba(237,242,247,0.95)" }}>où</strong> votre contenu court perd l&apos;attention — vidéo, texte ou image — à partir de signaux observables (rythme, promesse, hiérarchie…), pas à partir de promesses de performance.
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
              Pas de baguette magique : une lecture sérieuse du signal que vous lui donnez, avec des bornes claires (pas vos stats privées, pas la viralité).
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
              Selon le format, certains contextes gardent une lecture utile mais
              moins fine. Mieux vaut le savoir à l&apos;avance.
            </p>
            <div
              style={{
                display: "grid",
                gap: "10px",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
              ce que nous faisons — et ne faisons pas — avec vos données, pour
              tous les formats.
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
              Tester
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
              Un même cadre d&apos;honnêteté pour la vidéo, le texte et l&apos;image.
            </h2>
            <p
              style={{
                margin: "0 0 22px",
                fontSize: "14px",
                lineHeight: 1.8,
                color: "rgba(237, 242, 247, 0.8)",
              }}
            >
              Choisissez un format, lancez un aperçu gratuit en quelques secondes — sans carte bancaire sur les parcours publics.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
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
                Analyser une vidéo
              </Link>
              {FORMAT_LINKS.filter((f) => f.href !== "/videos").map((f) => (
                <Link
                  key={f.href}
                  href={f.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px 20px",
                    borderRadius: "999px",
                    textDecoration: "none",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    fontWeight: 800,
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  {f.label}
                </Link>
              ))}
            </div>
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
              { href: "/guide", label: "Comment ça marche" },
              { href: "/transparence", label: "Transparence" },
              { href: "/analyze", label: "Vidéo" },
              { href: "/text", label: "Texte" },
              { href: "/images", label: "Image" },
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
