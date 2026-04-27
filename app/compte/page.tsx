import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import AccountLoginForm from "@/components/account-login-form";
import { buildResultHref } from "@/lib/checkout-context";
import { getOfferBySlug } from "@/lib/offer-config";
import { getSubscriberAccountByEmail } from "@/lib/subscriber-store";
import { ACCOUNT_SESSION_COOKIE_NAME, normalizeAccountEmail } from "@/lib/account-session";

export const metadata: Metadata = {
  title: "Compte abonne — Attentiq",
  description:
    "Etat d'acces abonne Attentiq, quota mensuel simple et historique de paiements rattaches a l'email Stripe.",
};

type SubscriberAccountPageProps = {
  searchParams: Promise<{
    email?: string | string[] | undefined;
    loginError?: string | string[] | undefined;
    from?: string | string[] | undefined;
  }>;
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

function formatRemaining(monthlyQuota: number | null, monthlyUsed: number) {
  if (monthlyQuota == null) {
    return "Illimite";
  }
  return String(Math.max(monthlyQuota - monthlyUsed, 0));
}

function formatAnalysisType(type: "video" | "text" | "image" | "unknown") {
  if (type === "video") return "Video";
  if (type === "text") return "Texte";
  if (type === "image") return "Image";
  return "Autre";
}

function httpSourceUrlForResult(sourceLabel: string | null) {
  const raw = sourceLabel?.trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? raw
      : null;
  } catch {
    return null;
  }
}

export default async function SubscriberAccountPage({
  searchParams,
}: SubscriberAccountPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const sessionEmail = normalizeAccountEmail(
    cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value ?? null
  );
  const rawEmail = Array.isArray(params.email) ? params.email[0] : params.email;
  const email = normalizeAccountEmail(rawEmail) ?? sessionEmail ?? "";
  const loginError = Array.isArray(params.loginError)
    ? params.loginError[0]
    : params.loginError;
  const fromParam = Array.isArray(params.from) ? params.from[0] : params.from;
  const fromCheckout = fromParam === "checkout";
  const { account, payments, analyses } = email
    ? await getSubscriberAccountByEmail(email)
    : { account: null, payments: [], analyses: [] };

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
        {fromCheckout && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "18px",
              border: "1px solid rgba(52, 211, 153, 0.24)",
              background: "rgba(52, 211, 153, 0.08)",
              color: "#86efac",
              fontSize: "14px",
              lineHeight: 1.7,
            }}
          >
            Abonnement confirme. Utilisez la meme adresse e-mail que sur Stripe
            pour ouvrir votre espace abonne, puis lancez une analyse : chaque
            rapport complet sera debloque selon votre quota.
          </div>
        )}

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
            Votre compte et vos analyses.
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
            Saisissez l&apos;email Stripe du compte abonne : nous vous envoyons un
            lien de connexion securise (une seule utilisation, quelques minutes).
            Sur le meme navigateur, la session peut rester active sans recliquer le
            lien a chaque visite.
          </p>

          <AccountLoginForm initialEmail={email} sessionEmail={sessionEmail} />

          {sessionEmail && (
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                Session active : {sessionEmail}
              </p>
              <Link
                href="/api/account/logout"
                style={{
                  color: "#fca5a5",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Se deconnecter
              </Link>
            </div>
          )}

          {loginError === "missing_email" && (
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
              Saisissez l&apos;email utilise lors du paiement Stripe pour ouvrir votre compte.
            </div>
          )}

          {loginError === "not_found" && (
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
              Aucun compte actif pour cet email. Verifiez l&apos;adresse de paiement.
            </div>
          )}

          {loginError === "unknown" && (
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
              La connexion n&apos;a pas pu etre confirmee. Reessayez dans un instant.
            </div>
          )}

          {loginError === "magic_invalid" && (
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
              Ce lien de connexion est expire ou deja utilise. Demandez un nouveau
              lien depuis cette page.
            </div>
          )}

          {loginError === "magic_required" && (
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
              La connexion directe par lien email sans jeton n&apos;est plus active.
              Utilisez le bouton pour recevoir un lien securise.
            </div>
          )}

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
              Aucun abonnement actif trouve pour cet email. Verifiez
              l&apos;adresse Stripe ou reessayez dans quelques minutes.
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
                    label: "Analyses restantes",
                    value: formatRemaining(account.monthlyQuota, account.monthlyUsed),
                    helper:
                      account.monthlyQuota == null
                        ? "Pas de limite mensuelle"
                        : `${account.monthlyQuota} analyses max / mois`,
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
                  border: "1px solid rgba(0, 212, 255, 0.22)",
                  background:
                    "linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(8, 12, 18, 0.96) 100%)",
                  padding: "20px",
                  display: "grid",
                  gap: "12px",
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
                  Assistant post-diagnostic
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    lineHeight: 1.75,
                    color: "rgba(237, 242, 247, 0.85)",
                  }}
                >
                  Posez des questions sur votre rapport. Le contexte du diagnostic est
                  pris en charge automatiquement lorsque vous ouvrez l&apos;assistant
                  depuis la page d&apos;un rapport ; depuis le compte, vous pouvez
                  tout de meme ouvrir l&apos;assistant (exemple si aucun rapport en
                  session).
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  <Link
                    href="/chat"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "999px",
                      padding: "12px 20px",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: 800,
                      background: "linear-gradient(135deg, var(--accent), #79e7ff)",
                      color: "#041017",
                    }}
                  >
                    Ouvrir l&apos;assistant
                  </Link>
                  <Link
                    href="/guide?format=video"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    Guide du rapport
                  </Link>
                </div>
              </section>

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
                {analyses.length > 0 ? (
                  <div style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
                    {analyses.map((analysis) => (
                      <div
                        key={`${analysis.jobId}-${analysis.createdAt}`}
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
                          {formatAnalysisType(analysis.contentType)} · {formatDate(analysis.createdAt)}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            lineHeight: 1.7,
                            color: "var(--text-secondary)",
                            wordBreak: "break-all",
                          }}
                        >
                          Job: {analysis.jobId}
                        </p>
                        {analysis.sourceLabel && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              lineHeight: 1.6,
                              color: "var(--text-secondary)",
                              wordBreak: "break-all",
                            }}
                          >
                            Source: {analysis.sourceLabel}
                          </p>
                        )}
                        <div style={{ marginTop: "10px" }}>
                          <Link
                            href={buildResultHref({
                              jobId: analysis.jobId,
                              videoUrl: httpSourceUrlForResult(analysis.sourceLabel),
                            })}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "999px",
                              padding: "10px 16px",
                              textDecoration: "none",
                              fontSize: "13px",
                              fontWeight: 800,
                              background: "rgba(0, 212, 255, 0.16)",
                              color: "#a5f3fc",
                              border: "1px solid rgba(34, 211, 238, 0.35)",
                            }}
                          >
                            Voir le rapport complet
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      margin: "14px 0 0",
                      fontSize: "14px",
                      lineHeight: 1.75,
                      color: "rgba(237, 242, 247, 0.8)",
                    }}
                  >
                    Aucune analyse rattachee a ce compte pour l&apos;instant.
                  </p>
                )}
              </section>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
