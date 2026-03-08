// app/api/admin/orders/[orderId]/ship-manual/route.ts
// Stores manual shipping details (courier + AWB) for an order.
// POST { courierName, awbCode, trackingUrl? }

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";

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

  let body: { courierName: string; awbCode: string; trackingUrl?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { courierName, awbCode, trackingUrl } = body;
  if (!courierName?.trim() || !awbCode?.trim()) {
    return new Response("courierName and awbCode required", { status: 400 });
  }

  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");

  const orderRef = adminDb.collection("orders").doc(orderId);
  const batch = adminDb.batch();

  batch.update(orderRef, {
    manualShipping: true,
    manualCourierName: courierName.trim(),
    manualAwbCode: awbCode.trim(),
    courierTrackingUrl: trackingUrl?.trim() ?? null,
    orderStatus: "shipped",
    updatedAt: FieldValue.serverTimestamp(),
  });

  const eventRef = orderRef.collection("timeline").doc();
  batch.set(eventRef, {
    status: "shipped",
    description: `Manual shipping: ${courierName.trim()} — AWB ${awbCode.trim()}`,
    source: "admin",
    createdAt: FieldValue.serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (err) {
    console.error("[ship-manual] batch commit failed", err);
    return new Response("Failed to save shipping details", { status: 500 });
  }

  return Response.json({ ok: true });
}
