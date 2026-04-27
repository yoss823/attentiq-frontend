import { NextRequest, NextResponse } from "next/server";
import { sendAccountMagicLoginEmail } from "@/lib/account-magic-email";
import { normalizeAccountEmail } from "@/lib/account-session";
import { createMagicLoginTokenForSubscriberEmail } from "@/lib/subscriber-store";

export const runtime = "nodejs";

function resolveRequestOrigin(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const isLocalHost =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes("0.0.0.0");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = isLocalHost
    ? "http"
    : forwardedProto
      ? forwardedProto.split(",")[0].trim()
      : request.nextUrl.protocol.replace(":", "");
  return host ? `${proto}://${host}` : request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const email = normalizeAccountEmail(
    typeof body === "object" && body && "email" in body
      ? (body as { email?: string }).email
      : null
  );
  if (!email) {
    return NextResponse.json({ ok: false, error: "MISSING_EMAIL" }, { status: 400 });
  }

  const remember =
    typeof body === "object" &&
    body &&
    "remember" in body &&
    typeof (body as { remember?: unknown }).remember === "boolean"
      ? (body as { remember: boolean }).remember
      : false;

  const created = await createMagicLoginTokenForSubscriberEmail(email, remember);
  if (!created) {
    return NextResponse.json({ ok: true });
  }

  const origin = resolveRequestOrigin(request);
  const magicUrl = new URL("/api/account/login", origin);
  magicUrl.searchParams.set("token", created.token);

  const sendResult = await sendAccountMagicLoginEmail({
    to: created.email,
    magicUrl: magicUrl.toString(),
    idempotencyKey: `account-magic:${created.tokenHash}`,
  });

  if ("skipped" in sendResult && sendResult.skipped) {
    console.warn("[account/magic/request] Resend not configured; magic link not emailed");
    return NextResponse.json(
      { ok: false, error: "EMAIL_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  if (!sendResult.ok) {
    console.error("[account/magic/request] email send failed:", sendResult.error);
    return NextResponse.json(
      { ok: false, error: "EMAIL_SEND_FAILED" },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
