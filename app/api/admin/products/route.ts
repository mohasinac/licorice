// app/api/admin/products/route.ts
// POST — create product (admin only)
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveProduct } from "@/lib/db";
import type { Product, ProductCategory } from "@/lib/types";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  if (typeof b.name !== "string" || b.name.length < 2) {
    return NextResponse.json({ error: "Name is required (min 2 chars)" }, { status: 400 });
  }
  if (typeof b.slug !== "string" || !b.slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }
  if (!Array.isArray(b.variants) || b.variants.length === 0) {
    return NextResponse.json({ error: "At least one variant required" }, { status: 400 });
  }

  try {
    const id = await saveProduct({
      name: b.name as string,
      slug: b.slug as string,
      tagline: (b.tagline as string) || "",
      shortDescription: (b.shortDescription as string) || "",
      description: (b.description as string) || "",
      ingredients: Array.isArray(b.ingredients) ? b.ingredients : [],
      benefits: Array.isArray(b.benefits) ? b.benefits : [],
      howToUse: Array.isArray(b.howToUse) ? b.howToUse : [],
      faqs: Array.isArray(b.faqs) ? b.faqs : [],
      images: Array.isArray(b.images) ? b.images : [],
      videoUrl: (b.videoUrl as string) || undefined,
      category: ((b.category as string) || "face") as ProductCategory,
      concerns: Array.isArray(b.concerns) ? b.concerns : [],
      comboItems: Array.isArray(b.comboItems) ? b.comboItems : [],
      variants: b.variants as Product["variants"],
      relatedProducts: Array.isArray(b.relatedProducts) ? b.relatedProducts : [],
      upsellProducts: Array.isArray(b.upsellProducts) ? b.upsellProducts : [],
      certifications: Array.isArray(b.certifications) ? b.certifications : [],
      inStock: b.inStock !== false,
      isFeatured: !!b.isFeatured,
      isCombo: !!b.isCombo,
      isActive: b.isActive !== false,
      metaTitle: (b.metaTitle as string) || undefined,
      metaDescription: (b.metaDescription as string) || undefined,
      tags: Array.isArray(b.tags) ? b.tags : [],
      sortOrder: typeof b.sortOrder === "number" ? b.sortOrder : 0,
    });
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}


