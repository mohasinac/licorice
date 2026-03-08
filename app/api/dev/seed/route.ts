// app/api/dev/seed/route.ts
// Upserts all SEED_MAP documents (by id) into Firestore and creates the admin user.
// Returns a rollcall: each seed ID and whether it exists in Firestore after seeding.

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
    const { FieldValue } = await import("firebase-admin/firestore");

    for (const [collection, docs] of Object.entries(SEED_MAP)) {
      if (docs.length === 0) continue;
      const batch = adminDb.batch();
      for (const doc of docs) {
        batch.set(adminDb.collection(collection).doc(doc.id), doc, { merge: true });
      }
      await batch.commit();
    }

    // Create admin user in Firebase Auth (or update if exists)
    try {
      let adminUid: string;
      // Try by email first, then by UID, then create fresh
      try {
        const existing = await adminAuth.getUserByEmail(SEED_ADMIN_USER.email);
        adminUid = existing.uid;
      } catch {
        try {
          const existingByUid = await adminAuth.getUser(SEED_ADMIN_USER.uid);
          adminUid = existingByUid.uid;
        } catch {
          const created = await adminAuth.createUser({
            uid: SEED_ADMIN_USER.uid,
            email: SEED_ADMIN_USER.email,
            password: SEED_ADMIN_USER.password,
            displayName: SEED_ADMIN_USER.displayName,
          });
          adminUid = created.uid;
        }
      }
      await adminAuth.setCustomUserClaims(adminUid, { role: "admin" });
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
    } catch (authErr) {
      console.warn("[dev/seed] Admin user creation failed:", authErr);
    }

    const rollcall = await takeRollcall(adminDb);
    return NextResponse.json({ success: true, rollcall });
  } catch (err) {
    console.error("[dev/seed] Failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const rollcall = await takeRollcall(adminDb);
    return NextResponse.json({ success: true, rollcall });
  } catch (err) {
    console.error("[dev/seed] Status check failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
