import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
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
import {
  hasUsedFreeTrialForFormat,
  isDevVideoTrialBypassEnabled,
  setFreeTrialCookieOnResponse,
  type FreeTrialFormat,
} from "@/lib/free-trial";
import {
  chargeSubscriptionReportQuotaIfNeeded,
  getArchivedSubscriberReportByEmailAndJob,
  recordSubscriberAnalysisIfAbsent,
} from "@/lib/subscriber-store";
import {
  ACCOUNT_SESSION_COOKIE_NAME,
  normalizeAccountEmail,
} from "@/lib/account-session";

function detectContentType(result: Record<string, unknown>) {
  const candidateKeys = ["content_type", "format", "input_type", "source_type"];
  for (const key of candidateKeys) {
    const direct = result[key];
    if (direct === "video" || direct === "text" || direct === "image") {
      return direct;
    }
    if (typeof direct === "string") {
      const lower = direct.toLowerCase();
      if (lower.includes("video")) return "video";
      if (lower.includes("text")) return "text";
      if (lower.includes("image")) return "image";
    }
  }

  const metadata = result.metadata;
  if (metadata && typeof metadata === "object") {
    const platform =
      "platform" in metadata && typeof metadata.platform === "string"
        ? metadata.platform.toLowerCase()
        : "";
    if (platform === "text" || platform === "image" || platform === "video") {
      return platform;
    }
    if ("url" in metadata) {
      return "video";
    }
  }

  const inputFormat = result.inputFormat;
  if (inputFormat === "video" || inputFormat === "text" || inputFormat === "image") {
    return inputFormat;
  }

  return "unknown";
}

function toTrialFormat(value: string): FreeTrialFormat | null {
  if (value === "video" || value === "text" || value === "image") {
    return value;
  }
  return null;
}

function extractReportRequestId(result: Record<string, unknown>): string | null {
  const legacy =
    "data" in result &&
    result.data &&
    typeof result.data === "object" &&
    "request_id" in result.data &&
    typeof result.data.request_id === "string"
      ? result.data.request_id
      : null;
  if (legacy) {
    return legacy;
  }
  return typeof result.id === "string" ? result.id : null;
}

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/analyze/[jobId]">
) {
  const { jobId } = await context.params;
  try {
    const snapshot = await getRailwayJobSnapshot(jobId);

    if (snapshot.status === "success" && snapshot.result) {
      const cookieStore = await cookies();
      const raw = cookieStore.get(PREMIUM_ENTITLEMENT_COOKIE_NAME)?.value;
      const entitlement = parsePremiumEntitlement(raw ?? null);
      const hasPremium = Boolean(entitlement?.isPremium);
      const detectedType = detectContentType(snapshot.result);
      const trialFormat = toTrialFormat(detectedType);

      const response = NextResponse.json(snapshot, {
        headers: buildPipelineHeaders(),
      });

      if (
        trialFormat &&
        !hasPremium &&
        !(isDevVideoTrialBypassEnabled() && trialFormat === "video") &&
        !hasUsedFreeTrialForFormat(request, trialFormat)
      ) {
        setFreeTrialCookieOnResponse(response, trialFormat, false);
      }

      const email = entitlement?.subscriberEmail?.trim();
      if (email && entitlement) {
        if (entitlement.plan === "5" || entitlement.plan === "pack15") {
          const plan = entitlement.plan === "pack15" ? "pack15" : "5";
          chargeSubscriptionReportQuotaIfNeeded({
            email,
            jobId,
            plan,
          }).catch((err) =>
            console.error("[analyze/jobId] quota charge failed:", err)
          );
        }
        if (
          entitlement.plan === "5" ||
          entitlement.plan === "pack15" ||
          entitlement.plan === "single"
        ) {
          const sourceLabel =
            snapshot.result &&
            typeof snapshot.result === "object" &&
            "metadata" in snapshot.result &&
            snapshot.result.metadata &&
            typeof snapshot.result.metadata === "object" &&
            "url" in snapshot.result.metadata &&
            typeof snapshot.result.metadata.url === "string"
              ? snapshot.result.metadata.url
              : null;
          recordSubscriberAnalysisIfAbsent({
            email,
            jobId,
            contentType: detectedType,
            sourceLabel,
            reportRequestId: extractReportRequestId(snapshot.result),
            reportPayload: snapshot.result,
          }).catch((err) =>
            console.error("[analyze/jobId] analysis history write failed:", err)
          );
        }
      }

      return response;
    }

    return NextResponse.json(snapshot, { headers: buildPipelineHeaders() });
  } catch (error) {
    const cookieStore = await cookies();
    const entitlement = parsePremiumEntitlement(
      cookieStore.get(PREMIUM_ENTITLEMENT_COOKIE_NAME)?.value ?? null
    );
    const accountEmail = normalizeAccountEmail(
      cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value ?? null
    );
    const archivedEmail = entitlement?.subscriberEmail?.trim() || accountEmail;
    if (archivedEmail) {
      const archived = await getArchivedSubscriberReportByEmailAndJob({
        email: archivedEmail,
        jobId,
      }).catch(() => null);
      if (archived) {
        return NextResponse.json(
          {
            job_id: jobId,
            status: "success",
            source: "archive",
            result: archived,
          },
          { headers: buildPipelineHeaders() }
        );
      }
    }

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
