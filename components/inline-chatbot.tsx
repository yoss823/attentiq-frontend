"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  buildWelcomeMessage,
  type ChatDiagnosticContext,
  type ChatTurn,
} from "@/lib/chat-context";

type ChatMessage = ChatTurn & {
  id: string;
};

const SUGGESTED_PROMPTS = [
  "Pourquoi les gens décrochent si vite ?",
  "Par où commencer ?",
  "C'est grave ou normal ?",
  "Quel est mon problème principal ?",
  "Donne-moi un plan en 3 points",
  "Exemple concret de ce que je peux changer",
];

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: crypto.randomUUID(), role, content };
}

type InlineChatbotProps = {
  diagnosticContext: ChatDiagnosticContext;
  /** Bloc dans le flux de page (défaut). */
  variant?: "embedded" | "floating";
  defaultOpen?: boolean;
  title?: string;
  subtitle?: string;
  suggestedPrompts?: string[];
  footerNote?: string;
  maxAssistantReplies?: number;
  paywallHref?: string;
  showAttentionNudge?: boolean;
};

export default function InlineChatbot({
  diagnosticContext,
  variant = "embedded",
  defaultOpen = false,
  title = "Assistant post-diagnostic",
  subtitle = "Posez vos questions sur ce diagnostic précis",
  suggestedPrompts = SUGGESTED_PROMPTS,
  footerNote = "Cet assistant est limité à votre diagnostic actuel.",
  maxAssistantReplies = 1,
  paywallHref = "/videos#tarifs",
  showAttentionNudge = true,
}: InlineChatbotProps) {
  const isFloating = variant === "floating";
  const [isOpen, setIsOpen] = useState(() =>
    isFloating ? true : defaultOpen
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasUserMessages = messages.some((m) => m.role === "user");
  const assistantRepliesCount = messages.filter((m) => m.role === "assistant").length;
  const hasReachedReplyLimit = assistantRepliesCount >= maxAssistantReplies;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSending, isOpen]);

  async function submitPrompt(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    if (hasReachedReplyLimit) {
      setMessages((prev) => [
        ...prev,
        createMessage(
          "assistant",
          maxAssistantReplies <= 1
            ? "Vous avez déjà votre réponse clé sur le teaser gratuit. Pour aller plus loin (timeline complète, détail des causes, plan étendu), débloquez la formule payante."
            : `Vous avez atteint la limite de ${maxAssistantReplies} réponses pour ce rapport. Ouvrez une nouvelle analyse ou le rapport suivant pour continuer.`
        ),
      ]);
      return;
    }

    const userMsg = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const history: ChatTurn[] = messages.map(({ role, content }) => ({
        role,
        content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          diagnostic: diagnosticContext,
        }),
      });

      const data = (await res.json()) as { reply?: string; userMessage?: string };
      const reply = data.reply ?? data.userMessage ?? "Je n'ai pas pu générer de réponse.";
      setMessages((prev) => [...prev, createMessage("assistant", reply)]);
    } catch {
      setMessages((prev) => [
        ...prev,
        createMessage(
          "assistant",
          "Une erreur est survenue. Vérifiez votre connexion et réessayez."
        ),
      ]);
    } finally {
      setIsSending(false);
    }
  }

  const showSection = !isFloating || isOpen;

  return (
    <>
      {isFloating && !isOpen && (
        <button
          type="button"
          aria-label="Ouvrir l'assistant Attentiq"
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "22px",
            right: "22px",
            zIndex: 70,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 22px 14px 18px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            fontWeight: 900,
            fontSize: "14px",
            letterSpacing: "-0.02em",
            color: "#041017",
            background: "linear-gradient(135deg, var(--accent), #79e7ff)",
            boxShadow:
              "0 14px 44px rgba(0, 212, 255, 0.42), 0 0 0 1px rgba(255,255,255,0.14)",
            fontFamily: "inherit",
            animation: "attentiq-chat-fab 2.4s ease-in-out infinite",
          }}
        >
          <span style={{ fontSize: "22px", lineHeight: 1 }} aria-hidden>
            💬
          </span>
          Assistant
        </button>
      )}

      {showSection && (
        <section
          style={{
            marginBottom: isFloating ? 0 : "14px",
            borderRadius: "22px",
            border: "1px solid var(--border)",
            background:
              "linear-gradient(180deg, rgba(12,17,23,0.98) 0%, rgba(7,11,16,0.97) 100%)",
            overflow: "hidden",
            ...(isFloating && isOpen
              ? {
                  position: "fixed",
                  bottom: "22px",
                  right: "22px",
                  width: "min(400px, calc(100vw - 28px))",
                  maxHeight: "min(560px, 82vh)",
                  zIndex: 65,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow:
                    "0 24px 70px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 212, 255, 0.14)",
                }
              : {}),
          }}
        >
          {isFloating && isOpen && (
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                background: "rgba(0, 212, 255, 0.08)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  minWidth: 0,
                }}
              >
                <span style={{ fontSize: "20px", lineHeight: 1 }} aria-hidden>
                  💬
                </span>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "14px",
                      color: "var(--text-primary)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      marginTop: "2px",
                      lineHeight: 1.35,
                    }}
                  >
                    {subtitle}
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Réduire le chat"
                onClick={() => setIsOpen(false)}
                style={{
                  flexShrink: 0,
                  width: "36px",
                  height: "36px",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.06)",
                  color: "var(--text-primary)",
                  fontSize: "18px",
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
          )}

          {!isFloating && !isOpen && showAttentionNudge && !nudgeDismissed && (
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                background: "rgba(0, 212, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                style={{
                  border: "none",
                  background: "none",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Tu as des questions sur l&apos;analyse ? Clique ici.
              </button>
              <button
                type="button"
                onClick={() => setNudgeDismissed(true)}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text-secondary)",
                  fontSize: "11px",
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                Masquer
              </button>
            </div>
          )}

          {!isFloating && (
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "20px 24px",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "12px",
                    background: "rgba(0,212,255,0.1)",
                    border: "1px solid rgba(0,212,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "17px",
                    flexShrink: 0,
                  }}
                >
                  💬
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      marginTop: "1px",
                    }}
                  >
                    {subtitle}
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  flexShrink: 0,
                  transition: "transform 0.22s",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ↓
              </div>
            </button>
          )}

          {isOpen && (
            <div
              style={{
                borderTop: isFloating ? "none" : "1px solid var(--border)",
                ...(isFloating
                  ? {
                      flex: 1,
                      minHeight: 0,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }
                  : {}),
              }}
            >
              {/* messages area */}
              <div
                style={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  minHeight: isFloating ? 0 : "120px",
                  maxHeight: isFloating ? "none" : "420px",
                  flex: isFloating ? 1 : undefined,
                  overflowY: "auto",
                }}
              >
            {/* welcome */}
            {messages.length === 0 && (
              <div
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "82%",
                  padding: "14px 16px",
                  borderRadius: "18px 18px 18px 6px",
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    lineHeight: 1.7,
                    color: "var(--text-primary)",
                  }}
                >
                  {buildWelcomeMessage(diagnosticContext)}
                </p>
              </div>
            )}

            {/* chat messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "13px 16px",
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 6px 18px"
                        : "18px 18px 18px 6px",
                    fontSize: "14px",
                    lineHeight: 1.75,
                    color:
                      msg.role === "user"
                        ? "#041017"
                        : "var(--text-primary)",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, var(--accent), #59d4ff)"
                        : "rgba(255,255,255,0.03)",
                    border:
                      msg.role === "user"
                        ? "none"
                        : "1px solid var(--border)",
                    fontWeight: msg.role === "user" ? 600 : 400,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* suggested prompts (only before first user message) */}
            {!hasUserMessages && (
              <div style={{ display: "grid", gap: "8px", marginTop: "4px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                  }}
                >
                  Questions suggérées
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "8px",
                  }}
                >
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={isSending}
                      onClick={() => void submitPrompt(prompt)}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: "14px",
                        border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        lineHeight: 1.5,
                        cursor: isSending ? "not-allowed" : "pointer",
                        opacity: isSending ? 0.5 : 1,
                        transition: "border-color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSending)
                          (e.currentTarget as HTMLButtonElement).style.borderColor =
                            "rgba(0,212,255,0.35)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          "var(--border)";
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* loading indicator */}
            {isSending && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 16px",
                    borderRadius: "18px 18px 18px 6px",
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                  }}
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "999px",
                      background: "var(--accent)",
                      animation: "glow-pulse 1.2s ease-in-out infinite",
                    }}
                  />
                  Réponse en cours…
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* input area */}
          <div
            style={{
              padding: "14px 16px",
              borderTop: "1px solid var(--border)",
              background: "rgba(5,8,13,0.9)",
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submitPrompt(input);
              }}
              style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void submitPrompt(input);
                  }
                }}
                rows={2}
                placeholder="Posez une question sur ce diagnostic…"
                disabled={hasReachedReplyLimit}
                style={{
                  flex: 1,
                  resize: "none",
                  padding: "12px 14px",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="submit"
                disabled={isSending || !input.trim() || hasReachedReplyLimit}
                style={{
                  flexShrink: 0,
                  border: "none",
                  borderRadius: "14px",
                  background:
                    isSending || !input.trim() || hasReachedReplyLimit
                      ? "rgba(255,255,255,0.08)"
                      : "linear-gradient(135deg, var(--accent), #59d4ff)",
                  color:
                    isSending || !input.trim() || hasReachedReplyLimit
                      ? "var(--text-secondary)"
                      : "#041017",
                  padding: "12px 18px",
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor:
                    isSending || !input.trim() || hasReachedReplyLimit
                      ? "not-allowed"
                      : "pointer",
                  whiteSpace: "nowrap",
                  alignSelf: "flex-end",
                  marginBottom: "2px",
                }}
              >
                Envoyer
              </button>
            </form>
          </div>

          {/* footer note */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{ fontSize: "12px", color: "var(--text-secondary)" }}
            >
              {footerNote}
            </span>
            <Link
              href={paywallHref}
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--accent)",
                textDecoration: "none",
              }}
            >
              {maxAssistantReplies <= 1
                ? "Voir les offres premium →"
                : "Analyser un autre contenu →"}
            </Link>
          </div>
        </div>
          )}
        </section>
      )}
    </>
  );
}
