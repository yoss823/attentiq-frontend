import "server-only";

export const ACCOUNT_SESSION_COOKIE_NAME = "attentiq_account_email";

export function normalizeAccountEmail(value: string | null | undefined) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed : null;
}
