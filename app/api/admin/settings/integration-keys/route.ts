// app/api/admin/settings/integration-keys/route.ts
// GET  → returns masked key values (safe to display in admin UI)
// PATCH → encrypts and saves new key values to Firestore

import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getIntegrationKeys, updateIntegrationKeys } from "@/lib/db";
import { encrypt, maskKey, isEncrypted, decrypt } from "@/lib/encryption";
import { invalidateIntegrationKeysCache } from "@/lib/integration-keys";
import { z } from "zod";

// Fields that must be stored encrypted
const SECRET_FIELDS = new Set([
  "razorpayKeyId",
  "razorpayKeySecret",
  "razorpayOAuthAccessToken",
  "razorpayOAuthRefreshToken",
  "resendApiKey",
  "shiprocketPassword",
]);

const patchSchema = z.object({
  razorpayKeyId: z.string().optional(),
  razorpayKeySecret: z.string().optional(),
  resendApiKey: z.string().optional(),
  resendFromEmail: z.string().email().optional().or(z.literal("")),
  shiprocketEmail: z.string().optional(),
  shiprocketPassword: z.string().optional(),
  shiprocketChannelId: z.string().optional(),
  adminEmails: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const adminCheck = await isAdmin(user.uid);
  if (!adminCheck) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const keys = await getIntegrationKeys();

  // Return masked values — never expose secrets to the browser
  const masked: Record<string, string | boolean | undefined> = {};
  for (const [key, value] of Object.entries(keys)) {
    if (typeof value !== "string") {
      masked[key] = value as string | boolean | undefined;
      continue;
    }
    if (SECRET_FIELDS.has(key) && value) {
      // Decrypt first, then mask for display
      const plain = isEncrypted(value) ? decrypt(value) : value;
      masked[key] = maskKey(plain);
      // Also expose a boolean so the UI knows a value is set
      masked[`${key}IsSet`] = true;
    } else {
      // Non-secret fields returned as-is (e.g. emails, channelId)
      masked[key] = value;
    }
  }

  // OAuth connection status — razorpayOAuthExpiresAt may be a Firestore Timestamp or ISO string
  let oauthExpired = false;
  if (keys.razorpayOAuthExpiresAt) {
    const exp =
      typeof (keys.razorpayOAuthExpiresAt as unknown as { toDate?: () => Date }).toDate === "function"
        ? (keys.razorpayOAuthExpiresAt as unknown as { toDate: () => Date }).toDate()
        : new Date(keys.razorpayOAuthExpiresAt as string);
    oauthExpired = exp.getTime() < Date.now();
  }
  masked.razorpayOAuthConnected = !!(keys.razorpayOAuthAccessToken && !oauthExpired);

  return NextResponse.json(masked);
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const adminCheck = await isAdmin(user.uid);
  if (!adminCheck) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates: Record<string, string> = {};

  for (const [field, value] of Object.entries(parsed.data)) {
    if (value === undefined || value === "") continue;
    // Skip masked placeholders — if user didn't change the field, they send the masked value
    if (value.includes("•")) continue;

    if (SECRET_FIELDS.has(field)) {
      updates[field] = encrypt(value);
    } else {
      updates[field] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, noChanges: true });
  }

  await updateIntegrationKeys(updates);
  invalidateIntegrationKeysCache();

  return NextResponse.json({ ok: true });
}

// DELETE a specific key (disconnect OAuth, remove a key)
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const adminCheck = await isAdmin(user.uid);
  if (!adminCheck) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const field = searchParams.get("field");

  const allowedFields = [
    "razorpayKeyId",
    "razorpayKeySecret",
    "razorpayOAuthAccessToken",
    "razorpayOAuthRefreshToken",
    "razorpayOAuthAccountId",
    "razorpayOAuthExpiresAt",
    "resendApiKey",
    "resendFromEmail",
    "shiprocketEmail",
    "shiprocketPassword",
    "shiprocketChannelId",
    "adminEmails",
  ];

  if (!field || !allowedFields.includes(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");

  // Use FieldValue.delete() to remove the field
  await adminDb
    .collection("settings")
    .doc("integrationKeys")
    .set({ [field]: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });

  invalidateIntegrationKeysCache();

  return NextResponse.json({ ok: true });
}
