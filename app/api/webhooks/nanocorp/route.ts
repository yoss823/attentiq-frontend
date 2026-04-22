import { NextRequest, NextResponse } from "next/server";
import { recordNanoCorpPayment } from "@/lib/subscriber-store";

export const runtime = "nodejs";

type WebhookBody = {
  event_type?: unknown;
  payment?: {
    amount_cents?: unknown;
    currency?: unknown;
    customer_email?: unknown;
    stripe_session_id?: unknown;
  };
};

type ValidWebhookBody = {
  event_type: string;
  payment: {
    amount_cents: number;
    currency: string;
    customer_email: string;
    stripe_session_id: string;
  };
};

function isValidWebhookBody(body: WebhookBody): body is ValidWebhookBody {
  return (
    typeof body.event_type === "string" &&
    typeof body.payment?.amount_cents === "number" &&
    typeof body.payment.currency === "string" &&
    typeof body.payment.customer_email === "string" &&
    typeof body.payment.stripe_session_id === "string"
  );
}

export async function POST(request: NextRequest) {
  let body: WebhookBody;

  try {
    body = (await request.json()) as WebhookBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON" },
      { status: 400 }
    );
  }

  if (!isValidWebhookBody(body)) {
    return NextResponse.json(
      { ok: false, error: "INVALID_PAYLOAD" },
      { status: 400 }
    );
  }

  try {
    const eventType = body.event_type;
    const payment = body.payment;
    const result = await recordNanoCorpPayment({
      event_type: eventType,
      payment: {
        amount_cents: payment.amount_cents,
        currency: payment.currency,
        customer_email: payment.customer_email,
        stripe_session_id: payment.stripe_session_id,
      },
    });

    return NextResponse.json({
      ok: true,
      offerSlug: result.offer?.slug ?? null,
      createdAccount: result.createdAccount,
    });
  } catch (error) {
    console.error("[nanocorp-webhook] failed", error);
    return NextResponse.json(
      { ok: false, error: "WEBHOOK_FAILED" },
      { status: 500 }
    );
  }
}
