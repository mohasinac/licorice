// app/api/dev/unseed/route.ts
// Deletes all documents in all seed collections from Firestore.
// Protected: only available in development; returns 404 in production.

import { NextResponse, type NextRequest } from "next/server";
import { SEED_MAP } from "@/lib/mocks";
import { isFirebaseReady } from "@/lib/db";

export async function POST(_request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isFirebaseReady()) {
    return NextResponse.json(
      { success: true, message: "Mock mode — nothing to delete" },
      { status: 200 },
    );
  }

  const results: Record<string, number> = {};

  try {
    const { adminDb } = await import("@/lib/firebase/admin");

    for (const [collection, docs] of Object.entries(SEED_MAP)) {
      const batch = adminDb.batch();
      for (const doc of docs) {
        const ref = adminDb.collection(collection).doc(doc.id);
        batch.delete(ref);
      }
      await batch.commit();
      results[collection] = docs.length;
    }

    return NextResponse.json({ success: true, deleted: results });
  } catch (err) {
    console.error("[dev/unseed] Failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
