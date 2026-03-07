// app/api/admin/settings/payment/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPaymentSettings, updatePaymentSettings } from "@/lib/db";

export async function GET() {
  try {
    const settings = await getPaymentSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Failed to load payment settings" }, { status: 500 });
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

  // Validate: at least one payment method must remain enabled
  const current = await getPaymentSettings();
  const merged = { ...current, ...safeData };
  if (!merged.whatsappEnabled && !merged.razorpayEnabled && !merged.codEnabled) {
    return NextResponse.json(
      { error: "At least one payment method must be enabled" },
      { status: 400 },
    );
  }

  try {
    await updatePaymentSettings(safeData as Parameters<typeof updatePaymentSettings>[0]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save payment settings" }, { status: 500 });
  }
}
