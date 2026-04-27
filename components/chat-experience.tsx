"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  CHAT_SESSION_STORAGE_KEY,
  buildOfflineChatReply,
  buildWelcomeMessage,
  getDemoChatDiagnosticContext,
  getPrimaryIssue,
  getScoreLabel,
  type ChatDiagnosticContext,
  type ChatTurn,
} from "@/lib/chat-context";

type ChatMessage = ChatTurn & {
  id: string;
  tone?: "default" | "muted";
};

const SUGGESTED_PROMPTS = [
  "Pourquoi les gens décrochent si vite ?",
  "Par quoi commencer ?",
  "C'est grave ou normal ?",
  "Quel est mon problème principal ?",
  "Donne-moi un plan en 3 points",
  "Exemple concret de ce que je peux changer",
];

function createMessage(
  role: ChatMessage["role"],
  content: string,
  tone: ChatMessage["tone"] = "default"
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    tone,
  };
}

function resolveInitialState(): {
  diagnosticContext: ChatDiagnosticContext;
  contextSource: "session" | "demo";
  notice: string | null;
} {
  const sessionPayload = sessionStorage.getItem(CHAT_SESSION_STORAGE_KEY);

  if (sessionPayload) {
    try {
      return {
        diagnosticContext: JSON.parse(sessionPayload) as ChatDiagnosticContext,
        contextSource: "session",
        notice: null,
      };
    } catch {
      sessionStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
    }
  }

  return {
    diagnosticContext: getDemoChatDiagnosticContext(),
    contextSource: "demo",
    notice: "Diagnostic de session introuvable. Exemple de démonstration chargé.",
  };
}

export default function ChatExperience() {
  const initialState = resolveInitialState();
  const [diagnosticContext] = useState<ChatDiagnosticContext>(
    initialState.diagnosticContext
  );
  const [contextSource] = useState<"session" | "demo">(
    initialState.contextSource
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(initialState.notice);
  const welcomeSeededRef = useRef(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const resultHref = diagnosticContext.metadata?.url
    ? `/result?url=${encodeURIComponent(diagnosticContext.metadata.url)}`
    : "/analyze";

  useEffect(() => {
    if (welcomeSeededRef.current) {
      return;
    }

    setMessages([createMessage("assistant", buildWelcomeMessage(diagnosticContext))]);
    welcomeSeededRef.current = true;
  }, [diagnosticContext]);

  const scrollToBottom = useEffectEvent(() => {
    const feed = feedRef.current;
    if (!feed) return;

    feed.scrollTo({
      top: feed.scrollHeight,
      behavior: "smooth",
    });
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isSending]);

  async function submitPrompt(rawPrompt: string) {
    const prompt = rawPrompt.trim();
    if (!prompt || isSending || !diagnosticContext) {
      return;
    }

    const nextUserMessage = createMessage("user", prompt);
    const optimisticMessages = [...messages, nextUserMessage];

    setMessages(optimisticMessages);
    setInput("");
    setIsSending(true);
    setNotice(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          history: optimisticMessages.map(({ role, content }) => ({
            role,
            content,
          })),
          diagnostic: diagnosticContext,
        }),
      });

      const payload = (await response.json()) as {
        reply?: string;
        provider?: "openai" | "groq" | "fallback";
        userMessage?: string;
      };

      if (!response.ok || !payload.reply) {
        throw new Error(
          payload.userMessage ||
            "Réponse indisponible pour le moment. Je reste sur le diagnostic actuel."
        );
      }

      const reply = payload.reply;

      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          reply,
          payload.provider === "fallback" ? "muted" : "default"
        ),
      ]);

      if (payload.provider === "fallback") {
        setNotice(
          "Réponses de secours (règles locales). Pour un dialogue adapté à chaque question, ajoutez une clé d'API d'assistant dans les variables d'environnement du service sur Railway."
        );
      }
    } catch {
      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          buildOfflineChatReply(prompt, diagnosticContext),
          "muted"
        ),
      ]);
      setNotice(
        "L'assistant modèle est indisponible. Réponse locale basée uniquement sur le diagnostic."
      );
    } finally {
      setIsSending(false);
    }
  }

  const diagnostic = diagnosticContext.diagnostic;
  const hasUserMessages = messages.some((message) => message.role === "user");
  const score = diagnostic?.retention_score;
  const primaryIssue = getPrimaryIssue(diagnosticContext);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(0,212,255,0.14), transparent 32%), linear-gradient(180deg, #05080d 0%, #060a0f 48%, #04070c 100%)",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 68%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "920px",
          margin: "0 auto",
          padding: "24px 16px 56px",
        }}
      >
        <nav
          className="rise d1"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href={resultHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.04)",
                fontSize: "12px",
              }}
            >
              ←
            </span>
            Retour au diagnostic
          </Link>

          <span
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent)",
              border: "1px solid var(--border-accent)",
              background: "rgba(0,212,255,0.08)",
            }}
          >
            Post-diagnostic assistant
          </span>
        </nav>

        <header className="rise d2" style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              marginBottom: "14px",
            }}
          >
            RetentionScan / Attentiq
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2rem, 8vw, 3.8rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.06em",
              fontWeight: 800,
              maxWidth: "12ch",
            }}
          >
            Posez vos questions sur votre diagnostic
          </h1>
          <p
            style={{
              marginTop: "14px",
              maxWidth: "580px",
              fontSize: "16px",
              lineHeight: 1.75,
              color: "var(--text-secondary)",
            }}
          >
            Je réponds uniquement à partir de votre rapport. Pas de
            généralités.
          </p>
        </header>

        <section
          className="rise d3"
          style={{
            display: "grid",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              padding: "18px",
              borderRadius: "22px",
              border: "1px solid var(--border-accent)",
              background:
                "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(12,17,23,0.92) 65%)",
              boxShadow: "0 24px 80px rgba(0,212,255,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "14px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    marginBottom: "8px",
                  }}
                >
                  Diagnostic chargé
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {diagnosticContext?.metadata?.author && (
                    <span
                      style={{
                        padding: "5px 11px",
                        borderRadius: "999px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid var(--border)",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                    >
                      {diagnosticContext.metadata.author.startsWith("@")
                        ? diagnosticContext.metadata.author
                        : `@${diagnosticContext.metadata.author}`}
                    </span>
                  )}
                  {score != null && (
                    <span
                      style={{
                        padding: "5px 11px",
                        borderRadius: "999px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--border)",
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {score.toFixed(1)}/10 · {getScoreLabel(score)}
                    </span>
                  )}
                  {diagnosticContext?.partial && (
                    <span
                      style={{
                        padding: "5px 11px",
                        borderRadius: "999px",
                        background: "rgba(251,146,60,0.08)",
                        border: "1px solid rgba(251,146,60,0.24)",
                        fontSize: "13px",
                        color: "#fb923c",
                      }}
                    >
                      Analyse partielle
                    </span>
                  )}
                </div>
              </div>

              <span
                style={{
                  padding: "5px 11px",
                  borderRadius: "999px",
                  background:
                    contextSource === "demo"
                      ? "rgba(251,146,60,0.08)"
                      : "rgba(0,212,255,0.08)",
                  border:
                    contextSource === "demo"
                      ? "1px solid rgba(251,146,60,0.2)"
                      : "1px solid var(--border-accent)",
                  fontSize: "12px",
                  color:
                    contextSource === "demo" ? "#fb923c" : "var(--accent)",
                }}
              >
                {contextSource === "demo"
                  ? "Contexte de démonstration"
                  : "Contexte de session"}
              </span>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: "15px",
                lineHeight: 1.8,
                color: "var(--text-primary)",
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>
                Problème principal :
              </span>{" "}
              {primaryIssue}
            </p>
          </div>

          {notice && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                border: "1px solid rgba(251,146,60,0.26)",
                background: "rgba(251,146,60,0.06)",
                color: "#fb923c",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              {notice}
            </div>
          )}
        </section>

        <section
          className="rise d4"
          style={{
            borderRadius: "28px",
            border: "1px solid var(--border)",
            background: "rgba(8,12,18,0.88)",
            overflow: "hidden",
            boxShadow: "0 24px 90px rgba(0,0,0,0.28)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "18px 18px 16px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Session de questions
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                }}
              >
                Réponses courtes, actionnables, uniquement basées sur le rapport.
              </p>
            </div>

            <span
              style={{
                minWidth: "10px",
                minHeight: "10px",
                borderRadius: "999px",
                background: isSending ? "#f59e0b" : "var(--accent)",
                boxShadow: isSending
                  ? "0 0 20px rgba(245,158,11,0.4)"
                  : "0 0 20px rgba(0,212,255,0.5)",
              }}
            />
          </div>

          <div
            ref={feedRef}
            style={{
              display: "grid",
              gap: "14px",
              padding: "18px",
              minHeight: "46vh",
              maxHeight: "62vh",
              overflowY: "auto",
            }}
          >
            {messages.map((message) => {
              const isAssistant = message.role === "assistant";
              return (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    justifyContent: isAssistant ? "flex-start" : "flex-end",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "88%",
                      padding: "14px 16px",
                      borderRadius: isAssistant
                        ? "20px 20px 20px 8px"
                        : "20px 20px 8px 20px",
                      border: isAssistant
                        ? `1px solid ${
                            message.tone === "muted"
                              ? "rgba(251,146,60,0.22)"
                              : "var(--border)"
                          }`
                        : "1px solid rgba(0,212,255,0.14)",
                      background: isAssistant
                        ? message.tone === "muted"
                          ? "rgba(251,146,60,0.05)"
                          : "rgba(255,255,255,0.035)"
                        : "linear-gradient(135deg, rgba(0,212,255,0.18), rgba(16,74,98,0.36))",
                      color: "var(--text-primary)",
                      whiteSpace: "pre-wrap",
                      fontSize: "15px",
                      lineHeight: 1.75,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: isAssistant
                          ? message.tone === "muted"
                            ? "#fb923c"
                            : "var(--text-secondary)"
                          : "#8be8ff",
                        marginBottom: "8px",
                        fontWeight: 700,
                      }}
                    >
                      {isAssistant ? "Assistant" : "Vous"}
                    </div>
                    {message.content}
                  </div>
                </div>
              );
            })}

            {!hasUserMessages && (
              <div
                style={{
                  display: "grid",
                  gap: "10px",
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                  }}
                >
                  Questions suggérées
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={isSending}
                      onClick={() => submitPrompt(prompt)}
                      style={{
                        textAlign: "left",
                        padding: "14px 16px",
                        borderRadius: "16px",
                        border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                        lineHeight: 1.5,
                        cursor: isSending ? "not-allowed" : "pointer",
                        opacity: isSending ? 0.55 : 1,
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isSending && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "13px 16px",
                    borderRadius: "18px 18px 18px 8px",
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
          </div>

          <div
            style={{
              padding: "16px",
              borderTop: "1px solid var(--border)",
              background: "rgba(5,8,13,0.9)",
            }}
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void submitPrompt(input);
              }}
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submitPrompt(input);
                  }
                }}
                rows={3}
                placeholder="Posez une question sur ce diagnostic précis…"
                style={{
                  width: "100%",
                  resize: "vertical",
                  minHeight: "96px",
                  padding: "14px 16px",
                  borderRadius: "18px",
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--text-primary)",
                  fontSize: "15px",
                  lineHeight: 1.6,
                  outline: "none",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Réponses courtes, calmes, limitées au diagnostic chargé.
                </p>
                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  style={{
                    border: "none",
                    borderRadius: "14px",
                    background: isSending || !input.trim()
                      ? "rgba(255,255,255,0.08)"
                      : "linear-gradient(135deg, var(--accent), #59d4ff)",
                    color: isSending || !input.trim()
                      ? "var(--text-secondary)"
                      : "#041017",
                    padding: "12px 18px",
                    fontSize: "14px",
                    fontWeight: 800,
                    cursor:
                      isSending || !input.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </section>

        <footer
          className="rise d5"
          style={{
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
            color: "var(--text-secondary)",
            fontSize: "13px",
          }}
        >
          <span>Cet assistant est limité à votre diagnostic actuel.</span>
          <Link
            href={resultHref}
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Analyser une autre vidéo
          </Link>
        </footer>
      </div>
    </main>
  );
}
