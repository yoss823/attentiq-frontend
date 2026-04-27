import { NextRequest, NextResponse } from "next/server";
import {
  ACCOUNT_SESSION_COOKIE_NAME,
  normalizeAccountEmail,
} from "@/lib/account-session";
import { getSubscriberAccountByEmail } from "@/lib/subscriber-store";

export const runtime = "nodejs";

const COOKIE_MAX_AGE_SECONDS = 31 * 24 * 60 * 60;

export async function GET(request: NextRequest) {
  const email = normalizeAccountEmail(request.nextUrl.searchParams.get("email"));
  if (!email) {
    return NextResponse.redirect(new URL("/compte?loginError=missing_email", request.url));
  }

  const { account } = await getSubscriberAccountByEmail(email);
  if (!account) {
    return NextResponse.redirect(new URL(`/compte?email=${encodeURIComponent(email)}&loginError=not_found`, request.url));
  }

  const response = NextResponse.redirect(
    new URL(`/compte?email=${encodeURIComponent(email)}`, request.url)
  );
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
