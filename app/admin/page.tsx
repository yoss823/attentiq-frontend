import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminOverviewSnapshot } from "@/lib/subscriber-store";

export const metadata: Metadata = {
  title: "Admin — Attentiq",
  robots: { index: false, follow: false },
};

type AdminPageProps = {
  searchParams: Promise<{
    token?: string | string[] | undefined;
  }>;
};

function readFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }
  return value?.trim() || null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const token = readFirstParam(params.token);
  const expected = process.env.ATTENTIQ_ADMIN_TOKEN?.trim();

  if (!expected || !token || token !== expected) {
    notFound();
  }

  const snapshot = await getAdminOverviewSnapshot();
  if (!snapshot) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          padding:
            "max(1rem, env(safe-area-inset-top, 0px)) max(1rem, env(safe-area-inset-right, 0px)) max(1.25rem, env(safe-area-inset-bottom, 0px)) max(1rem, env(safe-area-inset-left, 0px))",
          background: "var(--bg-base)",
        }}
      >
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
          Postgres non configure (<code>DATABASE_URL</code>).
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        paddingTop: "max(0.5rem, env(safe-area-inset-top, 0px))",
        background:
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.12), transparent 28%), var(--bg-base)",
      }}
    >
      <div className="attentiq-shell attentiq-shell--xl">
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
          Admin interne
        </p>
        <h1
          style={{
            margin: "12px 0 0",
            fontSize: "clamp(2rem, 6vw, 3.2rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.08em",
            color: "var(--text-primary)",
          }}
        >
          Vue rapide abonnés + analyses
        </h1>
        <p
          style={{
            margin: "14px 0 0",
            maxWidth: "52rem",
            fontSize: "14px",
            lineHeight: 1.75,
            color: "rgba(237, 242, 247, 0.78)",
          }}
        >
          Ceci lit uniquement ce qui est déjà en base Postgres (comptes abonnés,
          paiements enregistrés, analyses rattachées). Ce n&apos;est pas une
          analytics marketing complète du site.
        </p>

        <div
          style={{
            marginTop: "22px",
            display: "grid",
            gap: "14px",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {[
            { label: "Comptes abonnés", value: String(snapshot.totals.subscriberAccounts) },
            { label: "Comptes actifs", value: String(snapshot.totals.activeSubscriberAccounts) },
            { label: "Paiements enregistrés", value: String(snapshot.totals.paymentEvents) },
            { label: "Analyses enregistrées", value: String(snapshot.totals.analysisEvents) },
            {
              label: "Emails distincts (analyses)",
              value: String(snapshot.totals.distinctAnalysisEmails),
            },
          ].map((card) => (
            <section
              key={card.label}
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
                {card.label}
              </p>
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: "34px",
                  lineHeight: 1,
                  letterSpacing: "-0.06em",
                  fontWeight: 900,
                  color: "var(--text-primary)",
                }}
              >
                {card.value}
              </p>
            </section>
          ))}
        </div>

        <div style={{ marginTop: "22px", display: "grid", gap: "16px" }}>
          <section
            style={{
              borderRadius: "24px",
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
                letterSpacing: "0.18em",
                fontWeight: 800,
                color: "var(--accent)",
              }}
            >
              Abonnés récents
            </p>
            <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
              {snapshot.recentSubscribers.length === 0 ? (
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>Aucune ligne.</p>
              ) : (
                snapshot.recentSubscribers.map((row) => (
                  <div
                    key={`${row.email}-${row.updatedAt}`}
                    style={{
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                      background: "rgba(0,0,0,0.14)",
                      padding: "12px 14px",
                      display: "grid",
                      gap: "6px",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
                      {row.email}
                    </p>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                      {row.offerSlug} · {row.accessStatus} · quota {row.monthlyUsed}
                      {row.monthlyQuota == null ? "" : ` / ${row.monthlyQuota}`}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                      MAJ {formatDate(row.updatedAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section
            style={{
              borderRadius: "24px",
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
                letterSpacing: "0.18em",
                fontWeight: 800,
                color: "var(--text-secondary)",
              }}
            >
              Analyses recentes
            </p>
            <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
              {snapshot.recentAnalyses.length === 0 ? (
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>Aucune ligne.</p>
              ) : (
                snapshot.recentAnalyses.map((row) => (
                  <div
                    key={`${row.email}-${row.jobId}-${row.createdAt}`}
                    style={{
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                      background: "rgba(0,0,0,0.14)",
                      padding: "12px 14px",
                      display: "grid",
                      gap: "6px",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
                      {row.email}
                    </p>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                      {row.contentType} · {formatDate(row.createdAt)}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        wordBreak: "break-all",
                      }}
                    >
                      Job: {row.jobId}
                    </p>
                    {row.sourceLabel && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          wordBreak: "break-all",
                        }}
                      >
                        Source: {row.sourceLabel}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section
            style={{
              borderRadius: "24px",
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
                letterSpacing: "0.18em",
                fontWeight: 800,
                color: "var(--text-secondary)",
              }}
            >
              Paiements recents
            </p>
            <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
              {snapshot.recentPayments.length === 0 ? (
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>Aucune ligne.</p>
              ) : (
                snapshot.recentPayments.map((row) => (
                  <div
                    key={row.stripeSessionId}
                    style={{
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                      background: "rgba(0,0,0,0.14)",
                      padding: "12px 14px",
                      display: "grid",
                      gap: "6px",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
                      {(row.amountCents / 100).toFixed(0)} {row.currency.toUpperCase()}
                    </p>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                      {row.offerSlug ?? "offre inconnue"} · {formatDate(row.receivedAt)}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                      {row.email ?? "email inconnu"}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        wordBreak: "break-all",
                      }}
                    >
                      Session: {row.stripeSessionId}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
