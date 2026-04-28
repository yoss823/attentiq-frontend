import "server-only";

import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { Pool } from "pg";
import type { FreeTrialFormat } from "@/lib/free-trial";

let pool: Pool | null = null;
let schemaReadyPromise: Promise<void> | null = null;

function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  if (!pool) {
    pool = new Pool({ connectionString });
  }
  return pool;
}

async function ensureSchema() {
  if (schemaReadyPromise) return schemaReadyPromise;
  schemaReadyPromise = (async () => {
    const db = getPool();
    if (!db) return;
    await db.query(`
      create table if not exists trial_consumption_events (
        fingerprint_hash text not null,
        format text not null,
        first_seen_at timestamptz not null default now(),
        last_seen_at timestamptz not null default now(),
        times_seen integer not null default 1,
        primary key (fingerprint_hash, format)
      );
    `);
  })();
  return schemaReadyPromise;
}

function normalizeClientIp(ip: string): string {
  const clean = ip.trim();
  if (!clean) return "";
  // IPv4: keep /24 network to stay resilient to dynamic last octet.
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/;
  const m = clean.match(v4);
  if (m) return `${m[1]}.${m[2]}.${m[3]}.0/24`;
  return clean;
}

function resolveClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return normalizeClientIp(first);
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return normalizeClientIp(realIp);
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return normalizeClientIp(cfIp);
  return "unknown-ip";
}

function buildFingerprintHash(req: NextRequest, format: FreeTrialFormat): string {
  const ip = resolveClientIp(req);
  const ua = (req.headers.get("user-agent") || "unknown-ua").slice(0, 240);
  return createHash("sha256")
    .update(`${format}|${ip}|${ua}`, "utf8")
    .digest("hex");
}

export async function hasConsumedServerSideTrial(
  req: NextRequest,
  format: FreeTrialFormat
): Promise<boolean> {
  const db = getPool();
  if (!db) return false;
  await ensureSchema();
  const fingerprintHash = buildFingerprintHash(req, format);
  const result = await db.query<{ one: string }>(
    `
      select '1'::text as one
      from trial_consumption_events
      where fingerprint_hash = $1
        and format = $2
      limit 1
    `,
    [fingerprintHash, format]
  );
  return Boolean(result.rows[0]);
}

export async function markServerSideTrialConsumed(
  req: NextRequest,
  format: FreeTrialFormat
): Promise<void> {
  const db = getPool();
  if (!db) return;
  await ensureSchema();
  const fingerprintHash = buildFingerprintHash(req, format);
  await db.query(
    `
      insert into trial_consumption_events (
        fingerprint_hash,
        format
      )
      values ($1, $2)
      on conflict (fingerprint_hash, format) do update
      set
        last_seen_at = now(),
        times_seen = trial_consumption_events.times_seen + 1
    `,
    [fingerprintHash, format]
  );
}
