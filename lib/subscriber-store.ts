import "server-only";

import { Pool } from "pg";
import type Stripe from "stripe";
import {
  getOfferByPriceCents,
  getOfferBySlug,
  type AttentiqOffer,
} from "@/lib/offer-config";

type NanoCorpPayment = {
  amount_cents: number;
  currency: string;
  customer_email: string;
  stripe_session_id: string;
};

type NanoCorpWebhookPayload = {
  event_type: string;
  payment: NanoCorpPayment;
};

export type SubscriberAccountSummary = {
  email: string;
  offerSlug: string;
  offerName: string;
  accessStatus: string;
  monthlyQuota: number | null;
  monthlyUsed: number;
  quotaPeriodStartedAt: string;
  createdAt: string;
  updatedAt: string;
  lastPaymentAt: string | null;
  lastPaymentAmountCents: number | null;
};

export type SubscriberPaymentEvent = {
  stripeSessionId: string;
  offerSlug: string | null;
  amountCents: number;
  currency: string;
  receivedAt: string;
};

export type RecordedPaymentSession = {
  stripeSessionId: string;
  offerSlug: string | null;
  amountCents: number;
  currency: string;
  customerEmail: string | null;
  receivedAt: string;
};

export type VerifiedCheckoutContext = {
  stripeSessionId: string;
  offerSlug: string;
  jobId: string | null;
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

let pool: Pool | null = null;
let schemaReadyPromise: Promise<void> | null = null;

function getPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!pool) {
    pool = new Pool({ connectionString });
  }

  return pool;
}

async function ensureSchema() {
  if (schemaReadyPromise) {
    return schemaReadyPromise;
  }

  schemaReadyPromise = (async () => {
    const db = getPool();

    await db.query(`
      create table if not exists subscriber_accounts (
        email text primary key,
        offer_slug text not null,
        access_status text not null default 'active',
        monthly_quota integer,
        monthly_used integer not null default 0,
        quota_period_started_at timestamptz not null default date_trunc('month', now()),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        last_payment_at timestamptz,
        last_payment_amount_cents integer,
        latest_stripe_session_id text
      );
    `);

    await db.query(`
      create table if not exists subscriber_payment_events (
        stripe_session_id text primary key,
        event_type text not null,
        email text,
        offer_slug text,
        amount_cents integer not null,
        currency text not null,
        received_at timestamptz not null default now(),
        raw_payload jsonb not null
      );
    `);

    await db.query(`
      create index if not exists subscriber_payment_events_email_idx
      on subscriber_payment_events (email, received_at desc);
    `);

    await db.query(`
      create table if not exists verified_checkout_contexts (
        stripe_session_id text primary key,
        offer_slug text not null,
        job_id text,
        video_url text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `);

    await db.query(`
      create table if not exists subscriber_quota_charges (
        job_id text primary key,
        email text not null,
        charged_at timestamptz not null default now()
      );
    `);

    await db.query(`
      create index if not exists subscriber_quota_charges_email_idx
      on subscriber_quota_charges (email, charged_at desc);
    `);
  })();

  return schemaReadyPromise;
}

function offerNameFromSlug(slug: string) {
  return getOfferBySlug(slug)?.name ?? slug;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function upsertSubscriberAccount(
  offer: AttentiqOffer,
  payment: NanoCorpPayment
) {
  if (!offer.createsAccount) {
    return;
  }

  const db = getPool();

  await db.query(
    `
      insert into subscriber_accounts (
        email,
        offer_slug,
        access_status,
        monthly_quota,
        monthly_used,
        quota_period_started_at,
        last_payment_at,
        last_payment_amount_cents,
        latest_stripe_session_id
      )
      values ($1, $2, 'active', $3, 0, date_trunc('month', now()), now(), $4, $5)
      on conflict (email) do update
      set
        offer_slug = excluded.offer_slug,
        access_status = 'active',
        monthly_quota = excluded.monthly_quota,
        updated_at = now(),
        last_payment_at = now(),
        last_payment_amount_cents = excluded.last_payment_amount_cents,
        latest_stripe_session_id = excluded.latest_stripe_session_id
    `,
    [
      normalizeEmail(payment.customer_email),
      offer.slug,
      offer.monthlyQuota,
      payment.amount_cents,
      payment.stripe_session_id,
    ]
  );
}

export async function recordNanoCorpPayment(
  payload: NanoCorpWebhookPayload
): Promise<{ offer: AttentiqOffer | null; createdAccount: boolean }> {
  await ensureSchema();

  const payment = payload.payment;
  const offer = getOfferByPriceCents(payment.amount_cents);
  const db = getPool();

  await db.query(
    `
      insert into subscriber_payment_events (
        stripe_session_id,
        event_type,
        email,
        offer_slug,
        amount_cents,
        currency,
        raw_payload
      )
      values ($1, $2, $3, $4, $5, $6, $7::jsonb)
      on conflict (stripe_session_id) do nothing
    `,
    [
      payment.stripe_session_id,
      payload.event_type,
      normalizeEmail(payment.customer_email),
      offer?.slug ?? null,
      payment.amount_cents,
      payment.currency,
      JSON.stringify(payload),
    ]
  );

  if (offer?.createsAccount) {
    await upsertSubscriberAccount(offer, payment);
  }

  return {
    offer,
    createdAccount: Boolean(offer?.createsAccount),
  };
}

/**
 * Quand le webhook Nanocorp n'a pas encore écrit la ligne, on synchronise depuis
 * une session Checkout Stripe déjà payée (ex. retour /merci sur Payment Link).
 */
export async function recordStripeCheckoutCompletionIfAbsent(
  session: Stripe.Checkout.Session
): Promise<{ offer: AttentiqOffer | null }> {
  if (!process.env.DATABASE_URL) {
    return { offer: null };
  }

  await ensureSchema();

  const paymentSessionId = session.id;
  const amountCents = session.amount_total ?? 0;
  const currency = (session.currency || "eur").toLowerCase();
  const offer = getOfferByPriceCents(amountCents);
  const rawEmail =
    session.customer_details?.email ??
    (typeof session.customer_email === "string"
      ? session.customer_email
      : null);
  const email = rawEmail?.trim() ? normalizeEmail(rawEmail) : null;

  const db = getPool();
  await db.query(
    `
      insert into subscriber_payment_events (
        stripe_session_id,
        event_type,
        email,
        offer_slug,
        amount_cents,
        currency,
        raw_payload
      )
      values ($1, $2, $3, $4, $5, $6, $7::jsonb)
      on conflict (stripe_session_id) do nothing
    `,
    [
      paymentSessionId,
      "stripe.checkout.session.completed",
      email,
      offer?.slug ?? null,
      amountCents,
      currency,
      JSON.stringify({
        source: "stripe_session_sync",
        session_id: session.id,
      }),
    ]
  );

  if (offer?.createsAccount && rawEmail?.trim()) {
    await upsertSubscriberAccount(offer, {
      amount_cents: amountCents,
      currency,
      customer_email: rawEmail.trim(),
      stripe_session_id: paymentSessionId,
    });
  }

  return { offer };
}

export async function getSubscriberAccountByEmail(email: string): Promise<{
  account: SubscriberAccountSummary | null;
  payments: SubscriberPaymentEvent[];
}> {
  if (!process.env.DATABASE_URL) {
    return { account: null, payments: [] };
  }

  await ensureSchema();
  const normalizedEmail = normalizeEmail(email);
  const db = getPool();

  const accountResult = await db.query<{
    email: string;
    offer_slug: string;
    access_status: string;
    monthly_quota: number | null;
    monthly_used: number;
    quota_period_started_at: Date;
    created_at: Date;
    updated_at: Date;
    last_payment_at: Date | null;
    last_payment_amount_cents: number | null;
  }>(
    `
      select
        email,
        offer_slug,
        access_status,
        monthly_quota,
        monthly_used,
        quota_period_started_at,
        created_at,
        updated_at,
        last_payment_at,
        last_payment_amount_cents
      from subscriber_accounts
      where email = $1
      limit 1
    `,
    [normalizedEmail]
  );

  const paymentsResult = await db.query<{
    stripe_session_id: string;
    offer_slug: string | null;
    amount_cents: number;
    currency: string;
    received_at: Date;
  }>(
    `
      select
        stripe_session_id,
        offer_slug,
        amount_cents,
        currency,
        received_at
      from subscriber_payment_events
      where email = $1
      order by received_at desc
      limit 10
    `,
    [normalizedEmail]
  );

  const accountRow = accountResult.rows[0];

  return {
    account: accountRow
      ? {
          email: accountRow.email,
          offerSlug: accountRow.offer_slug,
          offerName: offerNameFromSlug(accountRow.offer_slug),
          accessStatus: accountRow.access_status,
          monthlyQuota: accountRow.monthly_quota,
          monthlyUsed: accountRow.monthly_used,
          quotaPeriodStartedAt: accountRow.quota_period_started_at.toISOString(),
          createdAt: accountRow.created_at.toISOString(),
          updatedAt: accountRow.updated_at.toISOString(),
          lastPaymentAt: accountRow.last_payment_at?.toISOString() ?? null,
          lastPaymentAmountCents: accountRow.last_payment_amount_cents,
        }
      : null,
    payments: paymentsResult.rows.map((row) => ({
      stripeSessionId: row.stripe_session_id,
      offerSlug: row.offer_slug,
      amountCents: row.amount_cents,
      currency: row.currency,
      receivedAt: row.received_at.toISOString(),
    })),
  };
}

export async function getRecordedPaymentSession(
  stripeSessionId: string
): Promise<RecordedPaymentSession | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  await ensureSchema();

  const db = getPool();
  const result = await db.query<{
    stripe_session_id: string;
    offer_slug: string | null;
    amount_cents: number;
    currency: string;
    email: string | null;
    received_at: Date;
  }>(
    `
      select
        stripe_session_id,
        offer_slug,
        amount_cents,
        currency,
        email,
        received_at
      from subscriber_payment_events
      where stripe_session_id = $1
      limit 1
    `,
    [stripeSessionId]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    stripeSessionId: row.stripe_session_id,
    offerSlug: row.offer_slug ?? getOfferByPriceCents(row.amount_cents)?.slug ?? null,
    amountCents: row.amount_cents,
    currency: row.currency,
    customerEmail: row.email,
    receivedAt: row.received_at.toISOString(),
  };
}

export async function getVerifiedCheckoutContext(
  stripeSessionId: string
): Promise<VerifiedCheckoutContext | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  await ensureSchema();

  const db = getPool();
  const result = await db.query<{
    stripe_session_id: string;
    offer_slug: string;
    job_id: string | null;
    video_url: string | null;
    created_at: Date;
    updated_at: Date;
  }>(
    `
      select
        stripe_session_id,
        offer_slug,
        job_id,
        video_url,
        created_at,
        updated_at
      from verified_checkout_contexts
      where stripe_session_id = $1
      limit 1
    `,
    [stripeSessionId]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    stripeSessionId: row.stripe_session_id,
    offerSlug: row.offer_slug,
    jobId: row.job_id,
    videoUrl: row.video_url,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function upsertVerifiedCheckoutContext({
  stripeSessionId,
  offerSlug,
  jobId = null,
  videoUrl = null,
}: {
  stripeSessionId: string;
  offerSlug: string;
  jobId?: string | null;
  videoUrl?: string | null;
}) {
  if (!process.env.DATABASE_URL) {
    return;
  }

  await ensureSchema();

  const db = getPool();
  await db.query(
    `
      insert into verified_checkout_contexts (
        stripe_session_id,
        offer_slug,
        job_id,
        video_url
      )
      values ($1, $2, $3, $4)
      on conflict (stripe_session_id) do update
      set
        offer_slug = excluded.offer_slug,
        job_id = excluded.job_id,
        video_url = excluded.video_url,
        updated_at = now()
    `,
    [stripeSessionId, offerSlug, jobId, videoUrl]
  );
}

export type SubscriptionPlanForQuota = "5" | "pack15";

/**
 * Une analyse terminée avec succès consomme 1 unité du quota mensuel
 * (abonnements 5 ou 15 rapports), une seule fois par job_id.
 */
export async function chargeSubscriptionReportQuotaIfNeeded(params: {
  email: string;
  jobId: string;
  plan: SubscriptionPlanForQuota;
}): Promise<{ charged: boolean; reason?: string }> {
  if (!process.env.DATABASE_URL) {
    return { charged: false, reason: "no_database" };
  }

  await ensureSchema();

  const email = normalizeEmail(params.email);
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const accountResult = await client.query<{
      monthly_quota: number | null;
      monthly_used: number;
      quota_period_started_at: Date;
    }>(
      `
        select monthly_quota, monthly_used, quota_period_started_at
        from subscriber_accounts
        where email = $1
        for update
      `,
      [email]
    );

    const row = accountResult.rows[0];
    if (
      !row ||
      row.monthly_quota == null ||
      row.monthly_quota < 1
    ) {
      await client.query("ROLLBACK");
      return { charged: false, reason: "no_subscriber_account" };
    }

    await client.query(
      `
        update subscriber_accounts
        set
          monthly_used = 0,
          quota_period_started_at = date_trunc('month', now()),
          updated_at = now()
        where email = $1
          and date_trunc('month', quota_period_started_at)
            < date_trunc('month', now())
      `,
      [email]
    );

    const fresh = await client.query<{
      monthly_quota: number;
      monthly_used: number;
    }>(
      `
        select monthly_quota, monthly_used
        from subscriber_accounts
        where email = $1
        for update
      `,
      [email]
    );

    const u = fresh.rows[0];
    if (!u || u.monthly_used >= u.monthly_quota) {
      await client.query("ROLLBACK");
      return { charged: false, reason: "quota_exhausted" };
    }

    const ins = await client.query(
      `
        insert into subscriber_quota_charges (job_id, email)
        values ($1, $2)
        on conflict (job_id) do nothing
        returning job_id
      `,
      [params.jobId, email]
    );

    if (ins.rowCount === 0) {
      await client.query("COMMIT");
      return { charged: false, reason: "already_charged_for_job" };
    }

    const upd = await client.query(
      `
        update subscriber_accounts
        set
          monthly_used = monthly_used + 1,
          updated_at = now()
        where email = $1
          and monthly_used < monthly_quota
        returning monthly_used
      `,
      [email]
    );

    if (upd.rowCount === 0) {
      await client.query(
        `delete from subscriber_quota_charges where job_id = $1`,
        [params.jobId]
      );
      await client.query("ROLLBACK");
      return { charged: false, reason: "quota_exhausted" };
    }

    await client.query("COMMIT");
    return { charged: true };
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("[subscriber-store] chargeSubscriptionReportQuotaIfNeeded", e);
    return { charged: false, reason: "transaction_failed" };
  } finally {
    client.release();
  }
}
