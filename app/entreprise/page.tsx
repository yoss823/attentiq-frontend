"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type FormState = "idle" | "sending" | "success" | "error";

export default function EnterprisePage() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      fullName: formData.get("fullName"),
      workEmail: formData.get("workEmail"),
      phone: formData.get("phone"),
      company: formData.get("company"),
      supports: formData.get("supports"),
      monthlyVolume: formData.get("monthlyVolume"),
      projectDescription: formData.get("projectDescription"),
      preferredContact: formData.get("preferredContact"),
    };
    setState("sending");
    setMessage("");
    const response = await fetch("/api/enterprise-lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as
      | { ok?: boolean; userMessage?: string }
      | null;
    if (!response.ok || !data?.ok) {
      setState("error");
      setMessage(
        data?.userMessage ||
          "Impossible d'envoyer la demande. Merci de réessayer dans un instant."
      );
      return;
    }
    form.reset();
    setState("success");
    setMessage("Demande envoyée. Nous revenons vers vous rapidement.");
  }

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg-base)" }}>
      <div className="attentiq-shell attentiq-shell--narrow">
        <nav className="attentiq-nav" style={{ marginBottom: "1.5rem" }}>
          <Link href="/" className="attentiq-nav-link">
            ← Retour accueil
          </Link>
        </nav>

        <section
          style={{
            borderRadius: "24px",
            border: "1px solid rgba(192, 132, 252, 0.24)",
            background:
              "linear-gradient(180deg, rgba(192, 132, 252, 0.1) 0%, rgba(8, 12, 18, 0.96) 100%)",
            padding: "24px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontWeight: 800,
              color: "#e879f9",
            }}
          >
            Offre Entreprise
          </p>
          <h1
            style={{
              margin: "10px 0 12px",
              fontSize: "clamp(2rem, 6vw, 3rem)",
              lineHeight: 0.96,
              letterSpacing: "-0.06em",
              color: "var(--text-primary)",
            }}
          >
            Captation d&apos;attention sur tous vos supports
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.8 }}>
            Analyse de pages web, pages LinkedIn, plaquettes commerciales, scripts,
            visuels et contenus éditoriaux. Vous recevez une priorisation claire des
            frictions d&apos;attention à corriger.
          </p>
        </section>

        <section
          style={{
            borderRadius: "24px",
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.03)",
            padding: "22px",
          }}
        >
          <form onSubmit={onSubmit} style={{ display: "grid", gap: "12px" }}>
            <input name="fullName" required placeholder="Nom complet" className="attentiq-input" />
            <input name="workEmail" required type="email" placeholder="Email pro" className="attentiq-input" />
            <input name="phone" placeholder="Téléphone (optionnel)" className="attentiq-input" />
            <input name="company" required placeholder="Entreprise" className="attentiq-input" />
            <input
              name="supports"
              placeholder="Supports (site, LinkedIn, plaquettes, etc.)"
              className="attentiq-input"
            />
            <input
              name="monthlyVolume"
              placeholder="Nombre d'éléments à analyser / mois"
              className="attentiq-input"
            />
            <select name="preferredContact" className="attentiq-input" defaultValue="email">
              <option value="email">Contact préféré : Email</option>
              <option value="phone">Contact préféré : Téléphone</option>
              <option value="linkedin">Contact préféré : LinkedIn</option>
            </select>
            <textarea
              name="projectDescription"
              required
              rows={6}
              placeholder="Décrivez votre besoin (objectifs, type de contenus, urgence, KPI)."
              className="attentiq-input"
              style={{ resize: "vertical" }}
            />
            <button
              type="submit"
              disabled={state === "sending"}
              style={{
                border: "none",
                borderRadius: "999px",
                padding: "13px 18px",
                background: "linear-gradient(135deg, #c084fc, #e879f9)",
                color: "#190a22",
                fontSize: "15px",
                fontWeight: 900,
                cursor: state === "sending" ? "not-allowed" : "pointer",
                opacity: state === "sending" ? 0.75 : 1,
              }}
            >
              {state === "sending" ? "Envoi en cours..." : "Envoyer ma demande"}
            </button>
            {message ? (
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: state === "success" ? "#6ee7b7" : "#fda4af",
                }}
              >
                {message}
              </p>
            ) : null}
          </form>
        </section>
      </div>
    </main>
  );
}
