// app/api/support/tickets/[id]/reply/route.ts
// POST — customer replies to their own ticket
import { NextResponse, type NextRequest } from "next/server";
import { getServerUser } from "@/lib/auth";
import { isFirebaseReady } from "@/lib/db";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  if (typeof b.message !== "string" || !b.message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const message = b.message.trim().slice(0, 2000);

  if (!isFirebaseReady()) {
    return NextResponse.json({ success: true });
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    const ticketRef = adminDb.collection("supportTickets").doc(id);
    const ticketDoc = await ticketRef.get();
    if (!ticketDoc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = ticketDoc.data() as { userId?: string; status?: string };
    if (data.userId !== user.uid && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await ticketRef.collection("messages").add({
      senderType: "customer",
      senderId: user.uid,
      body: message,
      createdAt: FieldValue.serverTimestamp(),
    });

    await ticketRef.update({
      status: "open",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[support/tickets/id/reply] POST failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
