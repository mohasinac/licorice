// app/api/admin/settings/shipping/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getShippingRules, updateShippingRules } from "@/lib/db";

export async function GET() {
  try {
    const rules = await getShippingRules();
    return NextResponse.json(rules);
  } catch {
    return NextResponse.json({ error: "Failed to load shipping rules" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
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

  const { createdAt, updatedAt, ...safeData } = body as Record<string, unknown>;
  void createdAt; void updatedAt;

  // Basic validation: numeric fields must be non-negative
  const numericFields = ["freeShippingThreshold", "standardRate", "codFee", "expressRate", "sameDayRate", "gstPercent"];
  for (const field of numericFields) {
    if (field in safeData && (typeof safeData[field] !== "number" || (safeData[field] as number) < 0)) {
      return NextResponse.json({ error: `${field} must be a non-negative number` }, { status: 400 });
    }
  }

  // Validate gstPercent range
  if ("gstPercent" in safeData && typeof safeData.gstPercent === "number" && safeData.gstPercent > 100) {
    return NextResponse.json({ error: "gstPercent must be between 0 and 100" }, { status: 400 });
  }

  // Validate pickupPincode format
  if ("pickupPincode" in safeData && safeData.pickupPincode && typeof safeData.pickupPincode === "string") {
    if (!/^\d{6}$/.test(safeData.pickupPincode)) {
      return NextResponse.json({ error: "pickupPincode must be a 6-digit number" }, { status: 400 });
    }
  }

  try {
    await updateShippingRules(safeData as Parameters<typeof updateShippingRules>[0]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save shipping rules" }, { status: 500 });
  }
}
