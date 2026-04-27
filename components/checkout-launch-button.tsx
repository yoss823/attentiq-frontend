"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import type { AttentiqOffer } from "@/lib/offer-config";
import { persistPendingCheckout } from "@/lib/access-state";
import {
  getCheckoutPrefillEmailForClient,
  withStripePrefilledEmail,
} from "@/lib/stripe-prefill-url";

type CheckoutLaunchButtonProps = {
  offer: AttentiqOffer;
  jobId?: string | null;
  videoUrl?: string | null;
  style?: CSSProperties;
  idleLabel?: string;
  loadingLabel?: string;
};

export default function CheckoutLaunchButton({
  offer,
  jobId = null,
  videoUrl = null,
  style,
  idleLabel = "Continuer vers Stripe",
  loadingLabel = "Connexion à Stripe...",
}: CheckoutLaunchButtonProps) {
  const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);

  return (
    <button
      type="button"
      disabled={isPreparingCheckout}
      onClick={async () => {
        if (isPreparingCheckout) {
          return;
        }

        setIsPreparingCheckout(true);
        const prefillEmail = getCheckoutPrefillEmailForClient();
        persistPendingCheckout({
          offerSlug: offer.slug,
          jobId,
          videoUrl,
        });

        try {
          const response = await fetch("/api/checkout/prepare", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              offerSlug: offer.slug,
              jobId,
              videoUrl,
              prefillEmail: prefillEmail ?? undefined,
            }),
          });

          if (!response.ok) {
            throw new Error("CHECKOUT_PREPARE_FAILED");
          }

          const payload = (await response.json()) as { redirectUrl?: unknown };
          const redirectUrl =
            typeof payload.redirectUrl === "string" && payload.redirectUrl
              ? payload.redirectUrl
              : withStripePrefilledEmail(offer.stripeUrl, prefillEmail);

          window.location.assign(redirectUrl);
          return;
        } catch (error) {
          console.error("[checkout] prepare failed", error);
          window.location.assign(
            withStripePrefilledEmail(offer.stripeUrl, prefillEmail)
          );
        } finally {
          setIsPreparingCheckout(false);
        }
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "54px",
        padding: "0 18px",
        borderRadius: "999px",
        border: "none",
        cursor: isPreparingCheckout ? "wait" : "pointer",
        opacity: isPreparingCheckout ? 0.72 : 1,
        background: "linear-gradient(135deg, var(--accent), #79e7ff)",
        color: "#041017",
        fontSize: "15px",
        fontWeight: 900,
        boxShadow: "0 18px 52px rgba(0, 212, 255, 0.18)",
        ...style,
      }}
    >
      {isPreparingCheckout ? loadingLabel : idleLabel}
    </button>
  );
}
