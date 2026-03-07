"use server";

import { z } from "zod";
import type { CartItem, Address, PaymentMethod, OrderItem, Order } from "@/lib/types";
import type { ShippingMode } from "@/stores/useCheckoutStore";
import { getShippingCharge, COD_FEE } from "@/constants/policies";
import { isFirebaseReady } from "@/lib/db";

// ── Input schema ──────────────────────────────────────────────────────────────

const addressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().regex(/^\d{6}$/),
  country: z.string().default("India"),
});

const createOrderSchema = z.object({
  userId: z.string().optional(),
  guestEmail: z.string().email().optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        productId: z.string(),
        variantId: z.string(),
        slug: z.string(),
        name: z.string(),
        variantLabel: z.string(),
        image: z.string(),
        price: z.number().min(0),
        compareAtPrice: z.number().optional(),
        quantity: z.number().int().min(1),
        maxQuantity: z.number().optional(),
      }),
    )
    .min(1),
  shippingAddress: addressSchema,
  shippingMode: z.enum(["standard", "express", "same_day"]),
  paymentMethod: z.enum(["whatsapp", "razorpay", "cod"]),
  couponCode: z.string().optional(),
  discount: z.number().min(0).default(0),
  freeShipping: z.boolean().default(false),
  customerNote: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export type CreateOrderResult =
  | { success: true; orderId: string; orderNumber: string }
  | { success: false; error: string };

// ── Order number generation ───────────────────────────────────────────────────

function generateFallbackOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 99999)).padStart(5, "0");
  return `LH-${year}-${rand}`;
}

// ── Server Action ─────────────────────────────────────────────────────────────

export async function createOrder(input: unknown): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid order data." };
  }

  const data = parsed.data;
  const subtotal = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountedSubtotal = subtotal - data.discount;
  const shippingCharge = data.freeShipping
    ? 0
    : getShippingCharge(data.shippingMode as ShippingMode, discountedSubtotal);
  const codFee = data.paymentMethod === "cod" ? COD_FEE : 0;
  const total = discountedSubtotal + shippingCharge + codFee;

  const orderItems: OrderItem[] = data.items.map((i) => ({
    productId: i.productId,
    variantId: i.variantId,
    slug: i.slug,
    name: i.name,
    variantLabel: i.variantLabel,
    image: i.image,
    price: i.price,
    quantity: i.quantity,
    total: i.price * i.quantity,
  }));

  // ── Seed mode ─────────────────────────────────────────────────────────────
  if (!isFirebaseReady()) {
    const orderNumber = generateFallbackOrderNumber();
    const orderId = `order_${Date.now()}`;
    return { success: true, orderId, orderNumber };
  }

  // ── Firestore mode ────────────────────────────────────────────────────────
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    const siteConfigRef = adminDb.collection("settings").doc("siteConfig");
    const orderRef = adminDb.collection("orders").doc();

    let orderNumber = generateFallbackOrderNumber();

    // Atomic order counter increment + order creation
    await adminDb.runTransaction(async (tx) => {
      const configSnap = await tx.get(siteConfigRef);
      const counter: number = configSnap.exists
        ? ((configSnap.data() as { orderCounter?: number }).orderCounter ?? 0) + 1
        : 1;
      const year = new Date().getFullYear();
      orderNumber = `LH-${year}-${String(counter).padStart(5, "0")}`;

      const paymentStatus =
        data.paymentMethod === "whatsapp"
          ? "pending_whatsapp"
          : data.paymentMethod === "cod"
            ? "pending"
            : "pending";

      const order: Omit<Order, "id"> = {
        orderNumber,
        userId: data.userId ?? "",
        guestEmail: data.guestEmail,
        items: orderItems,
        shippingAddress: data.shippingAddress as Address,
        billingAddress: data.shippingAddress as Address,
        subtotal,
        discount: data.discount,
        couponCode: data.couponCode,
        shippingCharge,
        codFee,
        total,
        paymentMethod: data.paymentMethod,
        paymentStatus,
        orderStatus: "pending",
        shippingMode: data.shippingMode,
        customerNote: data.customerNote,
        createdAt: FieldValue.serverTimestamp() as unknown as Date,
        updatedAt: FieldValue.serverTimestamp() as unknown as Date,
      };

      tx.set(orderRef, { id: orderRef.id, ...order });
      tx.set(siteConfigRef, { orderCounter: counter }, { merge: true });

      // Reserve stock for each variant
      for (const item of data.items) {
        const inventoryRef = adminDb.collection("inventory").doc(item.productId);
        const movementRef = inventoryRef.collection("movements").doc();
        tx.set(
          inventoryRef,
          {
            [`variants.${item.variantId}.reservedStock`]: FieldValue.increment(item.quantity),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        tx.set(movementRef, {
          id: movementRef.id,
          variantId: item.variantId,
          type: "reserved",
          quantity: item.quantity,
          referenceId: orderRef.id,
          note: `Reserved for order ${orderNumber}`,
          performedBy: "system",
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    });

    // Write initial timeline event (outside transaction)
    const timelineRef = orderRef.collection("timeline").doc();
    await timelineRef.set({
      status: "pending",
      description: "Order placed",
      source: "system",
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, orderId: orderRef.id, orderNumber };
  } catch (err: unknown) {
    console.error("[createOrder] failed", err);
    return { success: false, error: "Failed to place order. Please try again." };
  }
}
