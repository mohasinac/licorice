// app/api/account/delete/route.ts
// Deletes the authenticated user's Firebase Auth account and Firestore user document.
// The client must re-authenticate and send a fresh ID token before calling this.

import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { adminAuth } = await import("@/lib/firebase/admin");
    const { adminDb } = await import("@/lib/firebase/admin");

    // Delete all user data in a batch
    const batch = adminDb.batch();
    batch.delete(adminDb.collection("users").doc(user.uid));

    // Remove addresses sub-collection docs
    const addresses = await adminDb
      .collection("users")
      .doc(user.uid)
      .collection("addresses")
      .listDocuments();
    for (const ref of addresses) batch.delete(ref);

    await batch.commit();

    // Delete from Firebase Auth last (so the token stays valid for the batch above)
    await adminAuth.deleteUser(user.uid);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[account/delete] Failed:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
