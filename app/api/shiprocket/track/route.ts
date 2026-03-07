// app/api/shiprocket/track/route.ts
// Proxy tracking by AWB number or order ID.
// GET ?awb=XXXXXXXX  OR  ?orderId=LH-2026-00001

import { NextRequest } from "next/server";
import { trackByAwb } from "@/lib/shiprocket";
import { getOrder } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = req.nextUrl;
  let awb = searchParams.get("awb") ?? "";
  const orderId = searchParams.get("orderId") ?? "";

  // Resolve orderId → AWB if needed
  if (!awb && orderId) {
    const order = await getOrder(orderId);
    if (!order) return new Response("Order not found", { status: 404 });
    awb = order.awbCode ?? order.manualAwbCode ?? "";
    if (!awb) {
      return Response.json({
        awbCode: null,
        courierName: order.manualCourierName ?? null,
        currentStatus: order.orderStatus,
        events: [],
      });
    }
  }

  if (!awb) return new Response("awb or orderId required", { status: 400 });

  const result = await trackByAwb(awb);
  if (!result) {
    return new Response("Tracking info not available", { status: 404 });
  }

  return Response.json(result);
}
