// app/api/admin/promo-banners/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllPromoBanners, savePromoBanner, deletePromoBanner } from "@/lib/db";

export async function GET() {
  try {
    const banners = await getAllPromoBanners();
    return NextResponse.json(banners);
  } catch {
    return NextResponse.json({ error: "Failed to load promo banners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const id = await savePromoBanner(body);
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to save promo banner" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await deletePromoBanner(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete promo banner" }, { status: 500 });
  }
}
