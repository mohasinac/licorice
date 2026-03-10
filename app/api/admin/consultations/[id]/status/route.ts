// app/api/admin/consultations/[id]/status/route.ts
// PATCH — update consultation status (admin only)
import { NextResponse, type NextRequest } from "next/server";
import { getServerUser } from "@/lib/auth";

const HTML_ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function escapeHtml(s: string) { return s.replace(/[&<>"']/g, (c) => HTML_ESC[c]); }

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
  const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
  if (typeof b.status !== "string" || !validStatuses.includes(b.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    const docRef = adminDb.collection("consultations").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {
      status: b.status,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (typeof b.adminNote === "string") {
      updateData.adminNote = b.adminNote.trim().slice(0, 1000);
    }

    await docRef.update(updateData);

    // Confirmation email to customer (non-blocking, on status = confirmed)
    if (b.status === "confirmed") {
      try {
        const data = docSnap.data() as {
          email?: string;
          name?: string;
          preferredDate?: string;
          preferredTime?: string;
          confirmationEmailSentAt?: unknown;
        };
        // Idempotency guard — only send once
        if (!data.confirmationEmailSentAt) {
          const { resolveKeys } = await import("@/lib/integration-keys");
          const emailKeys = await resolveKeys();
          const resendKey = emailKeys.resendApiKey;
          const fromEmail = emailKeys.resendFromEmail;
          if (resendKey && data.email) {
            const { Resend } = await import("resend");
            const resend = new Resend(resendKey);
            await resend.emails.send({
              from: fromEmail,
              to: data.email,
              subject: "Your Consultation is Confirmed — Licorice Herbals",
              html: `<p>Hi ${escapeHtml(data.name ?? "there")},</p><p>Your free consultation has been confirmed for <strong>${escapeHtml(data.preferredDate ?? "the scheduled date")}</strong> at <strong>${escapeHtml(data.preferredTime ?? "the scheduled time")}</strong>.</p><p>Our expert will reach out to you at the scheduled time. Please keep your phone handy.</p><p>Warm regards,<br/>Licorice Herbals Team</p>`,
            });
            // Mark that the email was sent so it won't be resent on subsequent confirmations
            await docRef.update({ confirmationEmailSentAt: FieldValue.serverTimestamp() });
          }
        }
      } catch (emailErr) {
        console.warn("[admin/consultations/status] Email failed (non-fatal):", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/consultations/status] PATCH failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
