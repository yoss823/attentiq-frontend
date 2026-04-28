/**
 * Attache le job d'analyse à une session Checkout Stripe (Payment Links inclus)
 * via `client_reference_id`, car les metadata ne sont pas toujours présentes.
 * @see https://docs.stripe.com/payment-links/url-parameters
 */
const JOB_PREFIX = "attentiq:j:";
const CONTEXT_PREFIX = "attentiq:c:";

type StripeClientContext = {
  j?: string;
  u?: string;
};

export function buildAttentiqPaymentClientReferenceId(
  jobId: string | null | undefined,
  videoUrl?: string | null | undefined
): string | null {
  const j = typeof jobId === "string" ? jobId.trim() : "";
  const u = typeof videoUrl === "string" ? videoUrl.trim() : "";

  if (j || u) {
    const payload: StripeClientContext = {};
    if (j) payload.j = j;
    if (u) payload.u = u;
    const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
    const out = `${CONTEXT_PREFIX}${encoded}`;
    if (out.length <= 200) {
      return out;
    }
  }

  if (!j) return null;
  const out = `${JOB_PREFIX}${j}`;
  if (out.length > 200) {
    return null;
  }
  return out;
}

export function parseAttentiqClientReferenceContext(
  clientReferenceId: string | null | undefined
): { jobId: string | null; videoUrl: string | null } {
  const raw = clientReferenceId?.trim();
  if (!raw) return { jobId: null, videoUrl: null };
  if (raw.startsWith(CONTEXT_PREFIX)) {
    const data = raw.slice(CONTEXT_PREFIX.length).trim();
    if (!data) return { jobId: null, videoUrl: null };
    try {
      const jsonRaw = Buffer.from(data, "base64url").toString("utf8");
      const parsed = JSON.parse(jsonRaw) as StripeClientContext;
      const jobId = typeof parsed.j === "string" && parsed.j.trim() ? parsed.j.trim() : null;
      const videoUrl =
        typeof parsed.u === "string" && parsed.u.trim() ? parsed.u.trim() : null;
      return { jobId, videoUrl };
    } catch {
      return { jobId: null, videoUrl: null };
    }
  }
  if (raw.startsWith(JOB_PREFIX)) {
    const jobId = raw.slice(JOB_PREFIX.length).trim() || null;
    return { jobId, videoUrl: null };
  }
  return { jobId: null, videoUrl: null };
}

export function parseJobIdFromAttentiqClientReferenceId(
  clientReferenceId: string | null | undefined
): string | null {
  return parseAttentiqClientReferenceContext(clientReferenceId).jobId;
}
