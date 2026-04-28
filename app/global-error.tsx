"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          background:
            "radial-gradient(circle at top, rgba(248, 113, 113, 0.12), transparent 28%), #070c12",
          color: "#e5edf5",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <main
          style={{
            width: "100%",
            maxWidth: "560px",
            borderRadius: "22px",
            border: "1px solid rgba(248, 113, 113, 0.24)",
            background:
              "linear-gradient(180deg, rgba(35, 14, 18, 0.84) 0%, rgba(9, 12, 18, 0.96) 100%)",
            padding: "24px",
            boxShadow: "0 24px 90px rgba(0, 0, 0, 0.38)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#fca5a5",
              fontWeight: 800,
            }}
          >
            Attentiq / Erreur d&apos;affichage
          </p>
          <h1
            style={{
              margin: "12px 0 0",
              fontSize: "clamp(1.6rem, 5vw, 2.1rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            Cette page n&apos;a pas pu se charger.
          </h1>
          <p
            style={{
              margin: "14px 0 0",
              lineHeight: 1.7,
              color: "rgba(229, 237, 245, 0.82)",
              fontSize: "14px",
            }}
          >
            Nous avons rencontre une erreur inattendue. Cliquez sur recharger, ou relancez une analyse.
          </p>
          {error?.message ? (
            <p
              style={{
                margin: "12px 0 0",
                fontSize: "12px",
                lineHeight: 1.6,
                color: "rgba(229, 237, 245, 0.55)",
              }}
            >
              Detail: {error.message}
            </p>
          ) : null}
          <div
            style={{
              marginTop: "18px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                border: "none",
                borderRadius: "999px",
                padding: "11px 18px",
                fontWeight: 800,
                cursor: "pointer",
                background: "linear-gradient(135deg, #22d3ee, #7dd3fc)",
                color: "#051018",
              }}
            >
              Recharger
            </button>
            <Link
              href="/analyze"
              style={{
                textDecoration: "none",
                borderRadius: "999px",
                padding: "11px 18px",
                fontWeight: 700,
                border: "1px solid rgba(229, 237, 245, 0.22)",
                color: "#e5edf5",
              }}
            >
              Nouvelle analyse
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
