// app/api/admin/support/tickets/[id]/status/route.ts
// PATCH — update ticket status
import { NextResponse, type NextRequest } from "next/server";
import { getServerUser } from "@/lib/auth";
import { isFirebaseReady } from "@/lib/db";

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
  if (typeof b.status !== "string") {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const validStatuses = ["open", "in_progress", "waiting_customer", "resolved", "closed"];
  if (!validStatuses.includes(b.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (!isFirebaseReady()) {
    return NextResponse.json({ success: true });
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    const updateData: Record<string, unknown> = {
      status: b.status,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (b.status === "resolved" || b.status === "closed") {
      updateData.resolvedAt = FieldValue.serverTimestamp();
    }

    await adminDb.collection("supportTickets").doc(id).update(updateData);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/support/status] PATCH failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
