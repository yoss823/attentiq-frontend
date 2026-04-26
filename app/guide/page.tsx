import { Suspense } from "react";
import GuidePageClient from "@/components/guide-page-client";

function GuideFallback() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-secondary)",
        background: "var(--bg-base)",
      }}
    >
      Chargement du guide…
    </main>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={<GuideFallback />}>
      <GuidePageClient />
    </Suspense>
  );
}
