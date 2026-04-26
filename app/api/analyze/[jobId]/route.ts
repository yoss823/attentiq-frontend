import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  URL_PIPELINE_VERSION,
  UrlIntakeError,
  buildPipelineHeaders,
  getRailwayJobSnapshot,
} from "@/lib/railway-server";
import {
  PREMIUM_ENTITLEMENT_COOKIE_NAME,
  parsePremiumEntitlement,
} from "@/lib/premium";
import { chargeSubscriptionReportQuotaIfNeeded } from "@/lib/subscriber-store";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/analyze/[jobId]">
) {
  const { jobId } = await context.params;
  try {
    const snapshot = await getRailwayJobSnapshot(jobId);

    if (snapshot.status === "success" && snapshot.result) {
      const cookieStore = await cookies();
      const raw = cookieStore.get(PREMIUM_ENTITLEMENT_COOKIE_NAME)?.value;
      const entitlement = parsePremiumEntitlement(raw ?? null);
      const email = entitlement?.subscriberEmail?.trim();
      if (
        email &&
        entitlement &&
        (entitlement.plan === "5" || entitlement.plan === "pack15")
      ) {
        const plan = entitlement.plan === "pack15" ? "pack15" : "5";
        chargeSubscriptionReportQuotaIfNeeded({
          email,
          jobId,
          plan,
        }).catch((err) =>
          console.error("[analyze/jobId] quota charge failed:", err)
        );
      }
    }

    return NextResponse.json(snapshot, { headers: buildPipelineHeaders() });
  } catch (error) {
    if (error instanceof UrlIntakeError) {
      return NextResponse.json(
        { error: error.code, userMessage: error.userMessage, needsUpload: error.needsUpload, pipelineVersion: URL_PIPELINE_VERSION },
        { status: error.status, headers: buildPipelineHeaders() }
      );
    }
    return NextResponse.json(
      { error: "INTERNAL", userMessage: "Une erreur inattendue est survenue pendant le suivi du diagnostic.", needsUpload: false, pipelineVersion: URL_PIPELINE_VERSION },
      { status: 500, headers: buildPipelineHeaders() }
    );
  }
}
