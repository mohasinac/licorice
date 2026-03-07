import * as React from "react";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/db";
import { sortProducts } from "@/components/product/ProductSort";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSort } from "@/components/product/ProductSort";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse our full range of pure Ayurvedic skincare and haircare products.",
};

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string | string[];
    concern?: string | string[];
    cert?: string | string[];
    sort?: string;
  }>;
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { locale } = await params;
  const sp = await searchParams;

  const categories = Array.isArray(sp.category) ? sp.category : sp.category ? [sp.category] : [];
  const concerns = Array.isArray(sp.concern) ? sp.concern : sp.concern ? [sp.concern] : [];
  const sort = sp.sort ?? "featured";

  // Fetch products — category filter if exactly one selected
  const products = await getProducts(
    categories.length === 1 ? { category: categories[0] } : undefined,
  );

  // Further filter by multiple categories or concerns (mock/client side)
  const filtered = products.filter((p) => {
    if (categories.length > 1 && !categories.includes(p.category)) return false;
    if (concerns.length > 0 && !concerns.some((c) => p.concerns.includes(c))) return false;
    return true;
  });

  const sorted = sortProducts(filtered, sort);

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          title="All Products"
          subtitle={`${sorted.length} products`}
          className="mb-8"
        />

        <div className="flex gap-8">
          {/* Sidebar filters — desktop */}
          <aside className="hidden w-56 flex-shrink-0 lg:block">
            <Suspense fallback={null}>
              <ProductFilters />
            </Suspense>
          </aside>

          {/* Products */}
          <div className="flex-1">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">{sorted.length} products</p>
              <Suspense fallback={null}>
                <ProductSort />
              </Suspense>
            </div>
            <ProductGrid products={sorted} />
          </div>
        </div>
      </div>
    </div>
  );
}
