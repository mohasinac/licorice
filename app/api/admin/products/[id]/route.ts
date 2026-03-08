// app/api/admin/products/[id]/route.ts
// PATCH — update product, DELETE — delete product (admin only)
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveProduct, deleteProduct, getProductById } from "@/lib/db";
import type { ProductCategory } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  const existing = await getProductById(id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  if (typeof b.name === "string" && b.name.length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 chars" }, { status: 400 });
  }

  try {
    await saveProduct({
      id,
      name: (b.name as string) ?? existing.name,
      slug: (b.slug as string) ?? existing.slug,
      tagline: (b.tagline as string) ?? existing.tagline,
      shortDescription: (b.shortDescription as string) ?? existing.shortDescription,
      description: (b.description as string) ?? existing.description,
      ingredients: Array.isArray(b.ingredients) ? b.ingredients : existing.ingredients,
      benefits: Array.isArray(b.benefits) ? b.benefits : existing.benefits,
      howToUse: Array.isArray(b.howToUse) ? b.howToUse : existing.howToUse,
      faqs: Array.isArray(b.faqs) ? b.faqs : existing.faqs,
      images: Array.isArray(b.images) ? b.images : existing.images,
      videoUrl: b.videoUrl !== undefined ? (b.videoUrl as string) : existing.videoUrl,
      category: ((b.category as string) ?? existing.category) as ProductCategory,
      concerns: Array.isArray(b.concerns) ? b.concerns : existing.concerns,
      comboItems: Array.isArray(b.comboItems) ? b.comboItems : existing.comboItems,
      variants: Array.isArray(b.variants) ? b.variants : existing.variants,
      relatedProducts: Array.isArray(b.relatedProducts)
        ? b.relatedProducts
        : existing.relatedProducts,
      upsellProducts: Array.isArray(b.upsellProducts)
        ? b.upsellProducts
        : existing.upsellProducts,
      certifications: Array.isArray(b.certifications)
        ? b.certifications
        : existing.certifications,
      inStock: typeof b.inStock === "boolean" ? b.inStock : existing.inStock,
      isFeatured: typeof b.isFeatured === "boolean" ? b.isFeatured : existing.isFeatured,
      isCombo: typeof b.isCombo === "boolean" ? b.isCombo : existing.isCombo,
      isActive: typeof b.isActive === "boolean" ? b.isActive : existing.isActive,
      metaTitle: b.metaTitle !== undefined ? (b.metaTitle as string) : existing.metaTitle,
      metaDescription:
        b.metaDescription !== undefined
          ? (b.metaDescription as string)
          : existing.metaDescription,
      tags: Array.isArray(b.tags) ? b.tags : existing.tags,
      sortOrder: typeof b.sortOrder === "number" ? b.sortOrder : existing.sortOrder,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
