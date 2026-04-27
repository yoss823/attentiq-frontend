import { NextRequest, NextResponse } from "next/server";
import { ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/compte", request.url));
  response.cookies.set({
    name: ACCOUNT_SESSION_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
