import type { TeacherApprovalStatus, UserRole } from "./supabase";

export const APP_SESSION_COOKIE = "explain_code_session";

export interface AppUserSession {
  userId: string;
  username: string;
  displayName: string;
  role: UserRole;
  teacherStatus?: TeacherApprovalStatus;
  roomCode?: string;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET?.trim() ||
    process.env.SERVER_PEPPER?.trim() ||
    "_explain_code_pepper_2026"
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(str: string): Uint8Array | null {
  try {
    const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function importHmacKey(usage: "sign" | "verify"): Promise<CryptoKey> {
  const secretBytes = textEncoder.encode(getSessionSecret());
  return globalThis.crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
}

/**
 * สร้าง Token สำหรับ Session Cookie พร้อมลายเซ็น HMAC-SHA256
 * รูปแบบ: <base64url(payload)>.<base64url(hmacSignature)>
 */
export async function signSessionToken(session: AppUserSession): Promise<string> {
  const payloadBytes = textEncoder.encode(JSON.stringify(session));
  const payloadB64 = toBase64Url(payloadBytes);

  const key = await importHmacKey("sign");
  const sigBuffer = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(payloadB64)
  );
  const sigB64 = toBase64Url(new Uint8Array(sigBuffer));

  return `${payloadB64}.${sigB64}`;
}

/**
 * ตรวจสอบลายเซ็น HMAC-SHA256 ของ Session Cookie
 * หากถูกแก้ไขหรือไม่มีลายเซ็นที่ถูกต้อง จะคืนค่า null ทันที
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<AppUserSession | null> {
  if (!token || typeof token !== "string") return null;

  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0 || dotIdx !== token.lastIndexOf(".")) {
    return null;
  }

  const payloadB64 = token.slice(0, dotIdx);
  const sigB64 = token.slice(dotIdx + 1);
  if (!payloadB64 || !sigB64) return null;

  const sigBytes = fromBase64Url(sigB64);
  if (!sigBytes) return null;

  try {
    const key = await importHmacKey("verify");
    const sigCopy = new Uint8Array(sigBytes.length);
    sigCopy.set(sigBytes);
    const isValid = await globalThis.crypto.subtle.verify(
      "HMAC",
      key,
      sigCopy,
      textEncoder.encode(payloadB64)
    );
    if (!isValid) return null;

    const payloadBytes = fromBase64Url(payloadB64);
    if (!payloadBytes) return null;

    const parsed = JSON.parse(textDecoder.decode(payloadBytes)) as AppUserSession;
    if (
      !parsed ||
      typeof parsed.userId !== "string" ||
      !parsed.userId ||
      typeof parsed.role !== "string" ||
      !parsed.role
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
