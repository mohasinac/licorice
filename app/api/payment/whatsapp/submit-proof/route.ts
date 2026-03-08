// app/api/payment/whatsapp/submit-proof/route.ts
// Accepts a payment screenshot upload from an authenticated customer.
// Stores in Firebase Storage and updates the order's paymentStatus.

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrder } from "@/lib/db";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const orderId = formData.get("orderId") as string | null;

  if (!file || !orderId) {
    return NextResponse.json({ error: "file and orderId are required." }, { status: 400 });
  }

  // Validate MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, or WebP images are accepted." },
      { status: 400 },
    );
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large. Maximum 5 MB." }, { status: 400 });
  }

  // Verify the order belongs to this user
  const order = await getOrder(orderId);
  if (!order || order.userId !== user.uid) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { getStorage } = await import("firebase-admin/storage");
    const { FieldValue } = await import("firebase-admin/firestore");

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const storagePath = `payment-proofs/${orderId}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = getStorage().bucket();
    const fileRef = bucket.file(storagePath);

    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    });
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // Update order
    await adminDb.collection("orders").doc(orderId).update({
      paymentStatus: "proof_submitted",
      whatsappProofImageUrl: publicUrl,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (err) {
    console.error("[submit-proof] failed", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
