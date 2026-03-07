// app/api/dev/seed/route.ts
// Upserts all SEED_MAP documents into Firestore and creates the admin user in Firebase Auth.
// Protected: only available in development; returns 404 in production.

import { NextResponse, type NextRequest } from "next/server";
import { SEED_MAP } from "@/lib/seeds";
import { SEED_ADMIN_USER } from "@/lib/seeds/users";
import { isFirebaseReady } from "@/lib/db";

export async function POST(_request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isFirebaseReady()) {
    return NextResponse.json(
      { success: true, message: "Seed mode — no Firestore writes performed" },
      { status: 200 },
    );
  }

  const results: Record<string, number> = {};

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { adminAuth } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    // Seed Firestore collections
    for (const [collection, docs] of Object.entries(SEED_MAP)) {
      const batch = adminDb.batch();
      for (const doc of docs) {
        const ref = adminDb.collection(collection).doc(doc.id);
        batch.set(ref, doc, { merge: true });
      }
      await batch.commit();
      results[collection] = docs.length;
    }

    // Create admin user in Firebase Auth (or update if exists)
    try {
      let adminUid: string;
      try {
        const existing = await adminAuth.getUserByEmail(SEED_ADMIN_USER.email);
        adminUid = existing.uid;
      } catch {
        // User doesn't exist — create it
        const created = await adminAuth.createUser({
          uid: SEED_ADMIN_USER.uid,
          email: SEED_ADMIN_USER.email,
          password: SEED_ADMIN_USER.password,
          displayName: SEED_ADMIN_USER.displayName,
        });
        adminUid = created.uid;
      }
      // Set admin custom claims
      await adminAuth.setCustomUserClaims(adminUid, { role: "admin" });
      // Store user doc in Firestore
      await adminDb.collection("users").doc(adminUid).set(
        {
          uid: adminUid,
          email: SEED_ADMIN_USER.email,
          displayName: SEED_ADMIN_USER.displayName,
          role: "admin",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      results["admin_user"] = 1;
    } catch (authErr) {
      console.warn("[dev/seed] Admin user creation failed:", authErr);
      results["admin_user_error"] = 0;
    }

    return NextResponse.json({ success: true, seeded: results });
  } catch (err) {
    console.error("[dev/seed] Failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
