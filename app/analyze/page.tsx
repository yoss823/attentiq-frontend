'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  analyzeVideo,
  getJobStatus,
  isTikTokUrl,
  type JobStatusResponse,
  type JobStatus,
} from '@/lib/api';
import { POLLING_INTERVAL_MS, POLLING_MAX_ATTEMPTS } from '@/lib/constants';
import { getPremiumFromCookie } from '@/lib/premium';
import PremiumPaywall from './PremiumPaywall';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const STATUS_LABELS: Record<JobStatus, string> = {
  queued: 'En attente…',
  processing: 'Analyse en cours…',
  done: 'Analyse terminée !',
  error: "Échec de l'analyse",
};

const STATUS_COLORS: Record<JobStatus, string> = {
  queued: 'text-yellow-400',
  processing: 'text-brand-400',
  done: 'text-green-400',
  error: 'text-red-400',
};

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export default function AnalyzePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialJobId = searchParams.get('jobId');
  const initialVideoUrl = searchParams.get('videoUrl');

  const [url, setUrl] = useState(initialVideoUrl ?? '');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [jobId, setJobId] = useState<string | null>(initialJobId);
  const [videoUrl, setVideoUrl] = useState<string>(initialVideoUrl ?? '');
  const [jobData, setJobData] = useState<JobStatusResponse | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Premium                                                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setIsPremium(getPremiumFromCookie());
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Reset state when URL changes                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setSubmitError(null);
    setJobId(null);
    setJobData(null);
    setPollAttempts(0);
  }, [videoUrl]);

  /* ------------------------------------------------------------------------ */
  /* Polling                                                                  */
  /* ------------------------------------------------------------------------ */

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

        if (data.status === 'done' || data.status === 'error') {
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

    pollAttempts === 0 && poll(jobId);

    pollingRef.current = setInterval(() => {
      if (pollAttempts >= POLLING_MAX_ATTEMPTS) {
        stopPolling();
        setSubmitError(
          "L'analyse prend trop de temps. Veuillez réessayer plus tard."
        );
        return;
      }
      poll(jobId);
    }, POLLING_INTERVAL_MS);

    return () => stopPolling();
  }, [jobId, pollAttempts, poll, stopPolling]);

  /* ------------------------------------------------------------------------ */
  /* Submit                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setUrlError(null);
    setSubmitError(null);
    stopPolling();
    setJobId(null);
    setJobData(null);
    setPollAttempts(0);

    const trimmed = url.trim();

    if (!trimmed) {
      setUrlError('Veuillez entrer une URL TikTok.');
      return;
    }

    if (!isTikTokUrl(trimmed)) {
      setUrlError("L'URL doit provenir de tiktok.com.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await analyzeVideo(trimmed);

      setJobId(res.jobId);
      setVideoUrl(trimmed);
      setJobData({ id: res.jobId, status: 'queued' });
      setPollAttempts(0);

      const params = new URLSearchParams();
      params.set('jobId', res.jobId);
      params.set('videoUrl', trimmed);
      router.replace(`/analyze?${params.toString()}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Erreur lors de l'analyse."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
