
// src/lib/externalAuth.ts
import "server-only";

/**
 * Verify a BUYER on the partner site.
 * We POST {email, password} to their JWT endpoint.
 * If it returns tokens (200 + { access: "..." }), we accept.
 *
 * ENV:
 *   EXTERNAL_BUYER_AUTH_URL=https://partner.example.com/api/auth/jwt/create/
 *   (optional) EXTERNAL_TIMEOUT_MS=6000
 *
 * DEV: if EXTERNAL_BUYER_AUTH_URL is not set, only test@example.com/test1234 passes.
 */
export async function verifyOnPartner(
  email: string,
  password: string
): Promise<"ok" | "deny" | "unavailable"> {
  const url = process.env.EXTERNAL_BUYER_AUTH_URL;
  const timeoutMs = Number(process.env.EXTERNAL_TIMEOUT_MS || 6000);

  if (!url) {
    // Dev mock
    return email === "test@example.com" && password === "test1234" ? "ok" : "deny";
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // If the partner expects { username, password }, change "email" -> "username".
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(t);

    if (!res.ok) return "deny";
    const data = await res.json().catch(() => ({}));
    // SimpleJWT-style success usually includes { access, refresh }
    return typeof data?.access === "string" ? "ok" : "deny";
  } catch {
    clearTimeout(t);
    return "unavailable";
  }
}
