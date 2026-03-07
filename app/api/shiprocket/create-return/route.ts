// app/api/shiprocket/create-return/route.ts
// Initiates a return pick-up with Shiprocket for orders in `return_requested` status.
// POST { orderId } — admin-only
//
// Flow:
// 1. Verify admin auth
// 2. Load order from Firestore
// 3. Call Shiprocket return shipment API using the original shiprocketShipmentId
// 4. Update order: orderStatus → "return_picked_up", store returnShipmentId
// 5. Append timeline event

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrder, updateOrderStatus } from "@/lib/db";
import { createReturnShipment } from "@/lib/shiprocket";

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

  if (order.orderStatus !== "return_requested") {
    return new Response(`Order status must be "return_requested", got "${order.orderStatus}"`, {
      status: 422,
    });
  }

  // Shiprocket return requires the original shipment ID
  const shipmentId = order.shiprocketShipmentId;
  if (!shipmentId && process.env.SHIPROCKET_EMAIL) {
    return new Response(
      "No Shiprocket shipment ID found on order — use manual return pickup instead",
      { status: 422 },
    );
  }

  try {
    const result = await createReturnShipment(shipmentId ?? "manual");

    // Store return shipment info and update status
    await updateOrderStatus(
      orderId,
      {
        orderStatus: "return_picked_up",
        // Store on order as a note since types don't have a dedicated return AWB field
        adminNote: `Return initiated via Shiprocket. Return shipment ID: ${result.returnShipmentId}${result.awbCode ? `. AWB: ${result.awbCode}` : ""}`,
      },
      {
        status: "return_picked_up",
        description: `Return pick-up initiated via Shiprocket. Shipment ID: ${result.returnShipmentId}`,
        source: "admin",
      },
    );

    return Response.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Shiprocket error";
    console.error("[shiprocket/create-return]", err);
    return new Response(message, { status: 502 });
  }
}
