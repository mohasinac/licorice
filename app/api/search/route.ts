import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories, getConcerns } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], categories: [], concerns: [] });
  }

  const [allProducts, categories, concerns] = await Promise.all([
    getProducts(),
    getCategories(),
    getConcerns(),
  ]);

  const products = allProducts
    .filter((p) => {
      if (p.isActive === false) return false;
      const name = typeof p.name === "string" ? p.name : (p.name as { en?: string })?.en ?? "";
      return (
        name.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        (typeof p.shortDescription === "string"
          ? p.shortDescription.toLowerCase().includes(q)
          : false) ||
        p.category?.toLowerCase().includes(q) ||
        p.concerns?.some((c) => c.toLowerCase().includes(q))
      );
    })
    .slice(0, 5);

  const filteredCategories = categories
    .filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q),
    )
    .slice(0, 5);

  const filteredConcerns = concerns
    .filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q),
    )
    .slice(0, 5);

  return NextResponse.json({
    products,
    categories: filteredCategories,
    concerns: filteredConcerns,
  });
}
