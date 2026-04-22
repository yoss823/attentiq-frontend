import type { Metadata } from "next";
import Link from "next/link";
import { ATTENTIQ_OFFERS } from "@/lib/offer-config";

export const metadata: Metadata = {
  title: "Attentiq — Diagnostic d'attention TikTok",
  description:
    "Attentiq n'est pas un dashboard analytics. C'est un diagnostic d'attention qui montre ou la video fait decrocher, pourquoi, et quoi corriger.",
};

const differentiation = [
  {
    title: "Ce que TikTok vous donne",
    points: [
      "Vues, watch time, retention moyenne",
      "Aucun moment exact de rupture",
      "Aucune cause exploitable pour la prochaine video",
    ],
  },
  {
    title: "Ce qu'Attentiq ajoute",
    points: [
      "Les secondes ou l'attention casse",
      "Une lecture structurelle des ruptures",
      "Des actions concretes pour la prochaine version",
    ],
  },
];

const anonymizedPreview = {
  label: "Apercu anonymise",
  author: "@compte-creator",
  title: "Routine matinale express en 28 secondes",
  score: "6.4/10",
  summary:
    "La promesse est comprise, mais l'entree manque de tension et la transition centrale casse l'envie de rester.",
  drops: [
    {
      time: "0:03",
      title: "Promesse trop tardive",
      copy: "Le hook visuel arrive avant la phrase qui donne une raison de rester.",
    },
    {
      time: "0:11",
      title: "Changement de plan mou",
      copy: "La transition enlève du rythme sans ajouter d'information nouvelle.",
    },
    {
      time: "0:19",
      title: "Sortie sans relance",
      copy: "La fin confirme le geste, mais ne relance pas la boucle d'attention.",
    },
  ],
  actions: [
    "Dire la promesse avant le premier geste.",
    "Raccourcir la transition du milieu de 2 secondes.",
  ],
};

const faq = [
  {
    question: "Ce n'est pas un dashboard ?",
    answer:
      "Non. Attentiq ne remplace pas vos analytics. Il interprete une video precise comme un diagnostic d'attention.",
  },
  {
    question: "Qu'est-ce que je reçois gratuitement ?",
    answer:
      "Un teaser volontairement limite: un resume, jusqu'a 3 chutes et un apercu d'actions.",
  },
  {
    question: "Quel format est accepte en Sprint 1 ?",
    answer: "Uniquement une URL TikTok publique pointant vers une video.",
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.16), transparent 26%), radial-gradient(circle at 82% 16%, rgba(251, 146, 60, 0.1), transparent 20%), var(--bg-base)",
        color: "var(--text-primary)",
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
          backgroundSize: "56px 56px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.18) 56%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "24px 16px 80px",
        }}
      >
        <nav
          className="rise"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "14px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0, 212, 255, 0.1)",
                border: "1px solid rgba(0, 212, 255, 0.18)",
                color: "var(--accent)",
                fontWeight: 900,
                letterSpacing: "0.12em",
                fontSize: "14px",
              }}
            >
              AT
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                Attentiq
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                }}
              >
                Diagnostic d&apos;attention TikTok
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/guide"
              style={{
                padding: "10px 14px",
                borderRadius: "999px",
                textDecoration: "none",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              Comment ca marche
            </Link>
            <Link
              href="/analyze"
              style={{
                padding: "10px 16px",
                borderRadius: "999px",
                textDecoration: "none",
                background: "linear-gradient(135deg, var(--accent), #79e7ff)",
                color: "#041017",
                fontSize: "14px",
                fontWeight: 900,
              }}
            >
              Lancer un diagnostic
            </Link>
          </div>
        </nav>

        <section
          style={{
            display: "grid",
            gap: "28px",
            alignItems: "end",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            paddingTop: "48px",
            paddingBottom: "64px",
          }}
        >
          <div className="rise d1">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "999px",
                border: "1px solid rgba(0, 212, 255, 0.18)",
                background: "rgba(0, 212, 255, 0.07)",
                color: "var(--accent)",
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
              }}
            >
              Diagnostic d&apos;attention
            </div>

            <h1
              style={{
                margin: "18px 0 0",
                maxWidth: "11ch",
                fontSize: "clamp(3rem, 9vw, 5.8rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.09em",
              }}
            >
              Sachez ou votre video fait decrocher.
            </h1>

            <p
              style={{
                margin: "20px 0 0",
                maxWidth: "38rem",
                fontSize: "18px",
                lineHeight: 1.8,
                color: "rgba(237, 242, 247, 0.78)",
              }}
            >
              Attentiq n&apos;est pas un dashboard analytics. C&apos;est un diagnostic
              d&apos;attention: il montre les points de rupture d&apos;une video TikTok,
              les causes probables, puis ce qu&apos;il faut changer.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
                marginTop: "28px",
              }}
            >
              <Link
                href="/analyze"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "54px",
                  padding: "0 22px",
                  borderRadius: "999px",
                  textDecoration: "none",
                  background: "linear-gradient(135deg, var(--accent), #79e7ff)",
                  color: "#041017",
                  fontSize: "15px",
                  fontWeight: 900,
                  boxShadow: "0 18px 52px rgba(0, 212, 255, 0.2)",
                }}
              >
                Analyser une URL TikTok
              </Link>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                }}
              >
                Gratuit pour voir le teaser. Pas de compte.
              </p>
            </div>
          </div>

          <section
            className="rise d2"
            style={{
              borderRadius: "30px",
              border: "1px solid rgba(0, 212, 255, 0.18)",
              background:
                "linear-gradient(180deg, rgba(11, 16, 22, 0.98) 0%, rgba(7, 11, 16, 0.94) 100%)",
              padding: "22px",
              boxShadow: "0 32px 120px rgba(0, 0, 0, 0.32)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "18px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 800,
                    color: "var(--text-secondary)",
                  }}
                >
                  Teaser gratuit
                </p>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "17px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                  }}
                >
                  Vous voyez vite si le diagnostic vaut le coup.
                </p>
              </div>
              <div
                style={{
                  alignSelf: "start",
                  padding: "8px 12px",
                  borderRadius: "18px",
                  border: "1px solid rgba(52, 211, 153, 0.22)",
                  background: "rgba(52, 211, 153, 0.08)",
                  color: "#86efac",
                  fontSize: "12px",
                  fontWeight: 800,
                }}
              >
                2 min max pour decider
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              {[
                "Resume global",
                "2 a 3 chutes visibles",
                "Apercu d'actions",
                "Paywall clair pour le complet",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "14px",
                    borderRadius: "18px",
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.03)",
                    fontSize: "13px",
                    color: "rgba(237, 242, 247, 0.84)",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </section>

        <section style={{ paddingBottom: "56px" }}>
          <div
            style={{
              display: "grid",
              gap: "16px",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            {differentiation.map((block, index) => (
              <article
                key={block.title}
                className={`rise d${index + 2}`}
                style={{
                  borderRadius: "24px",
                  border: "1px solid var(--border)",
                  background:
                    index === 1
                      ? "linear-gradient(180deg, rgba(0, 212, 255, 0.08) 0%, rgba(11, 15, 20, 0.96) 100%)"
                      : "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(8, 12, 18, 0.96) 100%)",
                  padding: "22px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 800,
                    color: index === 1 ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  {block.title}
                </p>
                <div
                  style={{
                    marginTop: "16px",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  {block.points.map((point) => (
                    <div
                      key={point}
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start",
                        fontSize: "14px",
                        lineHeight: 1.7,
                        color: "rgba(237, 242, 247, 0.84)",
                      }}
                    >
                      <span style={{ color: index === 1 ? "var(--accent)" : "#fb923c" }}>
                        {index === 1 ? "✓" : "•"}
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={{ paddingBottom: "64px" }}>
          <div
            className="rise d3"
            style={{
              display: "grid",
              gap: "22px",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              borderRadius: "32px",
              border: "1px solid var(--border)",
              background:
                "linear-gradient(180deg, rgba(12, 17, 23, 0.95) 0%, rgba(7, 11, 16, 0.98) 100%)",
              padding: "24px",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  fontWeight: 800,
                  color: "var(--accent)",
                }}
              >
                {anonymizedPreview.label}
              </p>
              <h2
                style={{
                  margin: "12px 0 0",
                  fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
                  lineHeight: 0.96,
                  letterSpacing: "-0.07em",
                }}
              >
                Un diagnostic qui se lit comme une decision.
              </h2>
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: "15px",
                  lineHeight: 1.8,
                  color: "var(--text-secondary)",
                  maxWidth: "36rem",
                }}
              >
                Le gratuit vous laisse voir le niveau du probleme. Le complet
                transforme ca en plan de correction.
              </p>
            </div>

            <div
              style={{
                borderRadius: "24px",
                border: "1px solid rgba(0, 212, 255, 0.18)",
                background:
                  "linear-gradient(180deg, rgba(0, 212, 255, 0.08) 0%, rgba(9, 13, 18, 0.96) 100%)",
                padding: "18px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                }}
              >
                {anonymizedPreview.author} · {anonymizedPreview.title}
              </p>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "44px",
                      lineHeight: 0.9,
                      letterSpacing: "-0.08em",
                      fontWeight: 800,
                    }}
                  >
                    {anonymizedPreview.score}
                  </p>
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Apercu gratuit
                  </p>
                </div>
                <div
                  style={{
                    padding: "8px 10px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: "12px",
                    color: "rgba(237, 242, 247, 0.78)",
                  }}
                >
                  max 3 chutes visibles
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: "14px",
                gridColumn: "1 / -1",
              }}
            >
              <div
                style={{
                  padding: "18px",
                  borderRadius: "22px",
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 800,
                    color: "var(--text-secondary)",
                  }}
                >
                  Resume gratuit
                </p>
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: "15px",
                    lineHeight: 1.8,
                    color: "rgba(237, 242, 247, 0.88)",
                  }}
                >
                  {anonymizedPreview.summary}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                }}
              >
                <div
                  style={{
                    padding: "18px",
                    borderRadius: "22px",
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      fontWeight: 800,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Chutes visibles
                  </p>
                  <div style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
                    {anonymizedPreview.drops.map((drop) => (
                      <div
                        key={drop.time}
                        style={{
                          padding: "14px",
                          borderRadius: "18px",
                          border: "1px solid rgba(248, 113, 113, 0.16)",
                          background: "rgba(248, 113, 113, 0.06)",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            fontWeight: 800,
                            color: "#fca5a5",
                          }}
                        >
                          {drop.time} · {drop.title}
                        </p>
                        <p
                          style={{
                            margin: "8px 0 0",
                            fontSize: "13px",
                            lineHeight: 1.7,
                            color: "rgba(237, 242, 247, 0.82)",
                          }}
                        >
                          {drop.copy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    padding: "18px",
                    borderRadius: "22px",
                    border: "1px solid rgba(0, 212, 255, 0.18)",
                    background:
                      "linear-gradient(180deg, rgba(0, 212, 255, 0.08) 0%, rgba(9, 13, 18, 0.96) 100%)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      fontWeight: 800,
                      color: "var(--accent)",
                    }}
                  >
                    Deblocage complet
                  </p>
                  <div style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
                    {[
                      ...anonymizedPreview.actions,
                      "Ordre de priorite des corrections",
                      "Sections verrouillees de type lecture structurelle",
                    ].map((item, index) => (
                      <div
                        key={item}
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                          padding: "12px 14px",
                          borderRadius: "18px",
                          border: "1px solid rgba(0, 212, 255, 0.16)",
                          background:
                            index < 2 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)",
                          color:
                            index < 2
                              ? "rgba(237, 242, 247, 0.84)"
                              : "rgba(237, 242, 247, 0.46)",
                          filter: index < 2 ? "none" : "blur(1.8px)",
                          fontSize: "13px",
                        }}
                      >
                        <span style={{ color: "var(--accent)" }}>
                          {index < 2 ? "✓" : "🔒"}
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ paddingBottom: "64px" }}>
          <p
            className="rise d4"
            style={{
              margin: 0,
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontWeight: 800,
              color: "var(--accent)",
            }}
          >
            Offres Sprint 1
          </p>
          <h2
            className="rise d4"
            style={{
              margin: "14px 0 0",
              fontSize: "clamp(2rem, 6vw, 3.2rem)",
              lineHeight: 0.96,
              letterSpacing: "-0.07em",
            }}
          >
            Trois offres. Trois decisions nettes.
          </h2>

          <div
            style={{
              marginTop: "22px",
              display: "grid",
              gap: "16px",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {ATTENTIQ_OFFERS.map((offer, index) => (
              <article
                key={offer.slug}
                className={`rise d${Math.min(index + 4, 7)}`}
                style={{
                  position: "relative",
                  borderRadius: "28px",
                  border: offer.featured
                    ? "1px solid rgba(0, 212, 255, 0.26)"
                    : "1px solid var(--border)",
                  background: offer.featured
                    ? "linear-gradient(180deg, rgba(0, 212, 255, 0.12) 0%, rgba(10, 14, 20, 0.98) 100%)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(8, 12, 18, 0.98) 100%)",
                  padding: "22px",
                  boxShadow: offer.featured
                    ? "0 28px 90px rgba(0, 212, 255, 0.12)"
                    : "none",
                }}
              >
                {offer.featured && (
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      padding: "7px 10px",
                      borderRadius: "999px",
                      background: "rgba(0, 212, 255, 0.12)",
                      border: "1px solid rgba(0, 212, 255, 0.2)",
                      color: "var(--accent)",
                      fontSize: "10px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                    }}
                  >
                    Le plus simple
                  </div>
                )}

                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 800,
                    color: offer.featured ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  {offer.shortLabel}
                </p>
                <h3
                  style={{
                    margin: "12px 0 0",
                    fontSize: "28px",
                    lineHeight: 1,
                    letterSpacing: "-0.06em",
                  }}
                >
                  {offer.priceLabel}
                  {offer.cadenceLabel && (
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                        marginLeft: "4px",
                      }}
                    >
                      {offer.cadenceLabel}
                    </span>
                  )}
                </h3>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "14px",
                    color: "rgba(237, 242, 247, 0.86)",
                  }}
                >
                  {offer.name}
                </p>
                <p
                  style={{
                    margin: "14px 0 0",
                    fontSize: "14px",
                    lineHeight: 1.75,
                    color: "var(--text-secondary)",
                  }}
                >
                  {offer.summary}
                </p>

                <div style={{ marginTop: "18px", display: "grid", gap: "10px" }}>
                  {offer.featureList.map((item) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start",
                        fontSize: "13px",
                        color: "rgba(237, 242, 247, 0.84)",
                      }}
                    >
                      <span style={{ color: "var(--accent)" }}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <p
                  style={{
                    margin: "18px 0 0",
                    fontSize: "13px",
                    lineHeight: 1.7,
                    color: "var(--text-muted)",
                  }}
                >
                  {offer.audience}
                </p>

                <Link
                  href={offer.checkoutPath}
                  style={{
                    marginTop: "18px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    minHeight: "50px",
                    borderRadius: "999px",
                    textDecoration: "none",
                    background: offer.featured
                      ? "linear-gradient(135deg, var(--accent), #79e7ff)"
                      : "rgba(255,255,255,0.06)",
                    border: offer.featured ? "none" : "1px solid var(--border)",
                    color: offer.featured ? "#041017" : "var(--text-primary)",
                    fontSize: "14px",
                    fontWeight: 900,
                  }}
                >
                  {offer.ctaLabel}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {faq.map((item) => (
            <article
              key={item.question}
              className="rise d5"
              style={{
                borderRadius: "22px",
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.03)",
                padding: "18px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  lineHeight: 1.4,
                  letterSpacing: "-0.03em",
                }}
              >
                {item.question}
              </h3>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "14px",
                  lineHeight: 1.75,
                  color: "var(--text-secondary)",
                }}
              >
                {item.answer}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
