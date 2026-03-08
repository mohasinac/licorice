// app/api/admin/support/tickets/[id]/reply/route.ts
// POST — admin replies to a ticket
import { NextResponse, type NextRequest } from "next/server";
import { getServerUser } from "@/lib/auth";

const HTML_ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function escapeHtml(s: string) { return s.replace(/[&<>"']/g, (c) => HTML_ESC[c]); }

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
  if (typeof b.message !== "string" || !b.message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const message = b.message.trim().slice(0, 2000);
  const isInternalNote = b.isInternalNote === true;
  const newStatus = typeof b.status === "string" ? b.status : "waiting_customer";

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    const ticketRef = adminDb.collection("supportTickets").doc(id);
    const ticketDoc = await ticketRef.get();
    if (!ticketDoc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await ticketRef.collection("messages").add({
      senderType: "admin",
      senderId: user.uid,
      senderName: user.displayName ?? "Support Team",
      body: message,
      isInternalNote,
      createdAt: FieldValue.serverTimestamp(),
    });

    await ticketRef.update({
      status: isInternalNote ? ticketDoc.data()?.status : newStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Send email to customer (non-blocking, non-internal only)
    if (!isInternalNote) {
      try {
        const ticketData = ticketDoc.data() as {
          guestEmail?: string;
          userId?: string;
          ticketNumber?: string;
          subject?: string;
        };
        const recipientEmail = ticketData.guestEmail;
        const resendKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.RESEND_FROM_EMAIL ?? "orders@licoriceherbal.in";
        if (resendKey && recipientEmail) {
          const { Resend } = await import("resend");
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: fromEmail,
            to: recipientEmail,
            subject: `Re: [${ticketData.ticketNumber}] ${ticketData.subject}`,
            html: `<p>Hi,</p><p>Our support team has replied to your ticket <strong>${escapeHtml(ticketData.ticketNumber ?? "")}</strong>:</p><blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">${escapeHtml(message)}</blockquote><p>Log in to your account to view the full conversation and reply.</p><p>Regards,<br/>Licorice Herbals Support</p>`,
          });
        }
      } catch (emailErr) {
        console.warn("[admin/support/reply] Email send failed (non-fatal):", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/support/reply] POST failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
