/**
 * Smoke test Groq (sans passer la clé en argument).
 * Charge .env.local puis .env à la racine du frontend si présents.
 *
 * Usage : npm run test:groq
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import Groq from "groq-sdk";

function loadEnvFile(relPath) {
  const full = resolve(process.cwd(), relPath);
  if (!existsSync(full)) return;
  const text = readFileSync(full, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const apiKey = process.env.GROQ_API_KEY?.trim();
if (!apiKey) {
  console.error(
    "[smoke-groq] GROQ_API_KEY introuvable.\n" +
      "  → Crée attentiq-frontend/.env.local avec une ligne :\n" +
      "    GROQ_API_KEY=gsk_...\n" +
      "  → Ne colle jamais cette clé dans le chat Cursor.\n"
  );
  process.exit(1);
}

const model =
  process.env.GROQ_CHAT_MODEL?.trim() || "llama-3.3-70b-versatile";

const groq = new Groq({ apiKey });

const completion = await groq.chat.completions.create({
  model,
  messages: [
    {
      role: "system",
      content:
        "Tu réponds en français, une phrase courte, factuel, sans emoji.",
    },
    {
      role: "user",
      content:
        "Réponds uniquement par : OK smoke Groq + nom du modèle utilisé.",
    },
  ],
  max_tokens: 80,
  temperature: 0.2,
});

const text = completion.choices[0]?.message?.content?.trim();
if (!text) {
  console.error("[smoke-groq] Réponse vide du modèle.");
  process.exit(1);
}

console.log("[smoke-groq] Modèle :", model);
console.log("[smoke-groq] Réponse :", text);
console.log("[smoke-groq] Terminé avec succès.");
