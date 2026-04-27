import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendCheckoutThankYouEmail } from "@/lib/checkout-email";
import { getPlanFromOfferSlug } from "@/lib/premium";
import {
  checkoutSessionCustomerEmail,
  isPaidStripeCheckoutSession,
  jobAndVideoFromStripeSession,
  resolveOfferSlugFromPaidStripeSession,
} from "@/lib/paid-stripe-session";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Typings ship `LatestApiVersion`; dashboard uses a newer pinned version.
  // @ts-expect-error Stripe API version string newer than package union
  apiVersion: "2025-02-24.acacia",
});

type SetPremiumBody = {
  sessionId?: unknown;
  jobId?: unknown;
  videoUrl?: unknown;
};

function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SetPremiumBody;
    const sessionId = normalizeString(body.sessionId);
    const jobId = normalizeString(body.jobId);
    const videoUrl = normalizeString(body.videoUrl);

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "MISSING_SESSION_ID" },
        { status: 400 }
      );
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch {
      return NextResponse.json(
        { ok: false, error: "SESSION_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!isPaidStripeCheckoutSession(session)) {
      return NextResponse.json(
        { ok: false, error: "SESSION_NOT_PAID" },
        { status: 403 }
      );
    }

    const resolvedOfferSlug = resolveOfferSlugFromPaidStripeSession(session);
    const plan = getPlanFromOfferSlug(resolvedOfferSlug);

    const fromMeta = jobAndVideoFromStripeSession(session);
    const resolvedJobId =
      jobId ?? normalizeString(fromMeta.jobId) ?? null;
    const resolvedVideoUrl =
      videoUrl ?? normalizeString(fromMeta.videoUrl) ?? null;

    const customerEmail = checkoutSessionCustomerEmail(session);

    let thankYouEmail:
      | {
          status: "sent" | "skipped_no_recipient" | "skipped_no_resend_key" | "failed";
          resendEmailId?: string;
          message?: string;
        }
      | undefined;
    let reportPdfEmail:
      | {
          status:
            | "sent"
            | "skipped_no_recipient"
            | "skipped_no_job"
            | "failed";
          message?: string;
        }
      | undefined;

    if (!customerEmail) {
      console.warn(
        "[set-premium] thank-you email skipped: no email on Stripe session (customer_details / customer_email / customer)"
      );
      thankYouEmail = { status: "skipped_no_recipient" };
    } else {
      const host =
        req.headers.get("x-forwarded-host") ?? req.headers.get("host");
      const forwardedProto = req.headers.get("x-forwarded-proto");
      const isLocalHost = Boolean(
        host &&
          (host.includes("localhost") ||
            host.includes("127.0.0.1") ||
            host.includes("0.0.0.0"))
      );
      // Force HTTP on localhost to avoid SSL browser errors from emailed links.
      const proto = isLocalHost ? "http" : forwardedProto ?? "https";
      const appBaseUrl = host ? `${proto}://${host}` : null;
      const accountLoginUrl = appBaseUrl
        ? `${appBaseUrl}/api/account/login?email=${encodeURIComponent(
            customerEmail
          )}`
        : null;

      const sendResult = await sendCheckoutThankYouEmail({
        to: customerEmail,
        offerSlug: resolvedOfferSlug,
        sessionId,
        appBaseUrl,
        accountLoginUrl,
      });

      if ("skipped" in sendResult && sendResult.skipped) {
        thankYouEmail = { status: "skipped_no_resend_key" };
      } else if (!sendResult.ok) {
        thankYouEmail = {
          status: "failed",
          message: sendResult.error,
        };
        console.error("[set-premium] thank-you email failed:", sendResult.error);
      } else if ("resendEmailId" in sendResult) {
        thankYouEmail = {
          status: "sent",
          resendEmailId: sendResult.resendEmailId,
        };
      } else {
        thankYouEmail = { status: "failed", message: "unexpected_send_result" };
      }

      if (!resolvedJobId) {
        reportPdfEmail = { status: "skipped_no_job" };
      } else if (!appBaseUrl) {
        reportPdfEmail = {
          status: "failed",
          message: "missing_app_base_url_for_internal_send_report",
        };
      } else {
        try {
          const pdfResponse = await fetch(`${appBaseUrl}/api/send-report`, {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              email: customerEmail,
              jobId: resolvedJobId,
              subject: "Votre diagnostic Attentiq (PDF)",
              body: "Vous trouverez votre diagnostic en piece jointe.",
            }),
          });
          if (!pdfResponse.ok) {
            const pdfPayload = (await pdfResponse.json().catch(() => null)) as
              | { error?: string; userMessage?: string }
              | null;
            reportPdfEmail = {
              status: "failed",
              message:
                pdfPayload?.userMessage ??
                pdfPayload?.error ??
                `http_${pdfResponse.status}`,
            };
          } else {
            reportPdfEmail = { status: "sent" };
          }
        } catch (error) {
          reportPdfEmail = {
            status: "failed",
            message: error instanceof Error ? error.message : "send_report_failed",
          };
        }
      }
    }

    return NextResponse.json({
      ok: true,
      paid: true,
      offerSlug: resolvedOfferSlug,
      plan,
      jobId: resolvedJobId,
      videoUrl: resolvedVideoUrl,
      customerEmail,
      thankYouEmail,
      reportPdfEmail,
    });
  } catch (error) {
    console.error("[set-premium] error:", error);
    return NextResponse.json(
      { ok: false, error: "PREMIUM_SET_FAILED" },
      { status: 500 }
    );
  }
}
