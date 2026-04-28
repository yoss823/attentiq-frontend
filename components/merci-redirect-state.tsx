"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buildAnalyzeHref, buildResultHref } from "@/lib/checkout-context";
import { clearPendingCheckout, readPendingCheckout } from "@/lib/access-state";
import { readAnalyzeResult } from "@/lib/analyze-session";
import { activatePremiumEntitlementFromSuccessfulCheckout } from "@/lib/premium";

type MerciRedirectStateProps = {
  initialSessionId: string | null;
};

type VerifySessionSuccess = {
  ok: true;
  offerSlug: string;
  plan: "single" | "5" | "pack15" | null;
  jobId: string | null;
  videoUrl: string | null;
};

type SetPremiumSuccess = {
  ok: true;
  paid: boolean;
  offerSlug: string;
  plan: "single" | "5" | "pack15" | null;
  jobId: string | null;
  videoUrl: string | null;
  customerEmail: string | null;
  thankYouEmail?: {
    status: "sent" | "skipped_no_recipient" | "skipped_no_resend_key" | "failed";
    resendEmailId?: string;
    message?: string;
  };
};

type SetPremiumFailure = {
  ok: false;
  error: string;
};

type VerifySessionFailure = {
  ok: false;
  error: string;
  offerSlug?: string;
  plan?: "single" | "5" | "pack15" | null;
};

function buildErrorCopy(error: string) {
  switch (error) {
    case "MISSING_SESSION_ID":
      return "Le retour Stripe ne contient pas de session_id. Aucun accès premium n'a été activé.";
    case "SESSION_NOT_VERIFIED":
      return "La session Stripe n'est pas encore vérifiée côté serveur. Réessayez dans quelques instants.";
    case "CHECKOUT_CONTEXT_NOT_FOUND":
      return "Le paiement est reconnu, mais l'analyse à débloquer n'est pas identifiée (souvent : autre appareil, cookies bloqués, ou lien Stripe ouvert sans repasser par Attentiq). Réessayez depuis la page du rapport sur le même navigateur, ou contactez le support avec l'email de paiement et l'heure d'achat.";
    case "PREMIUM_ACTIVATION_FAILED":
    case "PREMIUM_VERIFICATION_FAILED":
    case "PREMIUM_SET_FAILED":
      return "Le paiement a été vérifié, mais l'activation premium n'a pas pu être confirmée côté serveur.";
    default:
      return "La vérification du paiement a échoué. L'accès premium n'a pas été modifié.";
  }
}

export default function MerciRedirectState({
  initialSessionId,
}: MerciRedirectStateProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (!initialSessionId) {
        if (!cancelled) {
          setStatus("error");
          setErrorCode("MISSING_SESSION_ID");
        }
        return;
      }

      try {
        const response = await fetch(
          `/api/checkout/verify-session?session_id=${encodeURIComponent(initialSessionId)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const payload = (await response.json()) as
          | VerifySessionSuccess
          | VerifySessionFailure;

        if (!response.ok || !payload.ok) {
          if (!cancelled) {
            setStatus("error");
            setErrorCode("error" in payload ? payload.error : "UNKNOWN_ERROR");
          }
          return;
        }

        const pending = readPendingCheckout();
        const fallbackJobId = pending?.jobId ?? null;
        const fallbackVideoUrl = pending?.videoUrl ?? null;

        const setPremiumResponse = await fetch("/api/set-premium", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            sessionId: initialSessionId,
            jobId: payload.jobId ?? fallbackJobId,
            videoUrl: payload.videoUrl ?? fallbackVideoUrl,
          }),
        });

        const setPremiumPayload = (await setPremiumResponse.json()) as
          | SetPremiumSuccess
          | SetPremiumFailure;

        if (!setPremiumResponse.ok || !setPremiumPayload.ok) {
          if (!cancelled) {
            setStatus("error");
            setErrorCode(
              "error" in setPremiumPayload
                ? setPremiumPayload.error
                : "PREMIUM_ACTIVATION_FAILED"
            );
          }
          return;
        }

        activatePremiumEntitlementFromSuccessfulCheckout({
          offerSlug: setPremiumPayload.offerSlug,
          jobId: setPremiumPayload.jobId,
          videoUrl: setPremiumPayload.videoUrl,
          subscriberEmail: setPremiumPayload.customerEmail,
        });

        const finalJobId = setPremiumPayload.jobId ?? fallbackJobId;
        const finalVideoUrl = setPremiumPayload.videoUrl ?? fallbackVideoUrl;
        const hasReportContext = Boolean(finalJobId || finalVideoUrl);
        const plan = setPremiumPayload.plan;
        const isSubscription =
          plan === "5" || plan === "pack15";

        if (hasReportContext) {
          clearPendingCheckout();
          router.replace(
            buildResultHref({
              jobId: finalJobId,
              videoUrl: finalVideoUrl,
            })
          );
          return;
        }

        if (isSubscription) {
          const stored = readAnalyzeResult();
          const storedJobId = stored?.jobId ?? null;
          const storedVideoUrl = stored?.url?.trim() ? stored.url : null;
          if (storedJobId || storedVideoUrl) {
            clearPendingCheckout();
            router.replace(
              buildResultHref({
                jobId: storedJobId,
                videoUrl: storedVideoUrl,
              })
            );
            return;
          }
          clearPendingCheckout();
          router.replace("/compte?from=checkout");
          return;
        }

        clearPendingCheckout();
        router.replace(
          buildAnalyzeHref({
            jobId: finalJobId,
            videoUrl: finalVideoUrl,
            paid: setPremiumPayload.paid,
          })
        );
      } catch (error) {
        console.error("[merci] verify-session failed", error);

        if (!cancelled) {
          setStatus("error");
          setErrorCode("VERIFY_REQUEST_FAILED");
        }
      }
    }

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, [initialSessionId, router]);

  if (status === "loading") {
    return (
      <div
        style={{
          display: "grid",
          gap: "18px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto",
            borderRadius: "20px",
            background: "rgba(0, 212, 255, 0.12)",
            border: "1px solid rgba(0, 212, 255, 0.26)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
          }}
        >
          ↗
        </div>

        <div
          style={{
            display: "grid",
            gap: "12px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            Verification paiement
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(1.9rem, 6vw, 2.8rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.06em",
              color: "var(--text-primary)",
            }}
          >
            On rattache votre accès premium
          </h1>
          <p
          style={{
            margin: 0,
            fontSize: "15px",
            lineHeight: 1.8,
            color: "var(--text-secondary)",
          }}
        >
          La session Stripe est vérifiée côté serveur avant d&apos;activer le
          plan premium et de vous renvoyer vers votre analyse.
        </p>
      </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "18px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          margin: "0 auto",
          borderRadius: "20px",
          background: "rgba(251, 146, 60, 0.12)",
          border: "1px solid rgba(251, 146, 60, 0.28)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
        }}
      >
        !
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#fdba74",
          }}
        >
          Verification incomplète
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(1.8rem, 6vw, 2.6rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.06em",
            color: "var(--text-primary)",
          }}
        >
          Paiement non raccordé automatiquement
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            lineHeight: 1.8,
            color: "var(--text-secondary)",
          }}
        >
          {buildErrorCopy(errorCode ?? "UNKNOWN_ERROR")}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Link
          href="/analyze"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px 24px",
            borderRadius: "999px",
            textDecoration: "none",
            background: "linear-gradient(135deg, var(--accent), #7ae8ff)",
            color: "#041017",
            fontSize: "15px",
            fontWeight: 800,
            boxShadow: "0 18px 52px rgba(0, 212, 255, 0.2)",
          }}
        >
          Revenir a l&apos;analyse
        </Link>
        <Link
          href="/compte"
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Ouvrir l&apos;espace compte
        </Link>
      </div>
    </div>
  );
}
