/**
 * Génère une vidéo démo verticale (mp4) automatiquement à partir de pages Attentiq.
 *
 * Usage:
 *   npm run demo:video
 *
 * Pré-requis:
 * - App lancée sur http://127.0.0.1:3000
 */

import { mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer";
import ffmpegPath from "ffmpeg-static";

const APP_URL = process.env.DEMO_APP_URL?.trim() || "http://127.0.0.1:3000";
const OUT_DIR = resolve(process.cwd(), "public", "demo");
const TMP_DIR = resolve(process.cwd(), ".tmp", "demo-video");
const OUTPUT_VIDEO = resolve(OUT_DIR, "attentiq-demo.mp4");

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

  const shots = [
    { name: "01-home", path: "/" },
    { name: "02-home-pricing", path: "/#tarifs", scrollY: 2200 },
    { name: "03-videos", path: "/videos" },
    { name: "04-result-demo", path: "/result" },
  ];

  for (const shot of shots) {
    const url = `${APP_URL}${shot.path}`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45_000 });
    if (typeof shot.scrollY === "number") {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), shot.scrollY);
      await sleep(500);
    }
    await page.screenshot({
      path: resolve(TMP_DIR, `${shot.name}.png`),
      type: "png",
    });
  }

  await browser.close();
}

async function buildVideo() {
  const clipDefs = [
    ["01-home.png", 3],
    ["02-home-pricing.png", 4],
    ["03-videos.png", 3],
    ["04-result-demo.png", 5],
  ];

  const clipPaths = [];
  for (let i = 0; i < clipDefs.length; i += 1) {
    const [imgName, seconds] = clipDefs[i];
    const clipPath = resolve(TMP_DIR, `clip-${i + 1}.mp4`);
    clipPaths.push(clipPath);
    await ffmpeg(
      "-y",
      "-loop",
      "1",
      "-t",
      String(seconds),
      "-i",
      resolve(TMP_DIR, imgName),
      "-vf",
      "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p",
      "-r",
      "30",
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
  await import("node:fs/promises").then(({ writeFile }) =>
    writeFile(concatFile, concatContent, "utf8")
  );

  await ffmpeg(
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatFile,
    "-c",
    "copy",
    OUTPUT_VIDEO
  );
}

async function main() {
  rmSync(TMP_DIR, { recursive: true, force: true });
  mkdirSync(TMP_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });
  await captureFrames();
  await buildVideo();
  console.log(`[demo-video] Fichier généré: ${OUTPUT_VIDEO}`);
}

main().catch((err) => {
  console.error("[demo-video] Erreur:", err);
  process.exit(1);
});
