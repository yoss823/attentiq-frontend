"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clearPendingCheckout, readPendingCheckout } from "@/lib/access-state";
import {
  buildCheckoutSuccessHref,
  buildResultHref,
  normalizeCheckoutContext,
  type CheckoutContext,
} from "@/lib/checkout-context";
import { getOfferBySlug } from "@/lib/offer-config";
import {
  activatePremiumEntitlementFromSuccessfulCheckout,
  type PremiumEntitlement,
} from "@/lib/premium";

type UnlockResult =
  | {
      entitlement: PremiumEntitlement;
      unlockMode: "one_shot" | "subscription";
    }
  | null;

type CheckoutSuccessStateProps = {
  initialContext?: CheckoutContext;
};

export default function CheckoutSuccessState({
  initialContext,
}: CheckoutSuccessStateProps) {
  const [unlockResult, setUnlockResult] = useState<UnlockResult>(null);
  const [restoredContext, setRestoredContext] = useState(() =>
    normalizeCheckoutContext(initialContext)
  );

  useEffect(() => {
    const pendingCheckout = readPendingCheckout();
    const mergedContext = normalizeCheckoutContext({
      offerSlug: pendingCheckout?.offerSlug ?? initialContext?.offerSlug,
      jobId: pendingCheckout?.jobId ?? initialContext?.jobId,
      videoUrl: pendingCheckout?.videoUrl ?? initialContext?.videoUrl,
    });
    const offerSlug = mergedContext.offerSlug;

    if (offerSlug && typeof window !== "undefined") {
      const restoredUrl = buildCheckoutSuccessHref(mergedContext);
      const currentUrl = `${window.location.pathname}${window.location.search}`;

      if (currentUrl !== restoredUrl) {
        window.history.replaceState(null, "", restoredUrl);
      }
    }

    if (!offerSlug) {
      clearPendingCheckout();
      return;
    }

    const result = activatePremiumEntitlementFromSuccessfulCheckout({
      offerSlug,
      jobId: mergedContext.jobId,
      videoUrl: mergedContext.videoUrl,
    });
    clearPendingCheckout();
    const frameId = window.requestAnimationFrame(() => {
      setRestoredContext(mergedContext);
      setUnlockResult(result);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [initialContext]);

  const selectedOffer = useMemo(
    () =>
      getOfferBySlug(
        unlockResult?.entitlement.offerSlug ?? restoredContext.offerSlug ?? ""
      ) ?? null,
    [restoredContext.offerSlug, unlockResult]
  );

  const reportHref = useMemo(
    () =>
      buildResultHref({
        jobId: restoredContext.jobId ?? unlockResult?.entitlement.jobId ?? null,
        videoUrl: restoredContext.videoUrl,
      }),
    [restoredContext.jobId, restoredContext.videoUrl, unlockResult]
  );

  const hasUnlockedReport = Boolean(
    unlockResult?.entitlement.requestId ||
      unlockResult?.entitlement.jobId ||
      restoredContext.jobId
    );
  const isSubscription = unlockResult?.unlockMode === "subscription";
  const subscriberEmail = unlockResult?.entitlement.subscriberEmail ?? null;
  const accountHref = subscriberEmail
    ? `/compte?email=${encodeURIComponent(subscriberEmail)}`
    : "/compte";

  const title = isSubscription
    ? "Paiement confirme - acces abonne active"
    : hasUnlockedReport
      ? "Paiement confirme - rapport complet debloque"
      : "Paiement confirme";

  const description = isSubscription
    ? "Votre acces premium est actif. Vous pouvez ouvrir l'espace abonne avec votre email Stripe."
    : hasUnlockedReport
      ? "Le rapport en cours est debloque. Vous pouvez revenir tout de suite au detail complet."
      : "Paiement enregistre. Revenez au rapport depuis cet onglet pour activer le deblocage.";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background:
          "radial-gradient(circle at top, rgba(52, 211, 153, 0.12), transparent 28%), radial-gradient(circle at 82% 16%, rgba(0, 212, 255, 0.1), transparent 18%), var(--bg-base)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "680px",
          padding: "36px 28px",
          borderRadius: "30px",
          border: "1px solid rgba(52, 211, 153, 0.2)",
          background:
            "linear-gradient(160deg, rgba(52, 211, 153, 0.08) 0%, rgba(12, 17, 23, 0.98) 60%)",
          boxShadow:
            "0 0 0 1px rgba(52,211,153,0.08) inset, 0 32px 90px rgba(0,0,0,0.34)",
        }}
      >
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "22px",
            background: "rgba(52, 211, 153, 0.12)",
            border: "1px solid rgba(52, 211, 153, 0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
          }}
        >
          ✓
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "18px",
            padding: "7px 12px",
            borderRadius: "999px",
            border: "1px solid rgba(52, 211, 153, 0.22)",
            background: "rgba(52, 211, 153, 0.08)",
            color: "#86efac",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Paiement confirmé
        </div>

        <h1
          style={{
            margin: "18px 0 0",
            fontSize: "clamp(2rem, 6vw, 3.4rem)",
            lineHeight: 0.94,
            letterSpacing: "-0.08em",
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: "16px 0 0",
            fontSize: "15px",
            lineHeight: 1.8,
            color: "rgba(237, 242, 247, 0.82)",
            maxWidth: "44rem",
          }}
        >
          {description}
        </p>

        {selectedOffer && (
          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              borderRadius: "22px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              display: "grid",
              gap: "10px",
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
              Offre activée
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "var(--text-primary)",
              }}
            >
              {selectedOffer.name}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              {selectedOffer.createsAccount
                ? "Le compte abonné se base sur l'email Stripe et l'accès local est ouvert sur cet appareil."
                : "Aucun compte n'est requis pour ce déblocage one-shot."}
            </p>
          </div>
        )}

        {(restoredContext.jobId || restoredContext.videoUrl) && (
          <div
            style={{
              marginTop: "18px",
              padding: "18px",
              borderRadius: "22px",
              border: "1px solid rgba(52, 211, 153, 0.18)",
              background: "rgba(52, 211, 153, 0.06)",
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
                color: "#86efac",
              }}
            >
              Contexte restauré
            </p>
            {restoredContext.jobId && (
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  lineHeight: 1.7,
                  color: "rgba(237, 242, 247, 0.84)",
                }}
              >
                Job: {restoredContext.jobId}
              </p>
            )}
            {restoredContext.videoUrl && (
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                  wordBreak: "break-all",
                }}
              >
                {restoredContext.videoUrl}
              </p>
            )}
          </div>
        )}

        <div
          style={{
            marginTop: "26px",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <Link
            href={reportHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50px",
              padding: "0 20px",
              borderRadius: "999px",
              textDecoration: "none",
              background: "linear-gradient(135deg, var(--accent), #79e7ff)",
              color: "#041017",
              fontSize: "14px",
              fontWeight: 900,
            }}
          >
              Ouvrir mon rapport
          </Link>

          {isSubscription && (
            <Link
              href={accountHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "50px",
                padding: "0 20px",
                borderRadius: "999px",
                textDecoration: "none",
                border: "1px solid rgba(52, 211, 153, 0.24)",
                background: "rgba(52, 211, 153, 0.08)",
                color: "#86efac",
                fontSize: "14px",
                fontWeight: 800,
              }}
            >
              Ouvrir l&apos;espace abonné
            </Link>
          )}

          <Link
            href="/analyze"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50px",
              padding: "0 20px",
              borderRadius: "999px",
              textDecoration: "none",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              fontSize: "14px",
              fontWeight: 800,
            }}
          >
              Analyser une autre video
          </Link>
        </div>
      </section>
    </main>
  );
}
