// app/api/shiprocket/cancel-order/route.ts
// Cancels a Shiprocket shipment and releases stock reservation.
// POST { orderId } — admin-only

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrder, updateOrderStatus, adjustStock } from "@/lib/db";
import { cancelShipment } from "@/lib/shiprocket";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  let body: { orderId: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { orderId, reason } = body;
  if (!orderId) return new Response("orderId required", { status: 400 });

  const order = await getOrder(orderId);
  if (!order) return new Response("Order not found", { status: 404 });

  // Cancel with Shiprocket only if we have a Shiprocket order ID
  if (order.shiprocketOrderId) {
    try {
      await cancelShipment(order.shiprocketOrderId);
    } catch (err) {
      console.warn("[shiprocket/cancel-order] Shiprocket cancel failed — proceeding", err);
    }
  }

  // Release stock reservations
  for (const item of order.items) {
    try {
      await adjustStock(
        item.productId,
        item.variantId,
        item.quantity, // positive = release back to available
        {
          type: "released",
          quantity: item.quantity,
          variantId: item.variantId,
          referenceId: orderId,
          note: reason ?? "Order cancelled",
          performedBy: user.uid,
        },
      );
    } catch (err) {
      console.warn(`[shiprocket/cancel-order] Stock release failed for ${item.variantId}`, err);
    }
  }

  try {
    await updateOrderStatus(
      orderId,
      { orderStatus: "cancelled" },
      {
        status: "cancelled",
        description: reason ? `Order cancelled: ${reason}` : "Order cancelled by admin",
        source: "admin",
      },
    );
  } catch (err) {
    console.error("[shiprocket/cancel-order] updateOrderStatus failed", err);
    return new Response("Failed to update order status", { status: 500 });
  }

  return Response.json({ ok: true });
}
