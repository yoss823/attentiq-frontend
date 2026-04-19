export type CreateCheckoutInput = {
  plan?: "single" | "pack5" | "unlimited";
  jobId: string;
  videoUrl?: string;
};

export type CreateCheckoutResponse = {
  url: string;
  sessionId: string;
};

export async function createCheckoutSession(
  input: CreateCheckoutInput
): Promise<CreateCheckoutResponse> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Unable to create checkout session");
  }

  return data;
}

export async function activatePremium(input: {
  sessionId: string;
  jobId: string;
}) {
  const res = await fetch("/api/set-premium", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Unable to activate premium");
  }

  return data;
}
