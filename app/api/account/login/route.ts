import { NextRequest, NextResponse } from "next/server";
import {
  ACCOUNT_SESSION_COOKIE_NAME,
  normalizeAccountEmail,
} from "@/lib/account-session";
import { consumeMagicLoginToken, getSubscriberAccountByEmail } from "@/lib/subscriber-store";

export const runtime = "nodejs";

const COOKIE_MAX_AGE_SECONDS_DEFAULT = 31 * 24 * 60 * 60;
const COOKIE_MAX_AGE_SECONDS_REMEMBER = 90 * 24 * 60 * 60;

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

export async function GET(request: NextRequest) {
  const origin = resolveRequestOrigin(request);
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (token) {
    const consumed = await consumeMagicLoginToken(token);
    if (!consumed) {
      return NextResponse.redirect(new URL("/compte?loginError=magic_invalid", origin));
    }

    const { account } = await getSubscriberAccountByEmail(consumed.email);
    if (!account) {
      return NextResponse.redirect(
        new URL(
          `/compte?email=${encodeURIComponent(consumed.email)}&loginError=not_found`,
          origin
        )
      );
    }

    const maxAge = consumed.remember
      ? COOKIE_MAX_AGE_SECONDS_REMEMBER
      : COOKIE_MAX_AGE_SECONDS_DEFAULT;
    const response = NextResponse.redirect(
      new URL(`/compte?email=${encodeURIComponent(consumed.email)}`, origin)
    );
    response.cookies.set({
      name: ACCOUNT_SESSION_COOKIE_NAME,
      value: consumed.email,
      path: "/",
      httpOnly: true,
      secure: shouldUseSecureCookie(request),
      sameSite: "lax",
      maxAge,
    });
    return response;
  }

  const email = normalizeAccountEmail(request.nextUrl.searchParams.get("email"));
  if (!email) {
    return NextResponse.redirect(new URL("/compte?loginError=missing_email", origin));
  }

  return NextResponse.redirect(
    new URL(`/compte?email=${encodeURIComponent(email)}&loginError=magic_required`, origin)
  );
}
