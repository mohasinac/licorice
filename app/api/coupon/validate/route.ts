// app/api/coupon/validate/route.ts
// Validates a coupon code against all 7 rules server-side.
// Returns { valid, discountAmount, type } on success or { valid: false, error } on failure.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCoupon } from "@/lib/db";
import { toSafeDate } from "@/lib/utils";

const schema = z.object({
  code: z.string().min(1).max(50),
  cartTotal: z.number().min(0),
  userId: z.string().optional(),
  cartItems: z.array(z.object({ productId: z.string(), category: z.string() })).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: "Invalid request." }, { status: 400 });
  }

  const { code, cartTotal, userId, cartItems } = parsed.data;

  const coupon = await getCoupon(code);
  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ valid: false, error: "Invalid or inactive coupon code." });
  }

  // 2. Date validity
  const now = new Date();
  const startsAt = toSafeDate(coupon.startsAt);
  if (startsAt && now < startsAt) {
    return NextResponse.json({ valid: false, error: "This coupon is not yet active." });
  }
  if (coupon.expiresAt) {
    const expiresAt = toSafeDate(coupon.expiresAt);
    if (expiresAt && now > expiresAt) {
      return NextResponse.json({ valid: false, error: "This coupon has expired." });
    }
  }

  // 3. Min order value
  if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
    return NextResponse.json({
      valid: false,
      error: `Minimum order ₹${coupon.minOrderValue} required for this coupon.`,
    });
  }

  // 4. Global usage limit
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit." });
  }

  // 5. Per-user usage limit (Firestore-based check)
  if (userId && coupon.usageLimitPerUser != null) {
    try {
      const { adminDb } = await import("@/lib/firebase/admin");
      const usageSnap = await adminDb
        .collection("couponUsage")
        .where("couponCode", "==", code)
        .where("userId", "==", userId)
        .get();
      if (usageSnap.size >= coupon.usageLimitPerUser) {
        return NextResponse.json({ valid: false, error: "You have already used this coupon." });
      }
    } catch (err) {
      console.warn("[coupon/validate] Per-user usage check failed", err);
      return NextResponse.json(
        { valid: false, error: "Unable to verify coupon usage. Please try again." },
        { status: 503 },
      );
    }
  }

  // 6. Applicable scope
  if (coupon.applicableTo !== "all" && cartItems) {
    const ids = coupon.applicableIds ?? [];
    let scopeMatch = false;
    if (coupon.applicableTo === "category") {
      scopeMatch = cartItems.some((i) => ids.includes(i.category));
    } else if (coupon.applicableTo === "product" || coupon.applicableTo === "combo") {
      scopeMatch = cartItems.some((i) => ids.includes(i.productId));
    }
    if (!scopeMatch) {
      return NextResponse.json({
        valid: false,
        error: "This coupon does not apply to items in your cart.",
      });
    }
  }

  // 7. Compute discount
  let discountAmount = 0;
  if (coupon.type === "percentage") {
    discountAmount = (cartTotal * coupon.value) / 100;
    if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  } else if (coupon.type === "flat") {
    discountAmount = coupon.value;
  } else if (coupon.type === "free_shipping") {
    discountAmount = 0; // applied as shipping waiver — signal via type
  }

  return NextResponse.json({
    valid: true,
    discountAmount: Math.round(discountAmount),
    type: coupon.type,
  });
}
