import type { NextRequest } from "next/server";
import {
  parsePremiumEntitlement,
  PREMIUM_ENTITLEMENT_COOKIE_NAME,
} from "@/lib/premium";
import { canStartSubscriptionAnalysis } from "@/lib/subscriber-store";

export type SubscriptionQuotaBlock = {
  shouldBlock: true;
  reason:
    | "missing_subscriber_email"
    | "quota_exhausted"
    | "subscriber_account_unavailable";
  userMessage: string;
};

export type SubscriptionQuotaGate =
  | { shouldBlock: false }
  | SubscriptionQuotaBlock;

export async function enforceSubscriptionQuotaGate(
  req: NextRequest
): Promise<SubscriptionQuotaGate> {
  const entitlement = parsePremiumEntitlement(
    req.cookies.get(PREMIUM_ENTITLEMENT_COOKIE_NAME)?.value ?? null
  );

  const plan = entitlement?.plan;
  if (plan !== "5" && plan !== "pack15") {
    return { shouldBlock: false };
  }

  const email = entitlement?.subscriberEmail?.trim();
  if (!email) {
    return {
      shouldBlock: true,
      reason: "missing_subscriber_email",
      userMessage:
        "Cet abonnement n'est pas encore rattaché à un e-mail client. Revalidez le paiement depuis la page Merci.",
    };
  }

  const gate = await canStartSubscriptionAnalysis({ email, plan });
  if (gate.allowed) {
    return { shouldBlock: false };
  }

  if (gate.reason === "quota_exhausted") {
    const quota = typeof gate.monthlyQuota === "number" ? gate.monthlyQuota : 0;
    return {
      shouldBlock: true,
      reason: "quota_exhausted",
      userMessage: `Quota mensuel atteint (${quota} analyses). Votre compteur se réinitialise au prochain mois.`,
    };
  }

  return {
    shouldBlock: true,
    reason: "subscriber_account_unavailable",
    userMessage:
      "Impossible de vérifier votre quota abonné pour le moment. Réessayez dans quelques instants.",
  };
}
