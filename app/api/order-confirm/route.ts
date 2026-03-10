// app/api/order-confirm/route.ts
// Called after payment is confirmed (admin WhatsApp confirm or Razorpay verify).
// Sends order confirmation email via Resend and writes the first confirmed timeline event.
// Idempotent — checks confirmationEmailSentAt before sending.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getOrder, updateOrderStatus } from "@/lib/db";
import { ORDERS_EMAIL, BRAND_NAME } from "@/constants/site";

const schema = z.object({ orderId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || !(await isAdmin(user.uid))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "orderId is required." }, { status: 400 });
  }

  const { orderId } = parsed.data;
  const order = await getOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Idempotency guard
  if ((order as { confirmationEmailSentAt?: unknown }).confirmationEmailSentAt) {
    return NextResponse.json({ ok: true, alreadySent: true });
  }

  // Update order status first (must happen regardless of email success)
  await updateOrderStatus(
    orderId,
    {
      paymentStatus: "paid",
      orderStatus: "confirmed",
    },
    {
      status: "confirmed",
      description: "Payment confirmed — order is being processed",
      source: "admin",
    },
  );

  // Send email via Resend (if configured)
  const { resolveKeys } = await import("@/lib/integration-keys");
  const integrationKeys = await resolveKeys();
  const resendKey = integrationKeys.resendApiKey;
  const customerEmail = (order.guestEmail ?? "").trim();

  if (resendKey && customerEmail) {
    try {
      const itemsHtml = order.items
        .map(
          (i) =>
            `<tr><td>${i.name} (${i.variantLabel}) × ${i.quantity}</td><td>₹${i.total}</td></tr>`,
        )
        .join("");

      const html = `
        <h2>Your ${BRAND_NAME} order is confirmed! 🌿</h2>
        <p>Hi ${order.shippingAddress.name},</p>
        <p>Thank you for your order. We're preparing it for dispatch.</p>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <table border="1" cellpadding="6" style="border-collapse:collapse;">
          <thead><tr><th>Item</th><th>Amount</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr><td><strong>Total</strong></td><td><strong>₹${order.total}</strong></td></tr>
          </tfoot>
        </table>
        <p>Delivery to: ${order.shippingAddress.line1}, ${order.shippingAddress.city} — ${order.shippingAddress.pincode}</p>
        <p>Expected: ${order.shippingMode === "express" ? "2–3" : "5–7"} business days.</p>
        <p>Questions? Reply to this email or WhatsApp us.</p>
        <p>Thank you for choosing ${BRAND_NAME}! 💚</p>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: integrationKeys.resendFromEmail,
          to: customerEmail,
          subject: `Order Confirmed — ${order.orderNumber} | ${BRAND_NAME}`,
          html,
        }),
      });

      // Mark confirmationEmailSentAt
      try {
        const { adminDb } = await import("@/lib/firebase/admin");
        const { FieldValue } = await import("firebase-admin/firestore");
        await adminDb.collection("orders").doc(orderId).update({
          confirmationEmailSentAt: FieldValue.serverTimestamp(),
        });
      } catch {
        /* non-fatal */
      }
    } catch (err) {
      console.error("[order-confirm] Resend email failed", err);
      // Order is already confirmed — email failure is non-fatal
      return NextResponse.json({ ok: true, emailSent: false });
    }
  }

  return NextResponse.json({ ok: true });
}