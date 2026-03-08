import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/db";
import { z } from "zod";
import type { OrderStatus } from "@/lib/types";

const schema = z.object({
  orderStatus: z.string(),
  adminNote: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const adminCheck = await isAdmin(user.uid);
  if (!adminCheck) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { orderId } = await params;
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { orderStatus, adminNote } = parsed.data;

  try {
    await updateOrderStatus(
      orderId,
      { orderStatus: orderStatus as OrderStatus, ...(adminNote ? { adminNote } : {}) },
      {
        status: orderStatus as OrderStatus,
        description: adminNote ?? `Status changed to ${orderStatus}`,
        source: "admin",
      },
    );
  } catch (err) {
    console.error("[admin/orders/status] updateOrderStatus failed", err);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
