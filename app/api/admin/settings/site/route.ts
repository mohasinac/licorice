// app/api/admin/settings/site/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSiteConfig, updateSiteConfig } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const config = await getSiteConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Failed to load site config" }, { status: 500 });
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

  // Strip immutable fields
  const { orderCounter, createdAt, updatedAt, ...safeData } = body as Record<string, unknown>;
  void orderCounter; void createdAt; void updatedAt;

  try {
    await updateSiteConfig(safeData as Parameters<typeof updateSiteConfig>[0]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save site config" }, { status: 500 });
  }
}
