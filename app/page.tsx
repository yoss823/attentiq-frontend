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
    "Attentiq lit vos vidéos, images et textes comme un spectateur pour repérer ce qui fait décrocher l'attention et quoi améliorer.",
};

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
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
              href="/guide?format=video"
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
              Analyser
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
              maxWidth: "14ch",
            }}
          >
            Comprenez pourquoi votre contenu perd l&apos;attention.
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
            Attentiq analyse vos vidéos, images et textes pour identifier ce
            qui ne fonctionne pas et vous dire quoi améliorer, concrètement.
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
              Analyser une video →
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
              display: "grid",
              gap: "14px",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {[
              {
                href: "/videos",
                title: "Videos",
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
              2 min max pour decider
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                lineHeight: 1.8,
                color: "rgba(237, 242, 247, 0.8)",
                maxWidth: "48rem",
              }}
            >
              Lancez une analyse gratuite : aperçu limité — en général{" "}
              <strong style={{ color: "rgba(237, 242, 247, 0.95)" }}>
                2 à 3 points
              </strong>{" "}
              maximum (chutes visibles, actions prioritaires, etc.) — sans carte
              bancaire. Le rapport complet se débloque en un clic si vous voulez
              aller plus loin.
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
            {ATTENTIQ_OFFERS.map((offer) => (
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
              Pret a comprendre ce qui fait decrocher ?
            </h2>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "15px",
                lineHeight: 1.8,
                color: "rgba(237, 242, 247, 0.8)",
              }}
            >
              Choisissez votre format, puis lancez une analyse en quelques secondes.
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
              Commencer par les videos
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
              { href: "/guide?format=video", label: "Comment ca marche" },
              { href: "/transparence", label: "Transparence" },
              { href: "/videos", label: "Videos" },
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
