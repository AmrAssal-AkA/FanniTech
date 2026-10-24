export interface JwtPayload {
  sub?: string;
  role?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

function decodeBase64Url(value: string): string {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) base64 += "=";
  return atob(base64);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

function decodeBase64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = decodeBase64Url(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export async function verifyJwtSignature(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [header, payload, signature] = parts;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    return await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64UrlToBytes(signature),
      new TextEncoder().encode(`${header}.${payload}`)
    );
  } catch {
    return false;
  }
}

export function isJwtExpired(payload: JwtPayload): boolean {
  return typeof payload.exp === "number" && Date.now() >= payload.exp * 1000;
}
