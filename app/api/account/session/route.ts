import { NextResponse } from "next/server";
import { ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account-session";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "USE_MAGIC_LINK", message: "POST /api/account/magic/request" },
    { status: 410 }
  );
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
