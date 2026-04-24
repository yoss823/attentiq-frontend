"use client";

import { V2AnalysisResult } from "@/types/v2";
import DiagnosticHero from "./DiagnosticHero";
import MetricsDashboard from "./MetricsDashboard";
import ActionsList from "./ActionsList";
import BoundedAssistant from "./BoundedAssistant";

interface ResultV2Props {
  result: V2AnalysisResult;
  jobId?: string;
}

export default function ResultV2({ result, jobId }: ResultV2Props) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
        {/* Section 1 — Diagnostic dominant */}
        <DiagnosticHero diagnostic={result.diagnostic} />

        {/* Section 2 — Mini-dashboard */}
        <MetricsDashboard metrics={result.metrics} />

        {/* Section 3 — Exactement 3 actions */}
        <ActionsList actions={result.actions} />

        {/* Section 4 — Assistant borné */}
        <BoundedAssistant result={result} jobId={jobId} />
      </div>
    </div>
  );
}
