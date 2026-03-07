// app/api/dev/seed/route.ts
// Upserts all SEED_MAP documents into Firestore.
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
      { success: true, message: "Mock mode — no Firestore writes performed" },
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
        batch.set(ref, doc, { merge: true });
      }
      await batch.commit();
      results[collection] = docs.length;
    }

    return NextResponse.json({ success: true, seeded: results });
  } catch (err) {
    console.error("[dev/seed] Failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
