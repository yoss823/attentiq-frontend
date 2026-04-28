/**
 * Démo vidéo marketing dynamique (verticale):
 * - parcours client: home -> dépôt URL -> résultat -> chat -> pricing
 * - zooms / mouvements / cuts courts
 * - musique de fond synthétique auto-générée
 */

import { mkdirSync, rmSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer";
import ffmpegPath from "ffmpeg-static";

const APP_URL = process.env.DEMO_APP_URL?.trim() || "http://127.0.0.1:3000";
const OUT_DIR = resolve(process.cwd(), "public", "demo");
const TMP_DIR = resolve(process.cwd(), ".tmp", "demo-video");
const VERSION = new Date().toISOString().replace(/[:.]/g, "-");
const OUTPUT_VIDEO = resolve(OUT_DIR, `attentiq-demo-${VERSION}.mp4`);
const OUTPUT_VIDEO_LATEST = resolve(OUT_DIR, "attentiq-demo-latest.mp4");
const OUTPUT_MUSIC = resolve(TMP_DIR, "bg-music.m4a");
const OUTPUT_VIDEO_NO_AUDIO = resolve(TMP_DIR, "video-no-audio.mp4");

const FPS = 30;

const SHOTS = [
  { name: "01-home-hook", path: "/", duration: 2.2, zoom: "in" },
  {
    name: "02-videos-link",
    path: "/videos",
    duration: 3.2,
    zoom: "focus",
    action: "fillUrl",
  },
  { name: "03-result", path: "/result", duration: 4.2, zoom: "out" },
  { name: "04-chat", path: "/chat", duration: 3.0, zoom: "focus" },
  {
    name: "05-pricing-enterprise",
    path: "/#tarifs",
    duration: 3.6,
    zoom: "in",
    scrollY: 2100,
  },
];

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function run(cmd, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("error", rejectRun);
    child.on("exit", (code) => {
      if (code === 0) return resolveRun();
      rejectRun(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

function ffmpeg(...args) {
  if (!ffmpegPath) throw new Error("ffmpeg-static introuvable.");
  return run(ffmpegPath, args);
}

async function captureFrames() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1080, height: 1920, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();

  for (const shot of SHOTS) {
    const url = `${APP_URL}${shot.path}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await sleep(450);

    if (typeof shot.scrollY === "number") {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), shot.scrollY);
      await sleep(500);
    }

    if (shot.action === "fillUrl") {
      await page.evaluate(() => {
        const input = document.querySelector(
          "input[type='url'], input[placeholder*='URL'], input[placeholder*='url']"
        );
        if (input instanceof HTMLInputElement) {
          input.value = "https://www.tiktok.com/@attentiq_demo/video/7380000000000000000";
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
      await sleep(500);
    }

    await page.screenshot({
      path: resolve(TMP_DIR, `${shot.name}.png`),
      type: "png",
    });
  }

  await browser.close();
}

function zoomFilter(type) {
  if (type === "focus") {
    return "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(1.35,1.0+0.0015*on)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,eq=contrast=1.05:saturation=1.12,format=yuv420p";
  }
  if (type === "out") {
    return "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='max(1.0,1.22-0.0012*on)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,eq=contrast=1.03:saturation=1.08,format=yuv420p";
  }
  return "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(1.18,1.0+0.001*on)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,eq=contrast=1.04:saturation=1.1,format=yuv420p";
}

async function buildVideoNoAudio() {
  const clipPaths = [];
  for (let i = 0; i < SHOTS.length; i += 1) {
    const shot = SHOTS[i];
    const clipPath = resolve(TMP_DIR, `clip-${String(i + 1).padStart(2, "0")}.mp4`);
    clipPaths.push(clipPath);
    await ffmpeg(
      "-y",
      "-loop",
      "1",
      "-t",
      String(shot.duration),
      "-i",
      resolve(TMP_DIR, `${shot.name}.png`),
      "-vf",
      zoomFilter(shot.zoom),
      "-r",
      String(FPS),
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-pix_fmt",
      "yuv420p",
      clipPath
    );
  }

  const concatFile = resolve(TMP_DIR, "concat.txt");
  const concatContent = clipPaths.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n");
  await writeFile(concatFile, concatContent, "utf8");

  await ffmpeg(
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatFile,
    "-vf",
    "fps=30,eq=contrast=1.04:saturation=1.1",
    "-pix_fmt",
    "yuv420p",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    OUTPUT_VIDEO_NO_AUDIO
  );
}

async function buildMusicTrack(durationSeconds) {
  await ffmpeg(
    "-y",
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=110:sample_rate=44100:duration=${durationSeconds}`,
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=220:sample_rate=44100:duration=${durationSeconds}`,
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=330:sample_rate=44100:duration=${durationSeconds}`,
    "-filter_complex",
    "[0:a]volume=0.045[a0];[1:a]volume=0.03[a1];[2:a]volume=0.02[a2];[a0][a1][a2]amix=inputs=3:normalize=0,highpass=f=90,lowpass=f=1800,afade=t=in:st=0:d=0.7,afade=t=out:st=12:d=1.8[a]",
    "-map",
    "[a]",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    OUTPUT_MUSIC
  );
}

async function muxVideoAndAudio() {
  await ffmpeg(
    "-y",
    "-i",
    OUTPUT_VIDEO_NO_AUDIO,
    "-i",
    OUTPUT_MUSIC,
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-shortest",
    OUTPUT_VIDEO
  );
  await ffmpeg("-y", "-i", OUTPUT_VIDEO, "-c", "copy", OUTPUT_VIDEO_LATEST);
}

async function main() {
  rmSync(TMP_DIR, { recursive: true, force: true });
  mkdirSync(TMP_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });
  await captureFrames();
  await buildVideoNoAudio();
  await buildMusicTrack(15);
  await muxVideoAndAudio();
  console.log(`[demo-video] Fichier généré: ${OUTPUT_VIDEO}`);
}

main().catch((err) => {
  console.error("[demo-video] Erreur:", err);
  process.exit(1);
});
