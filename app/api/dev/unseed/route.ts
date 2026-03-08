// app/api/dev/unseed/route.ts
// Deletes all seed documents (by id) from Firestore and removes the seed admin user.
// Returns a rollcall: each seed ID and whether it exists in Firestore after unseeding.

import { NextResponse, type NextRequest } from "next/server";
import { SEED_MAP } from "@/lib/seeds";
import { SEED_ADMIN_USER } from "@/lib/seeds/users";

type Rollcall = Record<string, Record<string, boolean>>;

async function takeRollcall(adminDb: FirebaseFirestore.Firestore): Promise<Rollcall> {
  const rollcall: Rollcall = {};
  for (const [collection, docs] of Object.entries(SEED_MAP)) {
    if (docs.length === 0) continue;
    const refs = docs.map((d) => adminDb.collection(collection).doc(d.id));
    const snaps = await adminDb.getAll(...refs);
    rollcall[collection] = {};
    for (const snap of snaps) {
      rollcall[collection][snap.id] = snap.exists;
    }
  }
  return rollcall;
}

export async function POST(_request: NextRequest) {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { adminAuth } = await import("@/lib/firebase/admin");

    for (const [collection, docs] of Object.entries(SEED_MAP)) {
      if (docs.length === 0) continue;
      const batch = adminDb.batch();
      for (const doc of docs) {
        batch.delete(adminDb.collection(collection).doc(doc.id));
      }
      await batch.commit();
    }

    // Remove admin user from Firebase Auth
    try {
      const user = await adminAuth.getUserByEmail(SEED_ADMIN_USER.email);
      await adminAuth.deleteUser(user.uid);
      await adminDb.collection("users").doc(user.uid).delete();
    } catch {
      // User doesn't exist — skip
    }

    const rollcall = await takeRollcall(adminDb);
    return NextResponse.json({ success: true, rollcall });
  } catch (err) {
    console.error("[dev/unseed] Failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
