// app/api/shiprocket/create-order/route.ts
// Creates a Shiprocket shipment for a confirmed order.
// POST { orderId } — admin-only

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrder, updateOrderStatus } from "@/lib/db";
import { createShipment } from "@/lib/shiprocket";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  let body: { orderId: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { orderId } = body;
  if (!orderId) return new Response("orderId required", { status: 400 });

  const order = await getOrder(orderId);
  if (!order) return new Response("Order not found", { status: 404 });

  if (!["confirmed", "processing", "ready_to_ship"].includes(order.orderStatus)) {
    return new Response("Order must be confirmed before shipping", { status: 422 });
  }

  try {
    const result = await createShipment(order);

    await updateOrderStatus(
      orderId,
      {
        shiprocketOrderId: result.shiprocketOrderId,
        shiprocketShipmentId: result.shiprocketShipmentId,
        awbCode: result.awbCode,
        courierName: result.courierName,
        orderStatus: "shipped",
      },
      {
        status: "shipped",
        description: `Shipment created via Shiprocket. AWB: ${result.awbCode ?? "pending"}. Courier: ${result.courierName ?? "assigned"}`,
        source: "admin",
      },
    );

    return Response.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Shiprocket error";
    console.error("[shiprocket/create-order]", err);
    return new Response(message, { status: 502 });
  }
}
