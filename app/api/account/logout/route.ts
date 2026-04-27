import { NextRequest, NextResponse } from "next/server";
import { ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account-session";

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

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL("/compte", resolveRequestOrigin(request))
  );
  response.cookies.set({
    name: ACCOUNT_SESSION_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
