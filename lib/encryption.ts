// lib/encryption.ts
// Server-only AES-256-GCM encryption for storing sensitive integration keys in Firestore.
// Requires ENCRYPTION_KEY env var: exactly 64 hex characters (256-bit key).
//
// Encrypted value format:  <iv_hex>:<authTag_hex>:<ciphertext_hex>
// If ENCRYPTION_KEY is not set, values are stored/returned as-is (dev fallback with a warning).

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-gcm" as const;
const ENCRYPTED_PATTERN = /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i;

function getKey(): Buffer | null {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) return null;
  return Buffer.from(hex, "hex");
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  if (!key) {
    console.warn(
      "[encryption] ENCRYPTION_KEY is not set or invalid (must be 64 hex chars). " +
        "Storing integration key in plaintext — set ENCRYPTION_KEY before deploying.",
    );
    return plaintext;
  }
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag(); // 128-bit authentication tag
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext.toString("hex")}`;
}

export function decrypt(value: string): string {
  const key = getKey();
  // If the value doesn't look encrypted (no key was set when saved), return as-is
  if (!key || !ENCRYPTED_PATTERN.test(value)) return value;
  const parts = value.split(":");
  if (parts.length !== 3) return value;
  const [ivHex, authTagHex, cipherHex] = parts;
  try {
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const ciphertext = Buffer.from(cipherHex, "hex");
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    console.error("[encryption] Decryption failed — key mismatch or corrupted ciphertext");
    return "";
  }
}

/** Returns true if the value appears to be an AES-GCM encrypted blob. */
export function isEncrypted(value: string): boolean {
  return ENCRYPTED_PATTERN.test(value) && value.split(":").length === 3;
}

/**
 * Masks a plaintext key for display (e.g. "re_Abc123...xyz" → "re_Ab••••••••xyz").
 * Shows first 6 and last 4 characters.
 */
export function maskKey(value: string): string {
  if (!value) return "";
  if (value.length <= 10) return "••••••••";
  return `${value.slice(0, 6)}${"•".repeat(8)}${value.slice(-4)}`;
}
