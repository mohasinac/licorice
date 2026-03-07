// app/api/dev/unseed/route.ts
// Deletes all documents in all seed collections from Firestore and removes the seed admin user.
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
      { success: true, message: "Seed mode — nothing to delete" },
      { status: 200 },
    );
  }

  const results: Record<string, number> = {};

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { adminAuth } = await import("@/lib/firebase/admin");

    for (const [collection, docs] of Object.entries(SEED_MAP)) {
      const batch = adminDb.batch();
      for (const doc of docs) {
        const ref = adminDb.collection(collection).doc(doc.id);
        batch.delete(ref);
      }
      await batch.commit();
      results[collection] = docs.length;
    }

    // Remove admin user from Firebase Auth
    try {
      const user = await adminAuth.getUserByEmail(SEED_ADMIN_USER.email);
      await adminAuth.deleteUser(user.uid);
      await adminDb.collection("users").doc(user.uid).delete();
      results["admin_user"] = 1;
    } catch {
      // User doesn't exist — skip
    }

    return NextResponse.json({ success: true, deleted: results });
  } catch (err) {
    console.error("[dev/unseed] Failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
