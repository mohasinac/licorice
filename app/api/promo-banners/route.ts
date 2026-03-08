// app/api/promo-banners/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getActivePromoBanners } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get("productId") ?? undefined;
    const banners = await getActivePromoBanners(productId);
    return NextResponse.json(banners);
  } catch {
    return NextResponse.json({ error: "Failed to load promo banners" }, { status: 500 });
  }
}
