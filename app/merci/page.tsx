import type { Metadata } from "next";
import MerciRedirectState from "@/components/merci-redirect-state";

export const metadata: Metadata = {
  title: "Vérification du paiement — Attentiq",
  description:
    "Attentiq vérifie votre session Stripe avant d'activer l'accès premium et de rouvrir la bonne analyse.",
};

type MerciPageProps = {
  searchParams: Promise<{
    session_id?: string | string[] | undefined;
    sessionId?: string | string[] | undefined;
  }>;
};

function readFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }

  return value?.trim() || null;
}

export default async function MerciPage({ searchParams }: MerciPageProps) {
  const params = await searchParams;
  const initialSessionId =
    readFirstParam(params.session_id) ?? readFirstParam(params.sessionId);

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background:
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.1), transparent 30%), var(--bg-base)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "560px",
          padding: "40px 32px",
          borderRadius: "28px",
          border: "1px solid rgba(0, 212, 255, 0.18)",
          background:
            "linear-gradient(160deg, rgba(0, 212, 255, 0.07) 0%, rgba(12, 17, 23, 0.98) 60%)",
          boxShadow:
            "0 0 0 1px rgba(0,212,255,0.06) inset, 0 32px 80px rgba(0,0,0,0.32)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
          }}
        />

        <MerciRedirectState initialSessionId={initialSessionId} />
      </section>
    </main>
  );
}
