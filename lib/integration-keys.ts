// lib/integration-keys.ts
// Server-only helper that resolves live integration keys.
// Priority: Firestore `settings/integrationKeys` (decrypted) → environment variables.
// Results are cached in process memory for 60 seconds to avoid Firestore reads on every request.

import { getIntegrationKeys } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

export interface ResolvedKeys {
  // Razorpay
  razorpayKeyId: string;
  razorpayKeySecret: string;
  /** OAuth access token — takes precedence over manual keys when present. */
  razorpayOAuthAccessToken?: string;
  razorpayOAuthAccountId?: string;
  // Resend
  resendApiKey: string;
  resendFromEmail: string;
  // Shiprocket
  shiprocketEmail: string;
  shiprocketPassword: string;
  shiprocketChannelId: string;
  // Admin notifications
  adminEmails: string[];
}

let _cache: { value: ResolvedKeys; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000; // 1 minute

/** Invalidates the in-process cache — call after admin saves new keys. */
export function invalidateIntegrationKeysCache(): void {
  _cache = null;
}

function dbOrEnv(dbVal: string | undefined, envVal: string | undefined): string {
  if (dbVal) {
    try {
      return decrypt(dbVal);
    } catch {
      return dbVal;
    }
  }
  return envVal ?? "";
}

/** Resolves all integration keys from DB (with env fallback). Cached 60 s. */
export async function resolveKeys(): Promise<ResolvedKeys> {
  if (_cache && _cache.expiresAt > Date.now()) return _cache.value;

  const db = await getIntegrationKeys();

  const oauthToken = db.razorpayOAuthAccessToken
    ? decrypt(db.razorpayOAuthAccessToken)
    : undefined;
  const oauthExpiry = db.razorpayOAuthExpiresAt ? new Date(db.razorpayOAuthExpiresAt) : null;
  // Treat OAuth token as expired if past its expiry time
  const validOAuthToken =
    oauthToken && (!oauthExpiry || oauthExpiry.getTime() > Date.now()) ? oauthToken : undefined;

  // Plaintext DB fields (not encrypted — use direct value or env fallback)
  const plainOrEnv = (dbVal: string | undefined, envVal: string | undefined) =>
    dbVal || envVal || "";

  const value: ResolvedKeys = {
    razorpayKeyId: dbOrEnv(db.razorpayKeyId, process.env.RAZORPAY_KEY_ID),
    razorpayKeySecret: dbOrEnv(db.razorpayKeySecret, process.env.RAZORPAY_KEY_SECRET),
    razorpayOAuthAccessToken: validOAuthToken,
    razorpayOAuthAccountId: db.razorpayOAuthAccountId,
    resendApiKey: dbOrEnv(db.resendApiKey, process.env.RESEND_API_KEY),
    resendFromEmail:
      plainOrEnv(db.resendFromEmail, process.env.RESEND_FROM_EMAIL) ||
      "orders@licoriceherbal.in",
    shiprocketEmail: plainOrEnv(db.shiprocketEmail, process.env.SHIPROCKET_EMAIL),
    shiprocketPassword: dbOrEnv(db.shiprocketPassword, process.env.SHIPROCKET_PASSWORD),
    shiprocketChannelId: plainOrEnv(db.shiprocketChannelId, process.env.SHIPROCKET_CHANNEL_ID),
    adminEmails: plainOrEnv(db.adminEmails, process.env.ADMIN_EMAILS)
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean),
  };

  _cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  return value;
}

/** True when Shiprocket credentials have been configured (DB or env). */
export async function isShiprocketConfigured(): Promise<boolean> {
  const keys = await resolveKeys();
  return !!(keys.shiprocketEmail && keys.shiprocketPassword);
}
