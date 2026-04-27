import { NextRequest, NextResponse } from "next/server";
import {
  ACCOUNT_SESSION_COOKIE_NAME,
  normalizeAccountEmail,
} from "@/lib/account-session";
import { getSubscriberAccountByEmail } from "@/lib/subscriber-store";

export const runtime = "nodejs";

const COOKIE_MAX_AGE_SECONDS = 31 * 24 * 60 * 60;

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
    secure: true,
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
