import type { Metadata } from "next";
import { Suspense } from "react";
import AnalyzeExperience from "@/components/analyze-experience";

export const metadata: Metadata = {
  title: "Analyser une vidéo — Attentiq",
  description:
    "Collez une URL TikTok publique. Le diagnostic de rétention arrive en 60 à 90 secondes.",
};

export default function AnalyzePage() {
  return (
    <Suspense>
      <AnalyzeExperience />
    </Suspense>
  );
}
