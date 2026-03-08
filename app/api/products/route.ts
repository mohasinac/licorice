import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/db";

const MAX_IDS = 100;

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const ids = (search.get("ids")?.split(",").filter(Boolean) ?? []).slice(0, MAX_IDS);

  const all = await getProducts();
  const products = ids.length > 0 ? all.filter((p) => ids.includes(p.id)) : all;

  return NextResponse.json({ products });
}
