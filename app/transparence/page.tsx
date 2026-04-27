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

type FormatCompareColumn = {
  title: string;
  href: string;
  observe: string[];
  notSeen: string[];
};

const FORMAT_COMPARE_COLUMNS: FormatCompareColumn[] = [
  {
    title: "Vidéo",
    href: "/videos",
    observe: [
      "Rythme, accroche, ruptures d'attention sur la timeline",
      "Repères temporels quand le signal le permet",
    ],
    notSeen: [
      "Vos courbes de rétention analytics",
      "Pourquoi le feed vous classe ou non",
    ],
  },
  {
    title: "Texte",
    href: "/text",
    observe: [
      "Promesse, clarté, preuve, appel à l'action",
      "Passages lourds ou ambigus avant la fin",
    ],
    notSeen: [
      "Le ton exact de chaque lecteur",
      "La performance SEO ou les stats d'engagement",
    ],
  },
  {
    title: "Image",
    href: "/images",
    observe: [
      "Hiérarchie visuelle, lisibilité, intention du message",
      "Friction sur le regard (surcharge, CTA peu visible)",
    ],
    notSeen: [
      "Les tests utilisateurs en conditions réelles",
      "Le rendu sur tous les écrans et réglages d'accessibilité",
    ],
  },
];

const TRANSPARENCE_FAQ = [
  {
    q: "Attentiq remplace un coach ou un monteur ?",
    a: "Non : il structure un diagnostic à partir du contenu que vous fournissez. La décision et la création restent à vous.",
  },
  {
    q: "Pourquoi trois formats différents ?",
    a: "Parce que l'attention ne se lit pas pareil sur une timeline vidéo, un texte linéaire ou une image figée — mais la logique (signaux → risques → actions) est la même.",
  },
  {
    q: "L'aperçu gratuit montre quoi exactement ?",
    a: "Un extrait utile pour décider : 1 analyse gratuite par format (video, texte, image), avec un aperçu court (souvent 1 a 2 signaux). Le complet détaille la timeline ou l'équivalent sur texte et image.",
  },
  {
    q: "Mes données servent à entraîner des modèles ?",
    a: "Non : vos contenus d'analyse ne sont pas revendus et ne sont pas utilisés pour du ciblage publicitaire. Des cookies techniques peuvent limiter l'abus d'essai.",
  },
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
            Une promesse simple : vous aider a comprendre vite ce qui fait
            decrocher l&apos;attention, puis quoi corriger. Cette page precise
            clairement ce que l&apos;outil couvre — et ce qu&apos;il ne pretend pas faire.
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
                Ce que l&apos;outil ne promet pas
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
              Pas de baguette magique : Attentiq lit votre contenu pour vous aider
              a decider mieux, plus vite, avec des bornes explicites.
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

          {/* Comparatif formats (compact) */}
          <section
            className="rise"
            style={{
              borderRadius: "22px",
              border: "1px solid rgba(0, 212, 255, 0.14)",
              background:
                "linear-gradient(180deg, rgba(0, 212, 255, 0.06) 0%, rgba(255,255,255,0.02) 100%)",
              padding: "22px 18px",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              En un coup d&apos;œil
            </p>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "17px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              Vidéo · Texte · Image : même logique, signaux différents
            </h2>
            <p
              style={{
                margin: "0 0 18px",
                fontSize: "13px",
                lineHeight: 1.65,
                color: "var(--text-secondary)",
                maxWidth: "52rem",
              }}
            >
              Deux reperes par format pour voir tout de suite la valeur.
            </p>
            <div
              style={{
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {FORMAT_COMPARE_COLUMNS.map((col) => (
                <article
                  key={col.href}
                  style={{
                    borderRadius: "18px",
                    border: "1px solid var(--border)",
                    background: "rgba(7, 11, 16, 0.65)",
                    padding: "16px 14px",
                    display: "grid",
                    gap: "14px",
                  }}
                >
                  <Link
                    href={col.href}
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {col.title}
                    <span style={{ color: "var(--accent)", marginLeft: "6px" }}>→</span>
                  </Link>
                  <div>
                    <p
                      style={{
                        margin: "0 0 8px",
                        fontSize: "10px",
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(0, 212, 255, 0.85)",
                      }}
                    >
                      Ce qu&apos;on observe
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "18px",
                        fontSize: "13px",
                        lineHeight: 1.55,
                        color: "rgba(237, 242, 247, 0.86)",
                      }}
                    >
                      {col.observe.map((line) => (
                        <li key={line} style={{ marginBottom: "6px" }}>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: "0 0 8px",
                        fontSize: "10px",
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(248, 113, 113, 0.9)",
                      }}
                    >
                      Ce qu&apos;on ne voit pas
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "18px",
                        fontSize: "13px",
                        lineHeight: 1.55,
                        color: "rgba(237, 242, 247, 0.72)",
                      }}
                    >
                      {col.notSeen.map((line) => (
                        <li key={line} style={{ marginBottom: "6px" }}>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
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
              Selon le format, certains contextes reduisent la finesse. Le
              diagnostic reste utile, simplement plus prudent.
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

          {/* FAQ courte */}
          <section
            className="rise"
            style={{
              borderRadius: "22px",
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.03)",
              padding: "22px 18px",
            }}
          >
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: "17px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              Questions fréquentes
            </h2>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: "13px",
                lineHeight: 1.65,
                color: "var(--text-secondary)",
              }}
            >
              Reponses courtes, claires, sans jargon.
            </p>
            <div style={{ display: "grid", gap: "0" }}>
              {TRANSPARENCE_FAQ.map((item) => (
                <details
                  key={item.q}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    padding: "12px 0",
                  }}
                >
                  <summary
                    style={{
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      listStyle: "none",
                      paddingRight: "8px",
                    }}
                  >
                    {item.q}
                  </summary>
                  <p
                    style={{
                      margin: "10px 0 0",
                      fontSize: "13px",
                      lineHeight: 1.7,
                      color: "rgba(237, 242, 247, 0.78)",
                    }}
                  >
                    {item.a}
                  </p>
                </details>
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
              Un cadre clair pour mieux decider, sur video, texte et image.
            </h2>
            <p
              style={{
                margin: "0 0 22px",
                fontSize: "14px",
                lineHeight: 1.8,
                color: "rgba(237, 242, 247, 0.8)",
              }}
            >
              Choisissez un format, lancez un apercu gratuit en quelques secondes,
              puis decidez si le complet vaut le passage payant.
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
