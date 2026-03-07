// app/api/contact/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { isFirebaseReady } from "@/lib/db";

interface ContactBody {
  name: string;
  email: string;
  phone?: string;
  message: string;
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

  const { name, email, phone, message } = body;
  const sanitised = {
    name: name.trim().slice(0, 100),
    email: email.trim().toLowerCase().slice(0, 254),
    phone: typeof phone === "string" ? phone.trim().slice(0, 15) : undefined,
    message: message.trim().slice(0, 2000),
  };

  if (!isFirebaseReady()) {
    console.log("[contact] Mock submission:", sanitised);
    return NextResponse.json({ success: true });
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    await adminDb.collection("supportTickets").add({
      ...sanitised,
      source: "contact_form",
      status: "open",
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Firestore write failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
