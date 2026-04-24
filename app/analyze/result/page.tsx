"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalysisResult {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: {
    dominant_emotion?: string;
    confidence?: number;
    emotions?: Record<string, number>;
    summary?: string;
    recommendations?: string[];
  };
  error?: string;
}

// ─── Inner component (uses useSearchParams) ───────────────────────────────────

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("job_id");

  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError("No job ID provided.");
      setLoading(false);
      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    let attempts = 0;
    const maxAttempts = 30; // 30 × 2s = 60s timeout

    const poll = async () => {
      try {
        const res = await fetch(`${apiUrl}/jobs/${jobId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: AnalysisResult = await res.json();
        setData(json);

        if (json.status === "completed" || json.status === "failed") {
          setLoading(false);
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          setError("Analysis timed out. Please try again.");
          setLoading(false);
          return;
        }

        setTimeout(poll, 2000);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to fetch result: ${message}`);
        setLoading(false);
      }
    };

    poll();
  }, [jobId]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" />
        <p className="text-gray-400 text-sm">Analyzing… please wait</p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || data?.status === "failed") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-2">
            Analysis failed
          </h2>
          <p className="text-gray-300 text-sm mb-6">
            {error || data?.error || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => router.push("/analyze")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  const result = data?.result;

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Dominant emotion */}
        {result?.dominant_emotion && (
          <div className="text-center">
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">
              Dominant emotion
            </p>
            <h1 className="text-5xl font-bold capitalize text-white">
              {result.dominant_emotion}
            </h1>
            {result.confidence !== undefined && (
              <p className="text-gray-500 text-sm mt-2">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </p>
            )}
          </div>
        )}

        {/* Emotion breakdown */}
        {result?.emotions && Object.keys(result.emotions).length > 0 && (
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4">
              Emotion breakdown
            </h2>
            <ul className="space-y-3">
              {Object.entries(result.emotions)
                .sort(([, a], [, b]) => b - a)
                .map(([emotion, score]) => (
                  <li key={emotion}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-300">
                        {emotion}
                      </span>
                      <span className="text-gray-500">
                        {(score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(score * 100).toFixed(1)}%` }}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Summary */}
        {result?.summary && (
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-3">
              Summary
            </h2>
            <p className="text-gray-300 leading-relaxed">{result.summary}</p>
          </div>
        )}

        {/* Recommendations */}
        {result?.recommendations && result.recommendations.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-3">
              Recommendations
            </h2>
            <ul className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 text-gray-300 text-sm">
                  <span className="text-blue-400 mt-0.5">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => router.push("/analyze")}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl text-sm transition"
          >
            New analysis
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm transition"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page export — Suspense boundary required by Next.js 16 ──────────────────

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
