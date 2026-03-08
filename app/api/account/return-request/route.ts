// app/api/account/return-request/route.ts
// Customer submits a return request for a delivered order.
// POST (multipart/form-data): orderId, reason, note?, images[]

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrder, updateOrderStatus } from "@/lib/db";
import { RETURN_WINDOW_DAYS } from "@/constants/policies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest): Promise<Response> {
  const user = await getCurrentUser(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new Response("Invalid form data", { status: 400 });
  }

  const orderId = formData.get("orderId");
  const reason = formData.get("reason");

  if (typeof orderId !== "string" || !orderId) {
    return new Response("orderId required", { status: 400 });
  }
  if (typeof reason !== "string" || !reason) {
    return new Response("reason required", { status: 400 });
  }

  const validReasons = ["damaged", "wrong_item", "defective", "expired"];
  if (!validReasons.includes(reason)) {
    return new Response("Invalid return reason", { status: 400 });
  }

  const order = await getOrder(orderId);
  if (!order) return new Response("Order not found", { status: 404 });

  // Only the order owner can request a return
  if (order.userId && order.userId !== user.uid) {
    return new Response("Forbidden", { status: 403 });
  }

  // Block if return already in progress
  const currentStatus = order.orderStatus as string;
  if (currentStatus === "return_requested" || currentStatus === "return_picked_up") {
    return new Response("Return already requested", { status: 409 });
  }

  // Must be delivered
  if (order.orderStatus !== "delivered") {
    return new Response("Order must be delivered before requesting a return", { status: 422 });
  }

  // Return window check
  const deliveredAt = order.deliveredAt;
  if (deliveredAt) {
    const deliveredDate =
      deliveredAt instanceof Date
        ? deliveredAt
        : (deliveredAt as unknown as { toDate: () => Date }).toDate?.() ?? new Date(0);
    const daysSinceDelivery = Math.floor(
      (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
      return new Response(
        `Return window of ${RETURN_WINDOW_DAYS} days has passed`,
        { status: 422 },
      );
    }
  }

  // Upload images to Firebase Storage
  const returnImageUrls: string[] = [];
  const images = formData.getAll("images");

  for (const imageFile of images) {
    if (!(imageFile instanceof File)) continue;

    // Validate MIME and size
    if (!ALLOWED_MIME.includes(imageFile.type)) {
      return new Response(`Invalid image type: ${imageFile.type}`, { status: 400 });
    }
    if (imageFile.size > MAX_IMAGE_SIZE) {
      return new Response("Image too large (max 5 MB)", { status: 400 });
    }

    try {
      const { getStorage } = await import("firebase-admin/storage");
      const ext = imageFile.type.split("/")[1] ?? "jpg";
      const path = `return-proofs/${orderId}/${Date.now()}.${ext}`;
      const bucket = getStorage().bucket();
      const file = bucket.file(path);
      const arrayBuffer = await imageFile.arrayBuffer();
      await file.save(Buffer.from(arrayBuffer), {
        metadata: { contentType: imageFile.type },
      });
      await file.makePublic();
      returnImageUrls.push(`https://storage.googleapis.com/${bucket.name}/${path}`);
    } catch (err) {
      console.warn("[return-request] Image upload failed — continuing", err);
    }
  }

  const note = typeof formData.get("note") === "string" ? (formData.get("note") as string) : undefined;

  await updateOrderStatus(
    orderId,
    {
      orderStatus: "return_requested",
      returnReason: reason,
      returnImages: returnImageUrls.length > 0 ? returnImageUrls : undefined,
      adminNote: note ? `Customer note: ${note}` : undefined,
    },
    {
      status: "return_requested",
      description: `Customer requested return: ${reason}${note ? ` — "${note}"` : ""}`,
      source: "system",
    },
  );

  return Response.json({ ok: true });
}
