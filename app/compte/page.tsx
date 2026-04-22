import type { Metadata } from "next";
import Link from "next/link";
import { getOfferBySlug } from "@/lib/offer-config";
import { getSubscriberAccountByEmail } from "@/lib/subscriber-store";

export const metadata: Metadata = {
  title: "Compte abonne — Attentiq",
  description:
    "Etat d'acces abonne Attentiq, quota mensuel simple et historique de paiements rattaches a l'email Stripe.",
};

type SubscriberAccountPageProps = {
  searchParams: Promise<{ email?: string | string[] | undefined }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Indisponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatQuota(monthlyQuota: number | null, monthlyUsed: number) {
  if (monthlyQuota == null) {
    return `Illimite · ${monthlyUsed} utilise(s) ce mois`;
  }

  return `${monthlyUsed} / ${monthlyQuota} utilise(s)`;
}

export default async function SubscriberAccountPage({
  searchParams,
}: SubscriberAccountPageProps) {
  const params = await searchParams;
  const rawEmail = Array.isArray(params.email) ? params.email[0] : params.email;
  const email = rawEmail?.trim().toLowerCase() ?? "";
  const { account, payments } = email
    ? await getSubscriberAccountByEmail(email)
    : { account: null, payments: [] };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.14), transparent 28%), radial-gradient(circle at 82% 16%, rgba(52, 211, 153, 0.08), transparent 18%), var(--bg-base)",
      }}
    >
      <div
        style={{
          maxWidth: "980px",
          margin: "0 auto",
          padding: "28px 16px 72px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
            textDecoration: "none",
            color: "var(--text-secondary)",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.05)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-primary)",
            }}
          >
            ←
          </span>
          Retour a l&apos;accueil
        </Link>

        <section
          style={{
            borderRadius: "30px",
            border: "1px solid rgba(0, 212, 255, 0.18)",
            background:
              "linear-gradient(180deg, rgba(11, 16, 22, 0.98) 0%, rgba(7, 11, 16, 0.96) 100%)",
            padding: "28px 22px",
            boxShadow: "0 32px 120px rgba(0, 0, 0, 0.34)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "999px",
              background: "rgba(0, 212, 255, 0.08)",
              border: "1px solid rgba(0, 212, 255, 0.18)",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "999px",
                background: "var(--accent)",
                boxShadow: "0 0 12px var(--accent-glow)",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontWeight: 800,
                color: "var(--accent)",
              }}
            >
              Compte abonne
            </span>
          </div>

          <h1
            style={{
              margin: "16px 0 0",
              fontSize: "clamp(2rem, 7vw, 3.6rem)",
              lineHeight: 0.94,
              letterSpacing: "-0.08em",
              color: "var(--text-primary)",
            }}
          >
            Etat d&apos;acces et quota simple.
          </h1>

          <p
            style={{
              margin: "16px 0 0",
              maxWidth: "42rem",
              fontSize: "15px",
              lineHeight: 1.8,
              color: "rgba(237, 242, 247, 0.8)",
            }}
          >
            Cet espace se base sur l&apos;email utilise dans Stripe pour les
            abonnements 49EUR et 99EUR. Le gratuit ne demande aucun compte.
          </p>

          <form
            action="/compte"
            method="get"
            style={{
              marginTop: "24px",
              display: "grid",
              gap: "14px",
              gridTemplateColumns: "minmax(0, 1fr) auto",
            }}
          >
            <input
              type="email"
              name="email"
              defaultValue={email}
              placeholder="email utilise dans Stripe"
              style={{
                minHeight: "54px",
                borderRadius: "18px",
                border: "1px solid var(--border)",
                background: "rgba(5, 9, 14, 0.78)",
                color: "var(--text-primary)",
                fontSize: "15px",
                padding: "0 16px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                minHeight: "54px",
                borderRadius: "999px",
                border: "none",
                padding: "0 18px",
                background: "linear-gradient(135deg, var(--accent), #79e7ff)",
                color: "#041017",
                fontSize: "14px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Charger
            </button>
          </form>

          {email && !account && (
            <div
              style={{
                marginTop: "18px",
                padding: "16px",
                borderRadius: "20px",
                border: "1px solid rgba(251, 146, 60, 0.24)",
                background: "rgba(251, 146, 60, 0.08)",
                color: "#fdba74",
                fontSize: "14px",
                lineHeight: 1.75,
              }}
            >
              Aucun abonnement actif n&apos;a ete trouve pour cet email. Verifiez
              l&apos;adresse de paiement Stripe ou attendez la reception du webhook.
            </div>
          )}

          {account && (
            <div style={{ marginTop: "22px", display: "grid", gap: "16px" }}>
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                {[
                  {
                    label: "Offre active",
                    value: account.offerName,
                    helper: account.email,
                  },
                  {
                    label: "Quota mensuel",
                    value: formatQuota(account.monthlyQuota, account.monthlyUsed),
                    helper: `Periode ouverte le ${formatDate(account.quotaPeriodStartedAt)}`,
                  },
                  {
                    label: "Dernier paiement",
                    value: account.lastPaymentAmountCents
                      ? `${(account.lastPaymentAmountCents / 100).toFixed(0)} EUR`
                      : "Indisponible",
                    helper: formatDate(account.lastPaymentAt),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
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
                      {item.label}
                    </p>
                    <p
                      style={{
                        margin: "12px 0 0",
                        fontSize: "24px",
                        lineHeight: 1.1,
                        letterSpacing: "-0.05em",
                        fontWeight: 800,
                        color: "var(--text-primary)",
                      }}
                    >
                      {item.value}
                    </p>
                    <p
                      style={{
                        margin: "10px 0 0",
                        fontSize: "13px",
                        lineHeight: 1.7,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {item.helper}
                    </p>
                  </div>
                ))}
              </div>

              <section
                style={{
                  borderRadius: "24px",
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.03)",
                  padding: "20px",
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
                  Historique paiements
                </p>
                {payments.length > 0 ? (
                  <div style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
                    {payments.map((payment) => (
                      <div
                        key={payment.stripeSessionId}
                        style={{
                          display: "grid",
                          gap: "4px",
                          padding: "14px 16px",
                          borderRadius: "18px",
                          border: "1px solid var(--border)",
                          background: "rgba(0,0,0,0.14)",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                          }}
                        >
                          {payment.offerSlug
                            ? getOfferBySlug(payment.offerSlug)?.name ??
                              payment.offerSlug.replaceAll("-", " ")
                            : "Paiement non mappe"}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            lineHeight: 1.7,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {(payment.amountCents / 100).toFixed(0)}{" "}
                          {payment.currency.toUpperCase()} · {formatDate(payment.receivedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      margin: "14px 0 0",
                      fontSize: "14px",
                      lineHeight: 1.75,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Aucun paiement rattache n&apos;a encore ete enregistre.
                  </p>
                )}
              </section>

              <section
                style={{
                  borderRadius: "24px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(8, 12, 18, 0.96) 100%)",
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    fontWeight: 800,
                    color: "var(--text-secondary)",
                  }}
                >
                  Historique rapports
                </p>
                <p
                  style={{
                    margin: "14px 0 0",
                    fontSize: "14px",
                    lineHeight: 1.75,
                    color: "rgba(237, 242, 247, 0.8)",
                  }}
                >
                  Le shell abonne expose deja l&apos;etat d&apos;acces et le quota
                  simple. Le rattachement automatique rapport -&gt; email Stripe
                  reste le prochain branchement pour afficher un historique de
                  rapports persistant.
                </p>
              </section>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
