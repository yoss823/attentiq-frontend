'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://attentiq-backend-prod-production.up.railway.app';

type InputFormat = 'video' | 'text' | 'image';

interface Platform {
  id: string;
  label: string;
  domains: string[];
  placeholder: string;
}

const PLATFORMS: Platform[] = [
  {
    id: 'tiktok',
    label: 'TikTok',
    domains: ['tiktok.com', 'vm.tiktok.com'],
    placeholder: 'https://www.tiktok.com/@username/video/...',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    domains: ['instagram.com', 'instagr.am'],
    placeholder: 'https://www.instagram.com/reel/...',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    domains: ['youtube.com', 'youtu.be'],
    placeholder: 'https://www.youtube.com/watch?v=...',
  },
];

const LOADING_STEPS = [
  { message: '📥 Téléchargement de la vidéo...', duration: 15000 },
  { message: '🎙 Transcription de l\'audio...', duration: 20000 },
  { message: '🔍 Analyse image par image...', duration: 30000 },
  { message: '🧠 Génération du diagnostic...', duration: 25000 },
];

function isValidUrl(url: string, platform: string): boolean {
  try {
    const parsed = new URL(url);
    const config = PLATFORMS.find((p) => p.id === platform);
    if (!config) return false;
    return config.domains.some((domain) => parsed.hostname.includes(domain));
  } catch {
    return false;
  }
}

export default function AnalyzePage() {
  const router = useRouter();
  const [inputFormat, setInputFormat] = useState<InputFormat>('video');
  const [selectedPlatform, setSelectedPlatform] = useState('tiktok');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [videoMode, setVideoMode] = useState<'url' | 'upload'>('url');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  const advanceStep = (index: number) => {
    if (index < LOADING_STEPS.length - 1) {
      stepTimerRef.current = setTimeout(() => {
        setStepIndex(index + 1);
        advanceStep(index + 1);
      }, LOADING_STEPS[index].duration);
    }
  };

  const pollJob = async (jobId: string, attempts = 0) => {
    if (attempts > 30) {
      setError("L'analyse prend plus longtemps que prévu. Réessayez dans quelques instants.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/analyze/${jobId}`);
      const data = await res.json();
      if (data.status === 'success' && data.result) {
        sessionStorage.setItem('attentiq_result', JSON.stringify(data.result));
        router.push('/analyze/result');
        return;
      }
      if (data.status === 'error') {
        setError(data.error_message || 'Une erreur est survenue lors de l\'analyse.');
        setLoading(false);
        return;
      }
      pollingRef.current = setTimeout(() => pollJob(jobId, attempts + 1), 5000);
    } catch {
      pollingRef.current = setTimeout(() => pollJob(jobId, attempts + 1), 5000);
    }
  };

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (videoMode === 'upload') {
      if (!videoFile) {
        setError('Veuillez sélectionner une vidéo à uploader.');
        return;
      }
      startAnalysisVideoUpload(videoFile);
      return;
    }
    if (!url.trim()) {
      setError(`Veuillez entrer une URL ${PLATFORMS.find((p) => p.id === selectedPlatform)?.label}.`);
      return;
    }
    if (!isValidUrl(url.trim(), selectedPlatform)) {
      const config = PLATFORMS.find((p) => p.id === selectedPlatform);
      setError(`URL ${config?.label} invalide. Exemple : ${config?.placeholder}`);
      return;
    }
    startAnalysis({ url: url.trim(), platform: selectedPlatform });
  };

  const handleSubmitText = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!text.trim()) {
      setError('Veuillez entrer du texte à analyser.');
      return;
    }
    if (text.trim().length < 10) {
      setError('Le texte doit contenir au moins 10 caractères.');
      return;
    }
    startAnalysisText(text.trim());
  };

  const handleSubmitImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Veuillez sélectionner une image.');
      return;
    }
    startAnalysisImage(file);
  };

  const startAnalysis = async (payload: { url: string; platform: string }) => {
    setLoading(true);
    setStepIndex(0);
    setElapsedSeconds(0);
    elapsedRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    advanceStep(0);
    try {
      const res = await fetch(`${BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: crypto.randomUUID(),
          url: payload.url,
          platform: payload.platform,
          max_duration_seconds: 60,
          requested_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`);
      }
      const data = await res.json();
      if (!data.job_id) {
        throw new Error('Réponse invalide du serveur.');
      }
      pollJob(data.job_id);
    } catch (err: unknown) {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
      setLoading(false);
    }
  };

  const startAnalysisText = async (textContent: string) => {
    setLoading(true);
    setStepIndex(0);
    setElapsedSeconds(0);
    elapsedRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    advanceStep(0);
    try {
      const res = await fetch(`${BACKEND_URL}/analyze/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: crypto.randomUUID(),
          text: textContent,
          context: null,
        }),
      });
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`);
      }
      const data = await res.json();
      if (!data.job_id) {
        throw new Error('Réponse invalide du serveur.');
      }
      pollJob(data.job_id);
    } catch (err: unknown) {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
      setLoading(false);
    }
  };

  const startAnalysisImage = async (imageFile: File) => {
    setLoading(true);
    setStepIndex(0);
    setElapsedSeconds(0);
    elapsedRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    advanceStep(0);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      const res = await fetch(`${BACKEND_URL}/analyze/image`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`);
      }
      const data = await res.json();
      if (!data.job_id) {
        throw new Error('Réponse invalide du serveur.');
      }
      pollJob(data.job_id);
    } catch (err: unknown) {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
      setLoading(false);
    }
  };

  const startAnalysisVideoUpload = async (videoFile: File) => {
    setLoading(true);
    setStepIndex(0);
    setElapsedSeconds(0);
    elapsedRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    advanceStep(0);
    try {
      const formData = new FormData();
      formData.append('file', videoFile);
      const res = await fetch(`${BACKEND_URL}/analyze/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`);
      }
      const data = await res.json();
      if (!data.job_id) {
        throw new Error('Réponse invalide du serveur.');
      }
      pollJob(data.job_id);
    } catch (err: unknown) {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{
        background:
          "radial-gradient(circle at top, rgba(0, 212, 255, 0.16), transparent 28%), radial-gradient(circle at 82% 16%, rgba(251, 146, 60, 0.12), transparent 18%), var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>
            Analysez votre contenu
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Vidéo, texte ou image. Le diagnostic arrive en 60 à 90 secondes.
          </p>
        </div>

        {!loading ? (
          <div className="space-y-6">
            {/* Format selector */}
            <div className="flex gap-2">
              {(['video', 'text', 'image'] as InputFormat[]).map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => {
                    setInputFormat(format);
                    setUrl('');
                    setText('');
                    setFile(null);
                    setError('');
                  }}
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                  style={
                    inputFormat === format
                      ? {
                          background: "var(--accent)",
                          color: "#060a0f",
                          border: "1px solid var(--accent)",
                        }
                      : {
                          background: "var(--bg-surface)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                        }
                  }
                >
                  {format === 'video' && '🎬 Vidéo'}
                  {format === 'text' && '📝 Texte'}
                  {format === 'image' && '🖼️ Image'}
                </button>
              ))}
            </div>

            {/* Video form */}
            {inputFormat === 'video' && (
              <form onSubmit={handleSubmitUrl} className="space-y-4">
                <div className="flex gap-2">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlatform(platform.id);
                        setUrl('');
                        setError('');
                      }}
                      className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                      style={
                        selectedPlatform === platform.id
                          ? {
                              background: "var(--accent-dim)",
                              color: "var(--accent)",
                              border: "1px solid var(--border-accent)",
                            }
                          : {
                              background: "var(--bg-surface)",
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border)",
                            }
                      }
                    >
                      {platform.label}
                    </button>
                  ))}
                </div>

                {/* URL vs Upload toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setVideoMode('url');
                      setUrl('');
                      setVideoFile(null);
                      setError('');
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                    style={
                      videoMode === 'url'
                        ? {
                            background: "var(--accent-dim)",
                            color: "var(--accent)",
                            border: "1px solid var(--border-accent)",
                          }
                        : {
                            background: "var(--bg-surface)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border)",
                          }
                    }
                  >
                    🔗 URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoMode('upload');
                      setUrl('');
                      setVideoFile(null);
                      setError('');
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                    style={
                      videoMode === 'upload'
                        ? {
                            background: "var(--accent-dim)",
                            color: "var(--accent)",
                            border: "1px solid var(--border-accent)",
                          }
                        : {
                            background: "var(--bg-surface)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border)",
                          }
                    }
                  >
                    📤 Upload
                  </button>
                </div>

                {videoMode === 'url' ? (
                  <div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setError('');
                      }}
                      placeholder={PLATFORMS.find((p) => p.id === selectedPlatform)?.placeholder}
                      className="w-full rounded-xl px-4 py-4 text-sm focus:outline-none transition-colors"
                      style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                    {error && <p className="mt-2 text-xs leading-relaxed" style={{ color: "#f87171" }}>{error}</p>}
                  </div>
                ) : (
                  <div>
                    <div
                      onClick={() => videoFileInputRef.current?.click()}
                      className="rounded-xl p-8 text-center cursor-pointer transition-all"
                      style={{
                        border: "2px dashed var(--border-accent)",
                        background: "var(--bg-surface)",
                      }}
                    >
                      <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                        {videoFile ? `✓ ${videoFile.name}` : '🎬 Cliquez pour sélectionner une vidéo'}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>MP4, MOV ou WebM (max 500 MB)</p>
                    </div>
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setVideoFile(e.target.files[0]);
                          setError('');
                        }
                      }}
                      className="hidden"
                    />
                    {error && <p className="mt-2 text-xs leading-relaxed" style={{ color: "#f87171" }}>{error}</p>}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full font-semibold py-4 rounded-xl text-sm transition-opacity hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #0891b2, #0e7490)",
                    color: "#fff",
                    boxShadow: "0 0 24px var(--accent-glow)",
                  }}
                >
                  Lancer l'analyse →
                </button>
                <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  Vos données ne sont pas stockées. Le contenu est analysé puis supprimé.
                </p>
              </form>
            )}

            {/* Text form */}
            {inputFormat === 'text' && (
              <form onSubmit={handleSubmitText} className="space-y-4">
                <div>
                  <textarea
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setError('');
                    }}
                    placeholder="Collez votre texte ici (min. 10 caractères)..."
                    className="w-full rounded-xl px-4 py-4 text-sm focus:outline-none transition-colors resize-none h-32"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  {error && <p className="mt-2 text-xs leading-relaxed" style={{ color: "#f87171" }}>{error}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full font-semibold py-4 rounded-xl text-sm transition-opacity hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #0891b2, #0e7490)",
                    color: "#fff",
                    boxShadow: "0 0 24px var(--accent-glow)",
                  }}
                >
                  Analyser le texte →
                </button>
                <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  Vos données ne sont pas stockées. Le texte est analysé puis supprimé.
                </p>
              </form>
            )}

            {/* Image form */}
            {inputFormat === 'image' && (
              <form onSubmit={handleSubmitImage} className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl p-8 text-center cursor-pointer transition-all"
                  style={{
                    border: "2px dashed var(--border-accent)",
                    background: "var(--bg-surface)",
                  }}
                >
                  <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                    {file ? `✓ ${file.name}` : '🖼️ Cliquez pour sélectionner une image'}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>JPG, PNG ou WebP (max 10 MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFile(e.target.files[0]);
                      setError('');
                    }
                  }}
                  className="hidden"
                />
                {error && <p className="text-xs leading-relaxed" style={{ color: "#f87171" }}>{error}</p>}
                <button
                  type="submit"
                  className="w-full font-semibold py-4 rounded-xl text-sm transition-opacity hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #0891b2, #0e7490)",
                    color: "#fff",
                    boxShadow: "0 0 24px var(--accent-glow)",
                  }}
                >
                  Analyser l'image →
                </button>
                <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  Vos données ne sont pas stockées. L'image est analysée puis supprimée.
                </p>
              </form>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div
                className="w-12 h-12 border-2 rounded-full animate-spin"
                style={{
                  borderColor: "var(--border)",
                  borderTopColor: "var(--accent)",
                }}
              />
            </div>
            <div>
              <p className="font-medium text-lg" style={{ color: "var(--text-primary)" }}>
                {LOADING_STEPS[stepIndex].message}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                {elapsedSeconds}s écoulées
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {LOADING_STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 w-8 rounded-full transition-colors"
                  style={{
                    background: i <= stepIndex ? "var(--accent)" : "var(--border)",
                  }}
                />
              ))}
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              L'analyse prend généralement 60 à 90 secondes.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
