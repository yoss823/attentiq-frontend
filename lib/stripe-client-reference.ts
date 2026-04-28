/**
 * Attache le job d'analyse à une session Checkout Stripe (Payment Links inclus)
 * via `client_reference_id`, car les metadata ne sont pas toujours présentes.
 * @see https://docs.stripe.com/payment-links/url-parameters
 */
const JOB_PREFIX = "attentiq:j:";

export function buildAttentiqPaymentClientReferenceId(
  jobId: string | null | undefined
): string | null {
  const j = typeof jobId === "string" ? jobId.trim() : "";
  if (!j) {
    return null;
  }
  const out = `${JOB_PREFIX}${j}`;
  if (out.length > 200) {
    return null;
  }
  return out;
}

export function parseJobIdFromAttentiqClientReferenceId(
  clientReferenceId: string | null | undefined
): string | null {
  const raw = clientReferenceId?.trim();
  if (!raw?.startsWith(JOB_PREFIX)) {
    return null;
  }
  const jobId = raw.slice(JOB_PREFIX.length).trim();
  return jobId || null;
}
