import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { updateOrderStatus, getOrder } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  amount: z.number().positive(),
  note: z.string().min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const adminCheck = await isAdmin(user.uid);
  if (!adminCheck) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { orderId } = await params;
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { amount, note } = parsed.data;

  const order = await getOrder(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const previouslyRefunded = (order as { refundAmount?: number }).refundAmount ?? 0;
  if (amount + previouslyRefunded > order.total)
    return NextResponse.json(
      { error: `Refund exceeds order total. Already refunded \u20B9${previouslyRefunded}.` },
      { status: 400 },
    );

  // For Razorpay: initiate refund via Razorpay API
  if (order.paymentMethod === "razorpay" && order.paymentId) {
    const key = process.env.RAZORPAY_KEY_SECRET;
    if (key) {
      const basicAuth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${key}`).toString("base64");

      const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${order.paymentId}/refund`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: Math.round(amount * 100), notes: { reason: note } }),
      });

      if (!rzpRes.ok) {
        const err = await rzpRes.json().catch(() => ({}));
        return NextResponse.json(
          {
            error:
              (err as { error?: { description?: string } }).error?.description ??
              "Razorpay refund failed",
          },
          { status: 502 },
        );
      }
    }
  }

  await updateOrderStatus(
    orderId,
    {
      orderStatus: "refunded",
      paymentStatus: "refunded",
      refundAmount: amount + previouslyRefunded,
      refundNote: note,
    },
    {
      status: "refunded",
      description: `Refund of ₹${amount} — ${note}`,
      source: "admin",
    },
  );

  return NextResponse.json({ success: true });
}
