// app/api/dev/unseed/route.ts
// Deletes all seed documents (by id) from Firestore and removes the seed admin user.
// Returns a rollcall: each seed ID and whether it exists in Firestore after unseeding.
// In production: requires a valid admin ID token in the Authorization header.

import { NextResponse, type NextRequest } from "next/server";
import { SEED_MAP } from "@/lib/seeds";
import { SEED_ADMIN_USER } from "@/lib/seeds/users";

async function requireDevOrAdmin(request: NextRequest): Promise<NextResponse | null> {
  if (process.env.NODE_ENV === "development") return null;
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { adminAuth } = await import("@/lib/firebase/admin");
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

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
  const authError = await requireDevOrAdmin(_request);
  if (authError) return authError;
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

    // Remove admin user from Firebase Auth (try by email, fallback to UID)
    try {
      let uid: string | undefined;
      try {
        const user = await adminAuth.getUserByEmail(SEED_ADMIN_USER.email);
        uid = user.uid;
      } catch {
        try {
          const user = await adminAuth.getUser(SEED_ADMIN_USER.uid);
          uid = user.uid;
        } catch {
          // User doesn't exist — skip
        }
      }
      if (uid) {
        await adminAuth.deleteUser(uid);
        await adminDb.collection("users").doc(uid).delete();
      }
    } catch {
      // Deletion failed — skip
    }

    const rollcall = await takeRollcall(adminDb);
    return NextResponse.json({ success: true, rollcall });
  } catch (err) {
    console.error("[dev/unseed] Failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
