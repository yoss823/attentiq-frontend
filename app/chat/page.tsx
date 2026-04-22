import type { Metadata } from "next";
import ChatPageShell from "@/components/chat-page-shell";

export const metadata: Metadata = {
  title: "Assistant post-diagnostic - Attentiq",
  description:
    "Posez vos questions sur votre diagnostic RetentionScan et passez du rapport à l'action.",
};

export default function ChatPage() {
  return <ChatPageShell />;
}
