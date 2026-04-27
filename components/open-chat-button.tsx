"use client";

import { useRouter } from "next/navigation";
import {
  CHAT_SESSION_STORAGE_KEY,
  type ChatDiagnosticContext,
} from "@/lib/chat-context";

type OpenChatButtonProps = {
  diagnosticContext: ChatDiagnosticContext;
  label?: string;
  variant?: "solid" | "link";
};

export default function OpenChatButton({
  diagnosticContext,
  label = "Ouvrir l'assistant",
  variant = "solid",
}: OpenChatButtonProps) {
  const router = useRouter();

  function handleClick() {
    sessionStorage.setItem(
      CHAT_SESSION_STORAGE_KEY,
      JSON.stringify(diagnosticContext)
    );
    const q = diagnosticContext.requestId
      ? `?jobId=${encodeURIComponent(diagnosticContext.requestId)}`
      : "";
    router.push(`/chat${q}`);
  }

  const styles =
    variant === "link"
      ? {
          border: "none",
          background: "transparent",
          color: "var(--text-secondary)",
          padding: 0,
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
        }
      : {
          border: "none",
          borderRadius: "14px",
          background: "linear-gradient(135deg, var(--accent), #6ce6ff)",
          color: "#05121a",
          padding: "13px 18px",
          fontSize: "14px",
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 18px 50px rgba(0,212,255,0.18)",
        };

  return (
    <button type="button" onClick={handleClick} style={styles}>
      {label}
    </button>
  );
}
