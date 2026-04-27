"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type AccountLoginFormProps = {
  initialEmail: string;
  sessionEmail: string | null;
};

export default function AccountLoginForm({
  initialEmail,
  sessionEmail,
}: AccountLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [rememberLongSession, setRememberLongSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const normalizedSession = useMemo(
    () => sessionEmail?.trim().toLowerCase() ?? "",
    [sessionEmail]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setRequestError(null);
    try {
      if (
        normalizedSession &&
        trimmed.toLowerCase() === normalizedSession
      ) {
        router.push(`/compte?email=${encodeURIComponent(trimmed)}`);
        router.refresh();
        return;
      }

      const res = await fetch("/api/account/magic/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: trimmed, remember: rememberLongSession }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        const code = payload?.error;
        if (code === "EMAIL_NOT_CONFIGURED") {
          setRequestError(
            "L'envoi d'email n'est pas configuré sur ce serveur (clé Resend manquante)."
          );
          return;
        }
        if (code === "EMAIL_SEND_FAILED") {
          setRequestError(
            "L'email de connexion n'a pas pu être envoyé. Réessayez dans un instant."
          );
          return;
        }
        setRequestError("Impossible d'envoyer le lien pour le moment. Réessayez.");
        return;
      }

      setMagicSent(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSameSessionEmail =
    Boolean(normalizedSession) &&
    email.trim().toLowerCase() === normalizedSession;

  return (
    <form
      onSubmit={onSubmit}
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
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setMagicSent(false);
          setRequestError(null);
        }}
        placeholder="votre email de paiement Stripe"
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
        disabled={isSubmitting}
        style={{
          minHeight: "54px",
          borderRadius: "999px",
          border: "none",
          padding: "0 18px",
          background: "linear-gradient(135deg, var(--accent), #79e7ff)",
          color: "#041017",
          fontSize: "14px",
          fontWeight: 900,
          cursor: isSubmitting ? "wait" : "pointer",
          opacity: isSubmitting ? 0.75 : 1,
        }}
      >
        {isSubmitting
          ? "Envoi…"
          : isSameSessionEmail
            ? "Ouvrir l&apos;espace client"
            : "Recevoir un lien"}
      </button>

      <label
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "13px",
          color: "var(--text-secondary)",
          userSelect: "none",
        }}
      >
        <input
          type="checkbox"
          checked={rememberLongSession}
          disabled={isSameSessionEmail}
          onChange={(e) => setRememberLongSession(e.target.checked)}
        />
        Rester connecte plus longtemps sur cet appareil (90 jours)
      </label>

      {isSameSessionEmail && (
        <p
          style={{
            gridColumn: "1 / -1",
            margin: 0,
            fontSize: "12px",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
        >
          Vous etes deja connecte avec cet email. Le tableau ci-dessous est
          votre espace client : faites defiler la page pour voir quota et
          historique.
        </p>
      )}

      {magicSent && (
        <div
          style={{
            gridColumn: "1 / -1",
            padding: "14px 16px",
            borderRadius: "18px",
            border: "1px solid rgba(52, 211, 153, 0.28)",
            background: "rgba(52, 211, 153, 0.08)",
            color: "#bbf7d0",
            fontSize: "13px",
            lineHeight: 1.65,
          }}
        >
          Si cet email correspond a un compte Attentiq, vous allez recevoir un lien
          de connexion (valable quelques minutes). Ouvrez-le sur cet appareil pour
          activer la session.
        </div>
      )}

      {requestError && (
        <div
          style={{
            gridColumn: "1 / -1",
            padding: "14px 16px",
            borderRadius: "18px",
            border: "1px solid rgba(251, 146, 60, 0.24)",
            background: "rgba(251, 146, 60, 0.08)",
            color: "#fdba74",
            fontSize: "13px",
            lineHeight: 1.65,
          }}
        >
          {requestError}
        </div>
      )}
    </form>
  );
}
