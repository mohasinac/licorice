// app/api/admin/coupons/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCoupons, createCoupon } from "@/lib/db";
import type { CouponType } from "@/lib/types";

export async function GET() {
  try {
    const coupons = await getCoupons();
    return NextResponse.json(coupons);
  } catch {
    return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
  }
}

const VALID_TYPES: CouponType[] = ["percentage", "flat", "free_shipping", "buy_x_get_y"];
const VALID_APPLICABLE: string[] = ["all", "category", "product", "combo"];

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { createdAt, updatedAt, usedCount, ...data } = body;
  void createdAt;
  void updatedAt;
  void usedCount;

  // Validate required fields
  if (!data.code || typeof data.code !== "string" || data.code.trim().length === 0) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }
  if (!data.type || !VALID_TYPES.includes(data.type as CouponType)) {
    return NextResponse.json({ error: "Invalid coupon type" }, { status: 400 });
  }
  if (typeof data.value !== "number" || data.value < 0) {
    return NextResponse.json({ error: "value must be a non-negative number" }, { status: 400 });
  }
  if (!data.applicableTo || !VALID_APPLICABLE.includes(data.applicableTo as string)) {
    return NextResponse.json({ error: "Invalid applicableTo value" }, { status: 400 });
  }

  try {
    await createCoupon(data as Parameters<typeof createCoupon>[0]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
