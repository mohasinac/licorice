// app/api/admin/settings/consultation/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getConsultationConfig, updateConsultationConfig } from "@/lib/db";

export async function GET() {
  try {
    const config = await getConsultationConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Failed to load consultation config" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    await updateConsultationConfig(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save consultation config" }, { status: 500 });
  }
}
