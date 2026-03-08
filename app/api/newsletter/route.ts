// app/api/newsletter/route.ts
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? (body as Record<string, unknown>).email
      : undefined;

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const sanitisedEmail = email.trim().toLowerCase().slice(0, 254);

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    const col = adminDb.collection("newsletter");

    // Idempotent — use email as doc ID (slug-safe base64-like key)
    const docId = Buffer.from(sanitisedEmail).toString("base64url");
    await col.doc(docId).set(
      {
        email: sanitisedEmail,
        subscribedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[newsletter] Firestore write failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
