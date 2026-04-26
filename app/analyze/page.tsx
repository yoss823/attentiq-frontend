import type { Metadata } from "next";
import AnalyzeExperience from "@/components/analyze-experience";

export const metadata: Metadata = {
  title: "Analyser une vidéo — Attentiq",
  description:
    "Collez une URL TikTok, Instagram ou YouTube. Le diagnostic de rétention arrive en 60 à 90 secondes.",
};

export default function AnalyzePage() {
  return <AnalyzeExperience />;
}
