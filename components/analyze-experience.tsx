"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Format = "video" | "image" | "text";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://attentiqbackend-production.up.railway.app";

export default function AnalyzeExperience() {
  const router = useRouter();
  const [format, setFormat] = useState<Format>("video");
  const [videoUrl, setVideoUrl] = useState("");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const LOADING_MESSAGES = [
    "Téléchargement de la vidéo…",
    "Transcription de l'audio…",
    "Analyse image par image…",
    "Génération du diagnostic…",
  ];

  const startLoadingMessages = () => {
    let i = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      i++;
      if (i < LOADING_MESSAGES.length) {
        setLoadingMsg(LOADING_MESSAGES[i]);
      } else {
        clearInterval(interval);
      }
    }, 20000);
    return interval;
  };

  const pollJob = async (jobId: string): Promise<void> => {
    const res = await fetch(`${BACKEND_URL}/analyze/${jobId}`);
    const data = await res.json();
    if (data.status === "success") {
      router.push(`/analyze/result?jobId=${jobId}`);
    } else if (data.status === "error") {
      throw new Error(data.error_message ?? "Erreur d'analyse.");
    } else {
      await new Promise((r) => setTimeout(r, 5000));
      return pollJob(jobId);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const interval = startLoadingMessages();

    try {
      let jobId: string;

      if (format === "video") {
        if (!videoUrl.includes("tiktok.com")) {
          throw new Error("Seules les URLs TikTok sont supportées pour l'instant.");
        }
        const res = await fetch(`${BACKEND_URL}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: crypto.randomUUID(),
            url: videoUrl,
            platform: "tiktok",
            max_duration_seconds: 60,
            requested_at: new Date().toISOString(),
          }),
        });
        const data = await res.json();
        jobId = data.job_id;
      } else if (format === "text") {
        if (!text.trim()) throw new Error("Collez un texte à analyser.");
        const res = await fetch(`${BACKEND_URL}/analyze/text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.trim() }),
        });
        const data = await res.json();
        jobId = data.job_id;
      } else {
        if (!imageFile) throw new Error("Sélectionnez une image à analyser.");
        const formData = new FormData();
        formData.append("file", imageFile);
        const res = await fetch(`${BACKEND_URL}/analyze/image`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        jobId = data.job_id;
      }

      await pollJob(jobId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Analysez votre contenu</h1>
          <p className="text-zinc-400 text-sm">
            Le diagnostic arrive en 60 à 90 secondes.
          </p>
        </div>

        {/* Format tabs */}
        <div className="flex border border-zinc-800 rounded-lg overflow-hidden">
          {(["video", "image", "text"] as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                format === f
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f === "video" ? "Vidéo" : f === "image" ? "Image" : "Texte"}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="space-y-3">
          {format === "video" && (
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          )}

          {format === "image" && (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-zinc-500 transition-colors"
            >
              {imageFile ? (
                <p className="text-sm text-zinc-300">{imageFile.name}</p>
              ) : (
                <p className="text-sm text-zinc-500">
                  Glissez une image ou{" "}
                  <span className="underline">choisissez un fichier</span>
                </p>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          {format === "text" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Collez votre texte, caption, script…"
              rows={6}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
            />
          )}
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* Loading state */}
        {loading && (
          <div className="text-center space-y-2">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-zinc-400">{loadingMsg}</p>
            <p className="text-xs text-zinc-600">
              L'analyse prend généralement 60 à 90 secondes.
            </p>
          </div>
        )}

        {/* Submit */}
        {!loading && (
          <button
            onClick={handleSubmit}
            className="w-full bg-zinc-100 text-zinc-900 font-semibold py-3 rounded-lg hover:bg-white transition-colors"
          >
            Analyser →
          </button>
        )}

        <p className="text-center text-xs text-zinc-600">
          Vos données ne sont pas stockées.{" "}
          <a href="/transparence" className="underline">
            En savoir plus
          </a>
        </p>
      </div>
    </div>
  );
}
