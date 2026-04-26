import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CheckoutLaunchButton from "@/components/checkout-launch-button";
import {
  buildOfferCheckoutHref,
  buildResultHref,
  getCheckoutContextFromSearchParams,
} from "@/lib/checkout-context";
import {
  getOfferBySlug,
  getOfferRouteSlugs,
} from "@/lib/offer-config";

type CheckoutOfferPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    offerSlug?: string | string[] | undefined;
    jobId?: string | string[] | undefined;
    videoUrl?: string | string[] | undefined;
    url?: string | string[] | undefined;
  }>;
};

export async function generateStaticParams() {
  return getOfferRouteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CheckoutOfferPageProps): Promise<Metadata> {
  const { slug } = await params;
  const offer = getOfferBySlug(slug);

  if (!offer) {
    return {
      title: "Offre indisponible — Attentiq",
    };
  }

  return {
    title: `${offer.name} — Checkout Attentiq`,
    description: `Paiement Stripe pour l'offre ${offer.name.toLowerCase()} d'Attentiq.`,
  };
}

export default async function CheckoutOfferPage({
  params,
  searchParams,
}: CheckoutOfferPageProps) {
  const { slug } = await params;
  const checkoutContext = getCheckoutContextFromSearchParams(await searchParams);
  const offer = getOfferBySlug(slug);

  if (!offer) {
    notFound();
  }

  if (slug !== offer.slug) {
    redirect(
      buildOfferCheckoutHref(offer.slug, {
        jobId: checkoutContext.jobId,
        videoUrl: checkoutContext.videoUrl,
      })
    );
  }

  const resultHref = buildResultHref(checkoutContext);
  const hasAnalysisContext = Boolean(
    checkoutContext.jobId || checkoutContext.videoUrl
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.16), transparent 28%), radial-gradient(circle at 82% 16%, rgba(251, 146, 60, 0.12), transparent 18%), var(--bg-base)",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "28px 16px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--text-secondary)",
              textDecoration: "none",
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

          {hasAnalysisContext && (
            <Link
              href={resultHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--accent)",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 800,
              }}
            >
              Revenir au diagnostic en cours
            </Link>
          )}
        </div>

        <section
          style={{
            borderRadius: "30px",
            border: "1px solid rgba(0, 212, 255, 0.2)",
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
              marginBottom: "18px",
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
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "var(--accent)",
              }}
            >
              Checkout Attentiq
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gap: "22px",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            <div>
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
                {offer.kicker}
              </p>
              <h1
                style={{
                  margin: "10px 0 0",
                  fontSize: "clamp(2rem, 7vw, 3.4rem)",
                  lineHeight: 0.94,
                  letterSpacing: "-0.08em",
                  color: "var(--text-primary)",
                }}
              >
                {offer.name}
              </h1>
              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: "16px",
                  lineHeight: 1.8,
                  color: "rgba(237, 242, 247, 0.82)",
                  maxWidth: "34rem",
                }}
              >
                {offer.summary} {offer.audience}
              </p>

              <div
                style={{
                  marginTop: "22px",
                  display: "grid",
                  gap: "10px",
                }}
              >
                {offer.featureList.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 14px",
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                      background: "rgba(255,255,255,0.03)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
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
                        fontSize: "11px",
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              {hasAnalysisContext && (
                <div
                  style={{
                    marginTop: "18px",
                    padding: "14px 15px",
                    borderRadius: "18px",
                    border: "1px solid rgba(0, 212, 255, 0.16)",
                    background: "rgba(0, 212, 255, 0.06)",
                    display: "grid",
                    gap: "8px",
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
                    Contexte conserve
                  </p>
                  {checkoutContext.jobId && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        lineHeight: 1.7,
                        color: "rgba(237, 242, 247, 0.84)",
                      }}
                    >
                      Job: {checkoutContext.jobId}
                    </p>
                  )}
                  {checkoutContext.videoUrl && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        lineHeight: 1.6,
                        color: "var(--text-secondary)",
                        wordBreak: "break-all",
                      }}
                    >
                      {checkoutContext.videoUrl}
                    </p>
                  )}
                </div>
              )}
            </div>

            <aside
              style={{
                borderRadius: "24px",
                border: offer.featured
                  ? "1px solid rgba(0, 212, 255, 0.26)"
                  : "1px solid var(--border)",
                background: offer.featured
                  ? "linear-gradient(180deg, rgba(0, 212, 255, 0.1) 0%, rgba(10, 14, 20, 0.96) 100%)"
                  : "rgba(255,255,255,0.03)",
                padding: "22px 18px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontWeight: 800,
                  color: offer.featured ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                Offre selectionnee
              </p>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "44px",
                    lineHeight: 0.95,
                    letterSpacing: "-0.08em",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                  }}
                >
                  {offer.priceLabel}
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

              <CheckoutLaunchButton
                offer={offer}
                jobId={checkoutContext.jobId}
                videoUrl={checkoutContext.videoUrl}
                style={{ marginTop: "18px" }}
              />

              <div
                style={{
                  marginTop: "14px",
                  padding: "14px 15px",
                  borderRadius: "18px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 800,
                    color: offer.createsAccount ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  Après paiement
                </p>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: "13px",
                    lineHeight: 1.7,
                    color: "rgba(237, 242, 247, 0.8)",
                  }}
                >
                  {offer.createsAccount
                    ? "Accès premium activé sur cet appareil, compte abonné créé via l'email Stripe et contexte d'analyse conservé jusqu'au retour."
                    : "Retour immédiat vers Attentiq avec le rapport complet débloqué sur le rapport courant et son contexte d'analyse conservé."}
                </p>
              </div>

              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  color: "var(--text-muted)",
                }}
              >
                Paiement heberge par Stripe. Le catalogue Attentiq affiche les
                3 offres actives du sprint; prenez celle selectionnee ici.
              </p>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
