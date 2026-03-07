// app/api/admin/settings/navigation/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getNavigation, updateNavigation } from "@/lib/db";

export async function GET() {
  try {
    const nav = await getNavigation();
    return NextResponse.json(nav);
  } catch {
    return NextResponse.json({ error: "Failed to load navigation" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    await updateNavigation(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save navigation" }, { status: 500 });
  }
}
