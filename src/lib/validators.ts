// src/lib/validators.ts
export function isValidICE(v: string) {
  return /^\d{15}$/.test(v);
}

export function isValidMapsUrl(u: string) {
  if (!u || typeof u !== "string") return false;
  try {
    const url = new URL(u);
    const host = url.hostname.toLowerCase();
    const okHost =
      host === "maps.app.goo.gl" ||
      host === "goo.gl" ||
      host === "www.google.com" ||
      host === "google.com";
    const okPath = url.pathname.startsWith("/maps") || host === "maps.app.goo.gl";
    return okHost && okPath;
  } catch {
    return false;
  }
}
