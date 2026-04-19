export async function createCheckoutSession(params: {
  jobId: string;
  videoUrl?: string;
}) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobId: params.jobId,
      videoUrl: params.videoUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Impossible de créer la session Stripe.");
  }

  const data = await response.json();

  if (!data?.url) {
    throw new Error("URL Stripe manquante.");
  }

  return data as { url: string };
}

export async function activatePremium(sessionId: string, jobId: string) {
  const response = await fetch("/api/set-premium", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId,
      jobId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Impossible d’activer le premium.");
  }

  return response.json();
}
