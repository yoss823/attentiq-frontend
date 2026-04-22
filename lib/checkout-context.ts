import { normalizeOfferSlug } from "@/lib/offer-config";

type QueryValue = string | string[] | undefined;

export type CheckoutContext = {
  offerSlug?: string | null;
  jobId?: string | null;
  videoUrl?: string | null;
};

export type SearchParamRecord = Record<string, QueryValue>;

function normalizeString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function readFirstSearchParam(value: QueryValue) {
  if (Array.isArray(value)) {
    return normalizeString(value[0]);
  }

  return normalizeString(value);
}

export function normalizeCheckoutContext(context: CheckoutContext = {}) {
  const normalizedOfferSlug = normalizeOfferSlug(context.offerSlug);

  return {
    offerSlug: normalizedOfferSlug ?? normalizeString(context.offerSlug),
    jobId: normalizeString(context.jobId),
    videoUrl: normalizeString(context.videoUrl),
  };
}

export function getCheckoutContextFromSearchParams(
  searchParams: SearchParamRecord
) {
  return normalizeCheckoutContext({
    offerSlug: readFirstSearchParam(searchParams.offerSlug),
    jobId: readFirstSearchParam(searchParams.jobId),
    videoUrl:
      readFirstSearchParam(searchParams.videoUrl) ??
      readFirstSearchParam(searchParams.url),
  });
}

export function buildCheckoutQueryString(context: CheckoutContext = {}) {
  const normalized = normalizeCheckoutContext(context);
  const params = new URLSearchParams();

  if (normalized.offerSlug) {
    params.set("offerSlug", normalized.offerSlug);
  }

  if (normalized.jobId) {
    params.set("jobId", normalized.jobId);
  }

  if (normalized.videoUrl) {
    params.set("videoUrl", normalized.videoUrl);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function buildOfferCheckoutHref(
  offerSlug: string,
  context: Omit<CheckoutContext, "offerSlug"> = {}
) {
  return `/checkout/${offerSlug}${buildCheckoutQueryString({
    ...context,
    offerSlug,
  })}`;
}

export function buildCheckoutSuccessHref(
  context: Omit<CheckoutContext, "offerSlug"> = {}
) {
  return `/checkout/success${buildCheckoutQueryString(context)}`;
}

export function buildResultHref(context: Omit<CheckoutContext, "offerSlug"> = {}) {
  const normalized = normalizeCheckoutContext(context);
  const params = new URLSearchParams();

  if (normalized.jobId) {
    params.set("jobId", normalized.jobId);
  }

  if (normalized.videoUrl) {
    params.set("videoUrl", normalized.videoUrl);
  }

  const queryString = params.toString();
  return queryString ? `/result?${queryString}` : "/result";
}

export function buildAnalyzeHref({
  jobId = null,
  videoUrl = null,
  paid = false,
}: {
  jobId?: string | null;
  videoUrl?: string | null;
  paid?: boolean;
} = {}) {
  const normalized = normalizeCheckoutContext({
    jobId,
    videoUrl,
  });
  const params = new URLSearchParams();

  if (normalized.jobId) {
    params.set("jobId", normalized.jobId);
  }

  if (normalized.videoUrl) {
    params.set("videoUrl", normalized.videoUrl);
  }

  if (paid) {
    params.set("paid", "1");
  }

  const queryString = params.toString();
  return queryString ? `/analyze?${queryString}` : "/analyze";
}
