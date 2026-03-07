// app/api/admin/settings/homepage/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getHomepageSections, updateHomepageSections } from "@/lib/db";

export async function GET() {
  try {
    const sections = await getHomepageSections();
    return NextResponse.json(sections);
  } catch {
    return NextResponse.json({ error: "Failed to load homepage sections" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    await updateHomepageSections(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save homepage sections" }, { status: 500 });
  }
}
