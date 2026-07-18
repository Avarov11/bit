const SECRET = process.env.SESSION_SECRET ?? "fallback-secret-change-me";
const COOKIE = "biteez_admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

async function key() {
  const enc = new TextEncoder().encode(SECRET);
  return crypto.subtle.importKey("raw", enc, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createToken(payload: { username: string; role: "admin" | "readonly" }): Promise<string> {
  const data = btoa(JSON.stringify(payload));
  const k = await key();
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(data));
  const arr = new Uint8Array(sig); let sigStr = ""; for (let i = 0; i < arr.length; i++) sigStr += String.fromCharCode(arr[i]);
  const sigB64 = btoa(sigStr);
  return `${data}.${sigB64}`;
}

export async function verifyToken(token: string): Promise<{ username: string; role: "admin" | "readonly" } | null> {
  try {
    const [data, sigB64] = token.split(".");
    if (!data || !sigB64) return null;
    const k = await key();
    const sigArr = atob(sigB64); const sig = new Uint8Array(sigArr.length); for (let i = 0; i < sigArr.length; i++) sig[i] = sigArr.charCodeAt(i);
    const valid = await crypto.subtle.verify("HMAC", k, sig, new TextEncoder().encode(data));
    if (!valid) return null;
    return JSON.parse(atob(data));
  } catch {
    return null;
  }
}

export { COOKIE, MAX_AGE };
