// app/api/support/tickets/[id]/route.ts
// GET — fetch a single ticket + its messages (owner or admin)
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { toSafeDate } from "@/lib/utils";
import type { SupportTicket, TicketMessage } from "@/lib/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const ticketDoc = await adminDb.collection("supportTickets").doc(id).get();
    if (!ticketDoc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = ticketDoc.data() as Omit<SupportTicket, "id">;
    // Only allow owner or admin
    if (data.userId !== user.uid && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messagesSnap = await adminDb
      .collection("supportTickets")
      .doc(id)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesSnap.docs.map((d) => {
      const msg = d.data();
      return {
        ...msg,
        createdAt: (toSafeDate(msg.createdAt) ?? new Date()).toISOString(),
      };
    });

    const ticket = {
      id: ticketDoc.id,
      ...data,
      createdAt: (toSafeDate(data.createdAt) ?? new Date()).toISOString(),
      updatedAt: (toSafeDate(data.updatedAt) ?? new Date()).toISOString(),
      resolvedAt: data.resolvedAt ? (toSafeDate(data.resolvedAt))?.toISOString() ?? null : null,
    };
    return NextResponse.json({ ticket, messages });
  } catch (err) {
    console.error("[support/tickets/id] GET failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
