import { spawn } from "child_process";

export const runtime = "nodejs";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, subject, body: emailBody } =
    body as { email?: string; subject?: string; body?: string };

  if (!email || !isValidEmail(email)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }

  const finalSubject = (typeof subject === "string" && subject.trim())
    ? subject.trim()
    : "Votre diagnostic Attentiq";

  const finalBody = typeof emailBody === "string" ? emailBody : "Voici votre diagnostic Attentiq.";

  return new Promise<Response>((resolve) => {
    const child = spawn(
      "nanocorp",
      ["emails", "send", "--to", email.trim(), "--subject", finalSubject],
      { stdio: ["pipe", "pipe", "pipe"] }
    );

    child.stdin.write(finalBody, "utf8");
    child.stdin.end();

    child.on("close", (code) => {
      if (code === 0) {
        resolve(Response.json({ success: true }));
      } else {
        resolve(Response.json({ error: "Send failed" }, { status: 500 }));
      }
    });

    child.on("error", () => {
      resolve(Response.json({ error: "nanocorp CLI unavailable" }, { status: 500 }));
    });
  });
}
