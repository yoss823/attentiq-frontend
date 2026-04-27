import { NextRequest, NextResponse } from "next/server";
import {
  ACCOUNT_SESSION_COOKIE_NAME,
  normalizeAccountEmail,
} from "@/lib/account-session";
import { getSubscriberAccountByEmail } from "@/lib/subscriber-store";

export const runtime = "nodejs";

const COOKIE_MAX_AGE_SECONDS = 31 * 24 * 60 * 60;

function shouldUseSecureCookie(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const isLocalHost =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes("0.0.0.0");
  if (isLocalHost) {
    return false;
  }
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim() === "https";
  }
  return request.nextUrl.protocol === "https:";
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

  const { account } = await getSubscriberAccountByEmail(email);
  if (!account) {
    return NextResponse.json(
      { ok: false, error: "ACCOUNT_NOT_FOUND" },
      { status: 404 }
    );
  }

  const response = NextResponse.json({ ok: true, email });
  response.cookies.set({
    name: ACCOUNT_SESSION_COOKIE_NAME,
    value: email,
    path: "/",
    httpOnly: true,
    secure: shouldUseSecureCookie(request),
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ACCOUNT_SESSION_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
