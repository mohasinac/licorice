// app/api/admin/orders/[orderId]/restore-stock/route.ts
// Restores stock for all items in an order after a return is received.
// POST — admin-only
//
// Writes one StockMovement of type "return" per order item variant and
// increments the variant's stock count. Safe to call multiple times — each
// call records a new movement (idempotency is caller's responsibility).

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrder, adjustStock } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
): Promise<Response> {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const { orderId } = await params;
  const order = await getOrder(orderId);
  if (!order) return new Response("Order not found", { status: 404 });

  if (order.orderStatus !== "return_picked_up") {
    return new Response(
      `Order must be in "return_picked_up" status, got "${order.orderStatus}"`,
      { status: 422 },
    );
  }

  // Restore stock for each item
  try {
    await Promise.all(
      order.items.map((item) =>
        adjustStock(item.productId, item.variantId, item.quantity, {
          variantId: item.variantId,
          type: "return",
          quantity: item.quantity,
          referenceId: orderId,
          note: `Return received for order ${order.orderNumber}`,
          performedBy: user.uid,
        }),
      ),
    );

    return Response.json({ ok: true, restoredItems: order.items.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stock restore failed";
    console.error("[restore-stock]", err);
    return new Response(message, { status: 500 });
  }
}
