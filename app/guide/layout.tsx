import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Comprendre le diagnostic | Attentiq",
  description:
    "Comment lire le score, le résumé et les actions — pour vidéo courte, texte ou image. Transparence sur ce que le rapport contient ou non.",
};

export default function GuideLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
