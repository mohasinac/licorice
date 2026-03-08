// app/api/support/tickets/route.ts
// GET  — list tickets for the authenticated user
// POST — create a new ticket (auth required)
import { NextResponse, type NextRequest } from "next/server";
import { getServerUser } from "@/lib/auth";
import { toSafeDate } from "@/lib/utils";
import type { SupportTicket } from "@/lib/types";

function generateTicketNumber(): string {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("supportTickets")
      .where("userId", "==", user.uid)
      .orderBy("updatedAt", "desc")
      .limit(50)
      .get();

    const tickets = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: (toSafeDate(data.createdAt) ?? new Date()).toISOString(),
        updatedAt: (toSafeDate(data.updatedAt) ?? new Date()).toISOString(),
        resolvedAt: data.resolvedAt ? (toSafeDate(data.resolvedAt))?.toISOString() ?? null : null,
      };
    });
    return NextResponse.json({ tickets });
  } catch (err) {
    console.error("[support/tickets] GET failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  if (
    typeof b.subject !== "string" ||
    !b.subject.trim() ||
    typeof b.message !== "string" ||
    !b.message.trim()
  ) {
    return NextResponse.json({ error: "subject and message are required" }, { status: 400 });
  }

  const subject = b.subject.trim().slice(0, 200);
  const message = b.message.trim().slice(0, 2000);
  const category = typeof b.category === "string" ? b.category : "other";
  const orderId = typeof b.orderId === "string" ? b.orderId : undefined;
  const ticketNumber = generateTicketNumber();

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    const ticketRef = adminDb.collection("supportTickets").doc();
    await ticketRef.set({
      ticketNumber,
      userId: user.uid,
      subject,
      category,
      orderId,
      priority: "medium",
      status: "open",
      source: orderId ? "order_page" : "account",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await ticketRef.collection("messages").add({
      senderType: "customer",
      senderId: user.uid,
      body: message,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true, ticketNumber, ticketId: ticketRef.id });
  } catch (err) {
    console.error("[support/tickets] POST failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
