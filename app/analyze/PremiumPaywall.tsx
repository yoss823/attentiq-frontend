import {
  ATTENTIQ_OFFERS,
  formatEuroCents,
  getLaunchListPriceCents,
  LAUNCH_DISCOUNT_PERCENT,
} from "@/lib/offer-config";
import CheckoutLaunchButton from "@/components/checkout-launch-button";

const FREE_ITEMS = [
  "Résumé global du diagnostic",
  "Jusqu'à 3 chutes visibles",
  "Jusqu'à 2 actions visibles",
];

const COMPLETE_ITEMS = [
  "Timeline complète des chutes",
  "Pour chaque chute : importance, cause, et type (verbal, rythme ou visuel)",
  "Diagnostic structurel + plan d'actions priorisé",
];

const CHECKOUT_BUTTON_LABELS = {
  idle: "Voir le plan d'action complet",
  loading: "Connexion à Stripe...",
};

type PremiumPaywallProps = {
  jobId?: string | null;
  videoUrl?: string | null;
};

export default function PremiumPaywall({
  jobId = null,
  videoUrl = null,
}: PremiumPaywallProps) {
  const hasValidCheckoutContext = Boolean(jobId || videoUrl);

  return (
    <section
      id="offres-premium"
      style={{
        marginBottom: "14px",
        scrollMarginTop: "96px",
        borderRadius: "28px",
        border: "1px solid rgba(0, 212, 255, 0.2)",
        background:
          "linear-gradient(160deg, rgba(0, 212, 255, 0.08) 0%, rgba(12, 17, 23, 0.98) 60%)",
        boxShadow:
          "0 0 0 1px rgba(0,212,255,0.06) inset, 0 24px 72px rgba(0,0,0,0.28)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(0,212,255,0.35), transparent)",
        }}
      />

      <div style={{ padding: "28px 22px 24px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            marginBottom: "16px",
            padding: "5px 11px",
            borderRadius: "999px",
            border: "1px solid rgba(0,212,255,0.2)",
            background: "rgba(0,212,255,0.06)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "999px",
              background: "var(--accent)",
              boxShadow: "0 0 8px var(--accent)",
            }}
          />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            Débloquer le complet
          </span>
        </div>

        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "clamp(1.35rem, 4vw, 1.8rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.08,
            color: "var(--text-primary)",
          }}
        >
          Le gratuit qualifie. Le complet fait corriger.
        </h2>
        <p
          style={{
            margin: "0 0 22px",
            fontSize: "14px",
            lineHeight: 1.75,
            color: "var(--text-secondary)",
            maxWidth: "48rem",
          }}
        >
          Le rapport gratuit confirme le problème. Le complet vous donne la
          carte complète des chutes et l&apos;ordre d&apos;exécution pour améliorer
          la rétention dès la prochaine version.
        </p>

        {!hasValidCheckoutContext && (
          <div
            style={{
              marginBottom: "18px",
              borderRadius: "20px",
              border: "1px solid rgba(251, 146, 60, 0.22)",
              background:
                "linear-gradient(180deg, rgba(251, 146, 60, 0.08) 0%, rgba(12, 17, 23, 0.94) 100%)",
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontWeight: 800,
                color: "#fdba74",
              }}
            >
              Contexte manquant
            </p>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "13px",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              Relancez l&apos;analyse depuis le rapport en cours avant de payer,
              pour rattacher automatiquement l&apos;achat au bon diagnostic.
            </p>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gap: "14px",
            marginBottom: "18px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <div
            style={{
              borderRadius: "22px",
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.03)",
              padding: "18px",
            }}
          >
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
              Gratuit
            </p>
            <div style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
              {FREE_ITEMS.map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    fontSize: "13px",
                    lineHeight: 1.65,
                    color: "rgba(237, 242, 247, 0.82)",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderRadius: "22px",
              border: "1px solid rgba(0, 212, 255, 0.18)",
              background:
                "linear-gradient(180deg, rgba(0, 212, 255, 0.08) 0%, rgba(9, 13, 18, 0.96) 100%)",
              padding: "18px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontWeight: 800,
                color: "var(--accent)",
              }}
            >
              Complet
            </p>
            <div style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
              {COMPLETE_ITEMS.map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    fontSize: "13px",
                    lineHeight: 1.65,
                    color: "rgba(237, 242, 247, 0.86)",
                  }}
                >
                  <span style={{ color: "var(--accent)" }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: "14px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {ATTENTIQ_OFFERS.map((offer) => (
            <article
              key={offer.slug}
              style={{
                borderRadius: "22px",
                border: offer.featured
                  ? "1px solid rgba(0, 212, 255, 0.24)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: offer.featured
                  ? "linear-gradient(180deg, rgba(0, 212, 255, 0.1) 0%, rgba(10, 14, 20, 0.96) 100%)"
                  : "rgba(255,255,255,0.03)",
                padding: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  alignItems: "start",
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
                      color: offer.featured
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {offer.shortLabel}
                  </p>
                  <p
                    style={{
                      margin: "10px 0 0",
                      fontSize: "18px",
                      lineHeight: 1.2,
                      fontWeight: 800,
                      color: "var(--text-primary)",
                    }}
                  >
                    {offer.name}
                  </p>
                </div>
                {offer.featured && (
                  <span
                    style={{
                      padding: "6px 9px",
                      borderRadius: "999px",
                      border: "1px solid rgba(0, 212, 255, 0.18)",
                      background: "rgba(0, 212, 255, 0.08)",
                      color: "var(--accent)",
                      fontSize: "10px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                    }}
                  >
                    Recommandé
                  </span>
                )}
              </div>

              {offer.createsAccount && (
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: "12px",
                    lineHeight: 1.6,
                    color: "rgba(237, 242, 247, 0.74)",
                  }}
                >
                  Compte abonné créé via email Stripe
                </p>
              )}
              <span
                style={{
                  display: "inline-flex",
                  marginTop: "8px",
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
                  marginTop: "14px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    textDecoration: "line-through",
                  }}
                >
                  {formatEuroCents(getLaunchListPriceCents(offer.priceCents))}
                </span>
                <span
                  style={{
                    fontSize: "34px",
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
                      fontSize: "13px",
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
                  margin: "10px 0 0",
                  fontSize: "13px",
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                }}
              >
                {offer.summary}
              </p>

              <div style={{ marginTop: "16px" }}>
                <CheckoutLaunchButton
                  offer={offer}
                  jobId={jobId}
                  videoUrl={videoUrl}
                  style={{
                    minHeight: "48px",
                    background: offer.featured
                      ? "linear-gradient(135deg, var(--accent), #79e7ff)"
                      : "rgba(255,255,255,0.06)",
                    border: offer.featured
                      ? "none"
                      : "1px solid rgba(255,255,255,0.1)",
                    color: offer.featured ? "#041017" : "var(--text-primary)",
                    boxShadow: offer.featured
                      ? "0 18px 52px rgba(0, 212, 255, 0.18)"
                      : "none",
                  }}
                  idleLabel={CHECKOUT_BUTTON_LABELS.idle}
                  loadingLabel={CHECKOUT_BUTTON_LABELS.loading}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
