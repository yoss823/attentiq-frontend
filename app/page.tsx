import type { Metadata } from "next";
import Link from "next/link";
import {
  ATTENTIQ_OFFERS,
  formatEuroCents,
  getLaunchListPriceCents,
  LAUNCH_DISCOUNT_PERCENT,
} from "@/lib/offer-config";

export const metadata: Metadata = {
  title: "Attentiq — Analyse d'attention multi-formats",
  description:
    "Attentiq montre vite où l'attention chute sur vos vidéos, images et textes, puis quoi corriger en priorité.",
};

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.14), transparent 28%), radial-gradient(circle at 82% 16%, rgba(251, 146, 60, 0.08), transparent 18%), var(--bg-base)",
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
              href="/videos"
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
              Analyse d&apos;attention au regard humain
            </span>
          </div>

          <h1
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(2.4rem, 8vw, 4.8rem)",
              lineHeight: 0.94,
              letterSpacing: "-0.07em",
              color: "var(--text-primary)",
              maxWidth: "min(14ch, 100%)",
            }}
          >
            Trouvez où l&apos;attention décroche et captez-la de nouveau.
          </h1>

          <p
            style={{
              margin: "0 0 28px",
              fontSize: "clamp(1rem, 2.8vw, 1.0625rem)",
              lineHeight: 1.65,
              color: "rgba(237, 242, 247, 0.8)",
              maxWidth: "44rem",
            }}
          >
            Analysez vos vidéos, textes et visuels pour localiser les chutes
            d&apos;attention, comprendre la cause et agir dans le bon ordre.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/videos"
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
              Analyser une vidéo →
            </Link>
            <Link
              href="/text"
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
              Analyser un texte
            </Link>
            <Link
              href="/images"
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
              Analyser une image
            </Link>
          </div>
        </section>

        <section className="rise d2" style={{ marginBottom: "42px" }}>
          <div
            style={{
              borderRadius: "26px",
              border: "1px solid rgba(0, 212, 255, 0.18)",
              background:
                "linear-gradient(180deg, rgba(11, 16, 22, 0.98) 0%, rgba(7, 11, 16, 0.96) 100%)",
              padding: "18px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "12px",
              }}
            >
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
                Aperçu rapport
              </p>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  border: "1px solid rgba(0, 212, 255, 0.22)",
                  background: "rgba(0, 212, 255, 0.08)",
                  color: "rgba(186, 230, 253, 0.9)",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                Gratuit : 2 signaux visibles
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "116px minmax(0, 1fr)",
                alignItems: "stretch",
              }}
            >
              <div
                style={{
                  borderRadius: "18px",
                  border: "1px solid rgba(251, 146, 60, 0.28)",
                  background: "rgba(251, 146, 60, 0.08)",
                  padding: "12px",
                  display: "grid",
                  alignContent: "start",
                  gap: "6px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    fontWeight: 800,
                    color: "rgba(253, 186, 116, 0.9)",
                  }}
                >
                  Score visible
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "34px",
                    lineHeight: 0.9,
                    letterSpacing: "-0.08em",
                    fontWeight: 900,
                    color: "#fb923c",
                  }}
                >
                  4.2
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "rgba(237, 242, 247, 0.45)",
                      marginLeft: "2px",
                    }}
                  >
                    /10
                  </span>
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    lineHeight: 1.5,
                    color: "rgba(253, 186, 116, 0.94)",
                    fontWeight: 700,
                  }}
                >
                  Base à renforcer
                </p>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                {[
                  {
                    t: "00:10",
                    cause: "Promesse encore floue, bénéfice non lisible.",
                    tone: "rgba(248, 113, 113, 0.16)",
                    border: "rgba(248, 113, 113, 0.26)",
                  },
                  {
                    t: "00:20",
                    cause: "Rythme qui baisse, pas de nouvel élément.",
                    tone: "rgba(251, 146, 60, 0.14)",
                    border: "rgba(251, 146, 60, 0.24)",
                  },
                ].map((row) => (
                  <div
                    key={row.t}
                    style={{
                      borderRadius: "14px",
                      border: `1px solid ${row.border}`,
                      background: row.tone,
                      padding: "10px 12px",
                      display: "grid",
                      gap: "4px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.12em",
                        color: "rgba(237, 242, 247, 0.82)",
                      }}
                    >
                      CHUTE À {row.t}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        lineHeight: 1.55,
                        color: "rgba(237, 242, 247, 0.9)",
                      }}
                    >
                      {row.cause}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: "10px",
                display: "grid",
                gap: "8px",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              }}
            >
              {["Timeline complète", "Causes détaillées", "Plan d'action priorisé"].map(
                (item) => (
                  <div
                    key={item}
                    style={{
                      borderRadius: "12px",
                      border: "1px dashed rgba(0, 212, 255, 0.24)",
                      background:
                        "linear-gradient(180deg, rgba(0, 212, 255, 0.08) 0%, rgba(3, 8, 14, 0.4) 100%)",
                      padding: "9px 10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "rgba(186, 230, 253, 0.88)",
                    }}
                  >
                    {item} · débloqué dans le complet
                  </div>
                )
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: "14px",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {[
              {
                href: "/videos",
                title: "Vidéos",
                text: "TikTok, Reels et YouTube Shorts.",
              },
              {
                href: "/images",
                title: "Images",
                text: "Photos, carrousels et visuels pour le social.",
              },
              {
                href: "/text",
                title: "Textes",
                text: "Publications, bios, sondages, scripts…",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: "none",
                  borderRadius: "22px",
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.03)",
                  padding: "18px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-primary)",
                    fontSize: "18px",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {item.title}
                </p>
                <p
                  style={{
                    margin: "8px 0 0",
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                    lineHeight: 1.7,
                  }}
                >
                  {item.text}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Teaser gratuit */}
        <section
          className="rise d3"
          style={{ marginBottom: "56px" }}
        >
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
              Teaser gratuit
            </p>
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: "clamp(1.4rem, 4vw, 2rem)",
                lineHeight: 1,
                letterSpacing: "-0.05em",
                color: "var(--text-primary)",
              }}
            >
              Vous voyez vite la valeur
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                lineHeight: 1.75,
                color: "rgba(237, 242, 247, 0.8)",
                maxWidth: "42rem",
              }}
            >
              <strong style={{ color: "rgba(237, 242, 247, 0.95)" }}>
                1 analyse gratuite par format
              </strong>{" "}
              : aperçu précis, sans carte bancaire. Le complet donne timeline,
              causes et plan d&apos;action.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section className="rise d4" style={{ marginBottom: "56px" }}>
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
            {[
              ...ATTENTIQ_OFFERS.map((offer) => (
                <article
                  key={offer.slug}
                  style={{
                    borderRadius: "24px",
                    border: offer.featured
                      ? "1px solid rgba(0, 212, 255, 0.24)"
                      : "1px solid var(--border)",
                    background: offer.featured
                      ? "linear-gradient(180deg, rgba(0, 212, 255, 0.1) 0%, rgba(10, 14, 20, 0.96) 100%)"
                      : "rgba(255,255,255,0.03)",
                    padding: "22px 18px",
                    position: "relative",
                  }}
                >
                  {offer.featured && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-12px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        padding: "5px 12px",
                        borderRadius: "999px",
                        background: "linear-gradient(135deg, var(--accent), #79e7ff)",
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
                      color: offer.featured ? "var(--accent)" : "var(--text-secondary)",
                    }}
                  >
                    {offer.kicker}
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
                    Offre de lancement -{LAUNCH_DISCOUNT_PERCENT}%
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
                      {formatEuroCents(getLaunchListPriceCents(offer.priceCents))}
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
                      {formatEuroCents(offer.priceCents)}
                    </span>
                    {offer.cadenceLabel && (
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {offer.cadenceLabel}
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
                    {offer.summary}
                  </p>

                  <div style={{ marginBottom: "16px", display: "grid", gap: "8px" }}>
                    {offer.featureList.map((f) => (
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
                    href={offer.checkoutPath}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "13px 18px",
                      borderRadius: "999px",
                      textDecoration: "none",
                      background: offer.featured
                        ? "linear-gradient(135deg, var(--accent), #79e7ff)"
                        : "rgba(255,255,255,0.06)",
                      border: offer.featured ? "none" : "1px solid rgba(255,255,255,0.1)",
                      color: offer.featured ? "#041017" : "var(--text-primary)",
                      fontSize: "14px",
                      fontWeight: 900,
                      boxShadow: offer.featured
                        ? "0 18px 52px rgba(0, 212, 255, 0.18)"
                        : "none",
                    }}
                  >
                    {offer.ctaLabel}
                  </Link>
                </article>
              )),
              <article
                key="enterprise"
                style={{
                  borderRadius: "24px",
                  border: "1px solid rgba(192, 132, 252, 0.24)",
                  background:
                    "linear-gradient(180deg, rgba(192, 132, 252, 0.12) 0%, rgba(10, 14, 20, 0.96) 100%)",
                  padding: "22px 18px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "5px 12px",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, #c084fc, #e879f9)",
                    color: "#190a22",
                    fontSize: "10px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Entreprises
                </div>

                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 800,
                    color: "#e879f9",
                  }}
                >
                  Pour les équipes marketing et médias
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
                      fontSize: "34px",
                      lineHeight: 0.95,
                      letterSpacing: "-0.08em",
                      fontWeight: 900,
                      color: "var(--text-primary)",
                    }}
                  >
                    Sur devis
                  </span>
                </div>

                <p
                  style={{
                    margin: "0 0 16px",
                    fontSize: "14px",
                    lineHeight: 1.7,
                    color: "var(--text-secondary)",
                  }}
                >
                  Analyse de sites web, pages LinkedIn, plaquettes commerciales,
                  visuels et contenus éditoriaux pour renforcer la captation
                  d&apos;attention sur tous vos supports.
                </p>

                <div style={{ marginBottom: "16px", display: "grid", gap: "8px" }}>
                  {[
                    "Audit attention multi-supports (web, LinkedIn, sales)",
                    "Priorisation des frictions + plan d'exécution",
                    "Accompagnement équipe + cadrage KPI",
                  ].map((f) => (
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
                  href="/entreprise"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "13px 18px",
                    borderRadius: "999px",
                    textDecoration: "none",
                    background: "linear-gradient(135deg, #c084fc, #e879f9)",
                    border: "none",
                    color: "#190a22",
                    fontSize: "14px",
                    fontWeight: 900,
                    boxShadow: "0 18px 52px rgba(192, 132, 252, 0.24)",
                  }}
                >
                  Demander un devis
                </Link>
              </article>,
            ]}
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
              Prêt à comprendre ce qui fait décrocher ?
            </h2>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "15px",
                lineHeight: 1.8,
                color: "rgba(237, 242, 247, 0.8)",
              }}
            >
              Choisissez un format. Obtenez vos premiers signaux en quelques
              secondes.
            </p>
            <Link
              href="/videos"
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
              Commencer par les vidéos
            </Link>
            <p
              style={{
                margin: "14px 0 0",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              Aucune création de compte requise.
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
              { href: "/guide?format=video", label: "Comment ça marche" },
              { href: "/transparence", label: "Transparence" },
              { href: "/videos", label: "Vidéos" },
              { href: "/images", label: "Images" },
              { href: "/text", label: "Textes" },
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
