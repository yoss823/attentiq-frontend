"use client";

import dynamic from "next/dynamic";

const ChatExperience = dynamic(() => import("@/components/chat-experience"), {
  ssr: false,
  loading: () => (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, rgba(0,212,255,0.14), transparent 32%), #060a0f",
        color: "var(--text-secondary)",
      }}
    >
      Chargement de l&apos;assistant…
    </main>
  ),
});

export default function ChatPageShell() {
  return <ChatExperience />;
}
