// app/api/admin/corporate/[id]/status/route.ts
// PATCH — update corporate inquiry status (admin only)
import { NextResponse, type NextRequest } from "next/server";
import { getServerUser } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getServerUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const validStatuses = ["new", "in_progress", "won", "lost"];
  if (typeof b.status !== "string" || !validStatuses.includes(b.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    const docRef = adminDb.collection("corporateInquiries").doc(id);
    if (!(await docRef.get()).exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      status: b.status,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (typeof b.adminNote === "string") {
      updateData.adminNote = b.adminNote.trim().slice(0, 1000);
    }

    await docRef.update(updateData);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/corporate/status] PATCH failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
