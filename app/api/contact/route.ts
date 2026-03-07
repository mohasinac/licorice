// app/api/contact/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { isFirebaseReady } from "@/lib/db";

interface ContactBody {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  category?: string;
}

function isValidContactBody(b: unknown): b is ContactBody {
  if (typeof b !== "object" || b === null) return false;
  const o = b as Record<string, unknown>;
  return (
    typeof o.name === "string" &&
    o.name.trim().length > 0 &&
    typeof o.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email) &&
    typeof o.message === "string" &&
    o.message.trim().length > 0
  );
}

function generateTicketNumber(): string {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidContactBody(body)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { name, email, phone, subject, message, category } = body;
  const sanitised = {
    name: name.trim().slice(0, 100),
    email: email.trim().toLowerCase().slice(0, 254),
    phone: typeof phone === "string" ? phone.trim().slice(0, 15) : undefined,
    subject: typeof subject === "string" ? subject.trim().slice(0, 200) : "Contact form enquiry",
    message: message.trim().slice(0, 2000),
    category: typeof category === "string" ? category : "other",
  };

  const ticketNumber = generateTicketNumber();

  if (!isFirebaseReady()) {
    console.log("[contact] Mock submission:", sanitised, "ticketNumber:", ticketNumber);
    return NextResponse.json({ success: true, ticketNumber });
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    const ticketRef = adminDb.collection("supportTickets").doc();
    await ticketRef.set({
      ticketNumber,
      guestEmail: sanitised.email,
      subject: sanitised.subject,
      category: sanitised.category,
      priority: "medium",
      status: "open",
      source: "contact_form",
      guestName: sanitised.name,
      guestPhone: sanitised.phone,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    // Store first message in sub-collection
    await ticketRef.collection("messages").add({
      senderType: "customer",
      senderId: sanitised.email,
      body: sanitised.message,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true, ticketNumber });
  } catch (err) {
    console.error("[contact] Firestore write failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
