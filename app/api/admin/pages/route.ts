// app/api/admin/pages/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllPages, savePage } from "@/lib/db";
import type { PageDoc } from "@/lib/types";

export async function GET() {
  try {
    const pages = await getAllPages();
    return NextResponse.json(pages);
  } catch {
    return NextResponse.json({ error: "Failed to load pages" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing page id" }, { status: 400 });
    }
    await savePage({ id, ...data } as PageDoc);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save page" }, { status: 500 });
  }
}
