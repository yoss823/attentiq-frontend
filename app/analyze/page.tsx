'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  analyzeVideo,
  getJobStatus,
  isTikTokUrl,
  type JobStatusResponse,
  type JobStatus,
} from '@/lib/api';
import { POLLING_INTERVAL_MS, POLLING_MAX_ATTEMPTS } from '@/lib/constants';
import PremiumPaywall from './PremiumPaywall';

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'En attente…',
  processing: 'Analyse en cours…',
  completed: 'Analyse terminée !',
  failed: 'Échec de l\'analyse',
};

const STATUS_COLORS: Record<JobStatus, string> = {
  pending: 'text-yellow-400',
  processing: 'text-brand-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AnalyzePage() {
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<JobStatusResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [pollAttempts, setPollAttempts] = useState(0);
  const [isPremium] = useState(false); // TODO: wire to auth/subscription check

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -------------------------------------------------------------------------
  // Polling
  // -------------------------------------------------------------------------

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const poll = useCallback(
    async (id: string) => {
      try {
        const data = await getJobStatus(id);
        setJobData(data);
        setPollAttempts((n) => n + 1);

        if (data.status === 'completed' || data.status === 'failed') {
          stopPolling();
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    },
    [stopPolling]
  );

  useEffect(() => {
    if (!jobId) return;

    // Immediate first poll
    poll(jobId);

    pollingRef.current = setInterval(() => {
      if (pollAttempts >= POLLING_MAX_ATTEMPTS) {
        stopPolling();
        setSubmitError(
          'L\'analyse prend trop de temps. Veuillez réessayer plus tard.'
        );
        return;
      }
      poll(jobId);
    }, POLLING_INTERVAL_MS);

    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');
    setSubmitError('');

    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError('Veuillez entrer une URL TikTok.');
      return;
    }
    if (!isTikTokUrl(trimmed)) {
      setUrlError('L\'URL doit provenir de tiktok.com.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await analyzeVideo(trimmed);
      setJobId(res.job_id);
      setJobData({ job_id: res.job_id, status: res.status });
      setPollAttempts(0);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Erreur lors de la soumission.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    stopPolling();
    setUrl('');
    setUrlError('');
    setJobId(null);
    setJobData(null);
    setSubmitError('');
    setPollAttempts(0);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white hover:text-brand-300 transition-colors"
        >
          Attentiq
        </Link>
        <Link
          href="/checkout/rapport-complet"
          className="text-sm font-medium text-brand-300 hover:text-white transition-colors"
        >
          Voir les tarifs →
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pt-16 pb-24">
        <h1 className="text-4xl font-extrabold text-center mb-3">
          Analyser une vidéo TikTok
        </h1>
        <p className="text-slate-400 text-center mb-10">
          Collez l&apos;URL d&apos;une vidéo TikTok pour obtenir votre analyse d&apos;attention.
        </p>

        {/* Form */}
        {!jobId && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="tiktok-url"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                URL de la vidéo TikTok
              </label>
              <input
                id="tiktok-url"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setUrlError('');
                }}
                placeholder="https://www.tiktok.com/@username/video/..."
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                  urlError ? 'border-red-500' : 'border-white/10'
                }`}
                disabled={submitting}
                autoComplete="off"
                spellCheck={false}
              />
              {urlError && (
                <p className="mt-2 text-sm text-red-400">{urlError}</p>
              )}
            </div>

            {submitError && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-brand-900/50 hover:shadow-brand-700/50 hover:-translate-y-0.5 disabled:hover:translate-y-0"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Soumission…
                </span>
              ) : (
                'Lancer l\'analyse'
              )}
            </button>
          </form>
        )}

        {/* Job status */}
        {jobData && (
          <div className="mt-8 space-y-6">
            <StatusCard jobData={jobData} />

            {/* Results */}
            {jobData.status === 'completed' && jobData.result && (
              <ResultCard result={jobData.result} isPremium={isPremium} />
            )}

            {/* Paywall — shown to free users after analysis completes */}
            {jobData.status === 'completed' && jobData.result && !isPremium && (
              <PremiumPaywall />
            )}

            {/* Reset */}
            {(jobData.status === 'completed' || jobData.status === 'failed') && (
              <button
                onClick={handleReset}
                className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors"
              >
                ← Analyser une autre vidéo
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function StatusCard({ jobData }: { jobData: JobStatusResponse }) {
  const isProcessing =
    jobData.status === 'pending' || jobData.status === 'processing';

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        {isProcessing && <Spinner />}
        <span
          className={`font-semibold text-lg ${STATUS_COLORS[jobData.status]}`}
        >
          {STATUS_LABELS[jobData.status]}
        </span>
      </div>

      {/* Progress bar */}
      {isProcessing && (
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-brand-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${jobData.progress ?? 10}%` }}
          />
        </div>
      )}

      {jobData.status === 'failed' && jobData.error && (
        <p className="text-red-400 text-sm mt-2">{jobData.error}</p>
      )}

      <p className="text-slate-500 text-xs mt-3">
        Job ID: <code className="text-slate-400">{jobData.job_id}</code>
      </p>
    </div>
  );
}

function getShortSummary(summary: string): string {
  // Return at most the first 2 sentences
  const sentences = summary.match(/[^.!?]+[.!?]+/g) ?? [];
  if (sentences.length === 0) return summary;
  return sentences.slice(0, 2).join(' ').trim();
}

function ResultCard({
  result,
  isPremium,
}: {
  result: NonNullable<JobStatusResponse['result']>;
  isPremium: boolean;
}) {
  const displayedSummary = isPremium
    ? result.summary
    : getShortSummary(result.summary);

  const displayedDropMoments = isPremium
    ? result.drop_moments
    : result.drop_moments.slice(0, 3);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
      {/* Title & duration — always visible */}
      {result.title && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
            Vidéo analysée
          </p>
          <p className="text-white font-medium">{result.title}</p>
          {result.duration_seconds && (
            <p className="text-slate-400 text-sm">
              Durée : {result.duration_seconds}s
            </p>
          )}
        </div>
      )}

      {/* Summary — short (2 sentences) for free, full for premium */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
          Résumé
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">{displayedSummary}</p>
      </div>

      {/* Recommendations — premium only */}
      {isPremium && result.recommendations.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
            Recommandations
          </p>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-brand-400 mt-0.5 shrink-0">✓</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Peak moments — premium only */}
      {isPremium && result.peak_moments.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
            Moments forts 🔥
          </p>
          <div className="flex flex-wrap gap-2">
            {result.peak_moments.map((m) => (
              <span
                key={m.second}
                className="bg-green-900/40 border border-green-700/40 text-green-300 text-xs px-3 py-1 rounded-full"
              >
                {m.second}s — score {m.score}
                {m.label ? ` (${m.label})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Drop moments — max 3 for free, all for premium */}
      {displayedDropMoments.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
            Moments de décrochage 📉
          </p>
          <div className="flex flex-wrap gap-2">
            {displayedDropMoments.map((m) => (
              <span
                key={m.second}
                className="bg-red-900/40 border border-red-700/40 text-red-300 text-xs px-3 py-1 rounded-full"
              >
                {m.second}s — score {m.score}
                {m.label ? ` (${m.label})` : ''}
              </span>
            ))}
          </div>
          {!isPremium && result.drop_moments.length > 3 && (
            <p className="text-slate-500 text-xs mt-2">
              + {result.drop_moments.length - 3} autres moments masqués — passez à la version premium
            </p>
          )}
        </div>
      )}
    </div>
  );
}
