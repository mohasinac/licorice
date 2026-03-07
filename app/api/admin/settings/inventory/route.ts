// app/api/admin/settings/inventory/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getInventorySettings, updateInventorySettings } from "@/lib/db";

export async function GET() {
  try {
    const settings = await getInventorySettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Failed to load inventory settings" }, { status: 500 });
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

  // Validate: all numeric thresholds must be positive integers
  const positiveIntFields = [
    "defaultLowStockThreshold",
    "defaultReorderPoint",
    "defaultStockPerVariant",
    "reservationTimeoutMinutes",
  ];
  for (const field of positiveIntFields) {
    if (
      field in safeData &&
      (typeof safeData[field] !== "number" || (safeData[field] as number) < 1 || !Number.isInteger(safeData[field]))
    ) {
      return NextResponse.json({ error: `${field} must be a positive integer` }, { status: 400 });
    }
  }

  // Reorder point must not exceed low stock threshold
  const current = await getInventorySettings();
  const merged = { ...current, ...safeData };
  if (merged.defaultReorderPoint >= merged.defaultLowStockThreshold) {
    return NextResponse.json(
      { error: "Reorder point must be less than low stock threshold" },
      { status: 400 },
    );
  }

  try {
    await updateInventorySettings(safeData as Parameters<typeof updateInventorySettings>[0]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save inventory settings" }, { status: 500 });
  }
}
