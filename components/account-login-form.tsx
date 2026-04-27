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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedSession = useMemo(
    () => sessionEmail?.trim().toLowerCase() ?? "",
    [sessionEmail]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/account/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: trimmed }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        const code = payload?.error;
        if (code === "ACCOUNT_NOT_FOUND") {
          router.push(
            `/compte?email=${encodeURIComponent(trimmed)}&loginError=not_found`
          );
          return;
        }
        router.push("/compte?loginError=unknown");
        return;
      }

      router.push(`/compte?email=${encodeURIComponent(trimmed)}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

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
        onChange={(e) => setEmail(e.target.value)}
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
        {isSubmitting ? "Connexion…" : "Se connecter"}
      </button>

      {normalizedSession &&
        email.trim().toLowerCase() === normalizedSession && (
          <p
            style={{
              gridColumn: "1 / -1",
              margin: 0,
              fontSize: "12px",
              lineHeight: 1.6,
              color: "var(--text-secondary)",
            }}
          >
            Vous etes deja connecte avec cet email. Changez l&apos;adresse
            ci-dessus si vous voulez ouvrir un autre compte.
          </p>
        )}
    </form>
  );
}
