// app/api/shiprocket/webhook/route.ts
// Receives Shiprocket status-update webhooks.
// Validates HMAC-SHA256 signature, maps status, updates order + timeline,
// and sends milestone emails to the customer.
//
// ── Expected payload shape (Shiprocket V2 webhook) ──────────────────────────
// Shiprocket POSTs JSON to this endpoint on each shipment status change.
// Key fields used by this handler:
//
//   awb              {string}  AWB tracking number — used to look up the order
//   channel_order_id {string}  Our orderNumber (e.g. "LH-2026-00001") set when
//                              we created the Shiprocket order — preferred lookup
//   current_status   {string}  Human-readable status string from Shiprocket
//                              (e.g. "Picked Up", "In Transit", "Delivered")
//   current_status_id{number}  Numeric Shiprocket status code (informational only)
//   shipment_id      {string}  Shiprocket internal shipment ID
//   scans            {Array}   Courier scan events — each has status, date,
//                              location, activity; appended to order timeline
//
// Unknown / unrecognised statuses are silently ignored (HTTP 200 returned) so
// that Shiprocket does not retry delivery of status-update events we don't need.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { createHmac } from "crypto";
import { mapShiprocketStatus } from "@/lib/shiprocket";
import type { OrderStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ShiprocketWebhookPayload {
  awb: string;
  order_id?: string; // Shiprocket's internal order ID
  current_status: string;
  current_status_id?: number;
  shipment_id?: string;
  scans?: Array<{
    status: string;
    date: string;
    location: string;
    activity?: string;
  }>;
  // Channel order ID we set — maps to our orderNumber
  channel_order_id?: string;
}

const MILESTONE_STATUSES: OrderStatus[] = ["shipped", "out_for_delivery", "delivered"];
const STATUS_DESCRIPTIONS: Record<string, string> = {
  shipped: "Your order has been picked up and is on its way!",
  out_for_delivery: "Your order is out for delivery today.",
  delivered: "Your order has been delivered. Enjoy!",
};

export async function POST(req: NextRequest): Promise<Response> {
  const rawBody = await req.text();

  // Validate HMAC signature
  const signature = req.headers.get("x-shiprocket-hmac-sha256") ?? "";
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET ?? "";

  if (secret) {
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    if (expected !== signature) {
      console.warn("[webhook/shiprocket] Invalid HMAC signature");
      return new Response("Unauthorized", { status: 401 });
    }
  }

  let payload: ShiprocketWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Map to internal order — prefer channel_order_id (our orderNumber)
  const orderNumber = payload.channel_order_id;
  const awbCode = payload.awb;
  const currentStatus = payload.current_status ?? "";

  if (!orderNumber && !awbCode) {
    return new Response("No order reference", { status: 400 });
  }

  const mapped = mapShiprocketStatus(currentStatus);
  if (!mapped) {
    // Unknown / uninteresting status — acknowledge receipt without processing
    return Response.json({ ok: true, skipped: true });
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    // Look up the order by orderNumber or awbCode
    let orderId: string | null = null;
    let customerEmail: string | null = null;
    let customerName: string | null = null;
    let orderNumber_: string | null = null;

    if (orderNumber) {
      const snap = await adminDb
        .collection("orders")
        .where("orderNumber", "==", orderNumber)
        .limit(1)
        .get();
      if (!snap.empty) {
        orderId = snap.docs[0].id;
        const data = snap.docs[0].data();
        customerEmail = data.guestEmail ?? null;
        customerName = data.shippingAddress?.name ?? null;
        orderNumber_ = data.orderNumber;
      }
    } else if (awbCode) {
      const snap = await adminDb
        .collection("orders")
        .where("awbCode", "==", awbCode)
        .limit(1)
        .get();
      if (!snap.empty) {
        orderId = snap.docs[0].id;
        const data = snap.docs[0].data();
        customerEmail = data.guestEmail ?? null;
        customerName = data.shippingAddress?.name ?? null;
        orderNumber_ = data.orderNumber;
      }
    }

    if (!orderId) {
      console.warn("[webhook/shiprocket] Order not found for payload", { orderNumber, awbCode });
      return Response.json({ ok: true, notFound: true });
    }

    const orderRef = adminDb.collection("orders").doc(orderId);

    const updates: Record<string, unknown> = {
      orderStatus: mapped.orderStatus,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (mapped.orderStatus === "delivered") {
      updates.deliveredAt = FieldValue.serverTimestamp();
    }

    // Use a batch: update order + append timeline event
    const batch = adminDb.batch();
    batch.update(orderRef, updates);

    const eventRef = orderRef.collection("timeline").doc();
    const latestScan = payload.scans?.[0];
    batch.set(eventRef, {
      status: mapped.orderStatus,
      description: latestScan?.activity ?? mapped.description,
      location: latestScan?.location ?? "",
      source: "shiprocket",
      createdAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    // Send milestone email
    if (
      MILESTONE_STATUSES.includes(mapped.orderStatus) &&
      customerEmail &&
      process.env.RESEND_API_KEY
    ) {
      const description = STATUS_DESCRIPTIONS[mapped.orderStatus] ?? mapped.description;
      await sendMilestoneEmail(
        customerEmail,
        customerName ?? "Customer",
        orderNumber_ ?? "",
        description,
        awbCode,
      );
    }
  } catch (err) {
    console.error("[webhook/shiprocket] Processing error", err);
    // Return 200 to prevent Shiprocket retries for Firestore errors
    return Response.json({ ok: false, error: "Processing error" });
  }

  return Response.json({ ok: true });
}

async function sendMilestoneEmail(
  to: string,
  name: string,
  orderNumber: string,
  message: string,
  awbCode: string,
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "orders@licoriceherbal.in";
  if (!resendKey) return;

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#2B1A6B;">Order Update — ${orderNumber}</h2>
      <p>Hi ${name},</p>
      <p>${message}</p>
      ${awbCode ? `<p>AWB: <strong>${awbCode}</strong></p>` : ""}
      <p>Track your order at <a href="${process.env.NEXT_PUBLIC_APP_URL}/en/track?awb=${awbCode}">Licorice Herbals Tracking</a></p>
      <hr />
      <p style="font-size:12px;color:#666;">Licorice Herbals — Pure Ayurvedic Skincare</p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Licorice Herbals <${fromEmail}>`,
      to,
      subject: `Your order ${orderNumber} update`,
      html,
    }),
    signal: AbortSignal.timeout(5000),
  }).catch((err) => console.warn("[webhook/shiprocket] Email send failed", err));
}
