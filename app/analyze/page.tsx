import type { Metadata } from "next";
import { Suspense } from "react";
import AnalyzeExperience from "@/components/analyze-experience";

export const metadata: Metadata = {
  title: "Analyser une vidéo — Attentiq",
  description:
    "URL TikTok, YouTube Shorts, Reel Instagram ou Snapchat — vidéo de moins de 60 s. Aperçu gratuit en 60 à 90 secondes.",
};

export default function AnalyzePage() {
  return (
    <Suspense>
      <AnalyzeExperience />
    </Suspense>
  );
}
