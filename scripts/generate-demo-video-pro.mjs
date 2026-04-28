/**
 * Génère une vraie démo produit (capture navigateur), plus dynamique.
 * - Parcours: /videos (saisie URL) -> /result -> /chat -> /entreprise
 * - Capture vidéo native Playwright
 * - Mix audio de fond pour éviter la vidéo silencieuse
 */

import { mkdirSync, rmSync } from "node:fs";
import { readdir, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";

const APP_URL = process.env.DEMO_APP_URL?.trim() || "http://127.0.0.1:3000";
const TMP_DIR = resolve(process.cwd(), ".tmp", "demo-pro");
const OUT_DIR = resolve(process.cwd(), "public", "demo");
const VERSION = new Date().toISOString().replace(/[:.]/g, "-");
const RAW_VIDEO = resolve(TMP_DIR, "raw.webm");
const MUSIC = resolve(TMP_DIR, "music.m4a");
const OUTPUT_VIDEO = resolve(OUT_DIR, `attentiq-demo-${VERSION}.mp4`);
const OUTPUT_LATEST = resolve(OUT_DIR, "attentiq-demo-latest.mp4");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
  if (!ffmpegPath) throw new Error("ffmpeg-static introuvable");
  return run(ffmpegPath, args);
}

async function captureJourney() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    recordVideo: {
      dir: TMP_DIR,
      size: { width: 1080, height: 1920 },
    },
  });
  const page = await context.newPage();

  await page.goto(`${APP_URL}/videos`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await sleep(1200);

  const input = page.locator("input[type='url']").first();
  if ((await input.count()) > 0) {
    await input.click();
    await input.fill("https://www.tiktok.com/@attentiq_demo/video/7380000000000000000");
    await sleep(1200);
  }

  await page.mouse.wheel(0, 420);
  await sleep(900);
  await page.mouse.wheel(0, -260);
  await sleep(900);

  await page.goto(`${APP_URL}/result`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await sleep(2200);
  await page.mouse.wheel(0, 780);
  await sleep(1100);
  await page.mouse.wheel(0, -220);
  await sleep(900);

  await page.goto(`${APP_URL}/chat`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await sleep(1800);
  const chatInput = page.locator("textarea, input[placeholder*='question'], input[placeholder*='message']").first();
  if ((await chatInput.count()) > 0) {
    await chatInput.click();
    await chatInput.fill("Quelle est la correction la plus prioritaire ?");
    await sleep(900);
  }

  await page.goto(`${APP_URL}/entreprise`, {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await sleep(2200);

  await context.close();
  await browser.close();

  const files = await readdir(TMP_DIR);
  const webm = files.find((f) => f.endsWith(".webm"));
  if (!webm) throw new Error("Capture Playwright introuvable");
  await rename(resolve(TMP_DIR, webm), RAW_VIDEO);
}

async function generateMusic() {
  await ffmpeg(
    "-y",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=128:sample_rate=44100:duration=20",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=256:sample_rate=44100:duration=20",
    "-filter_complex",
    "[0:a]volume=0.08[a0];[1:a]volume=0.05[a1];[a0][a1]amix=inputs=2:normalize=0,highpass=f=120,lowpass=f=2200,afade=t=in:st=0:d=0.8,afade=t=out:st=17:d=2[a]",
    "-map",
    "[a]",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    MUSIC
  );
}

async function finalizeVideo() {
  await ffmpeg(
    "-y",
    "-i",
    RAW_VIDEO,
    "-i",
    MUSIC,
    "-filter_complex",
    "[0:v]fps=30,eq=contrast=1.06:saturation=1.12[v]",
    "-map",
    "[v]",
    "-map",
    "1:a",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-shortest",
    OUTPUT_VIDEO
  );

  await ffmpeg("-y", "-i", OUTPUT_VIDEO, "-c", "copy", OUTPUT_LATEST);
}

async function main() {
  rmSync(TMP_DIR, { recursive: true, force: true });
  mkdirSync(TMP_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });
  await captureJourney();
  await generateMusic();
  await finalizeVideo();
  console.log(`[demo-video-pro] generated: ${OUTPUT_VIDEO}`);
}

main().catch((err) => {
  console.error("[demo-video-pro] error:", err);
  process.exit(1);
});
