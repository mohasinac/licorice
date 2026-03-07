import * as React from "react";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/db";
import { sortProducts } from "@/components/product/ProductSort";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductSort } from "@/components/product/ProductSort";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Combo Packs — Bundle & Save",
  description:
    "Curated Ayurvedic skincare bundles at the best value. Save more when you combine your favourites.",
};

interface CombosPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export default async function CombosPage({ searchParams }: CombosPageProps) {
  const sp = await searchParams;
  const sort = sp.sort ?? "featured";

  const products = await getProducts({ isCombo: true });
  const sorted = sortProducts(products, sort);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <div className="bg-accent/10 py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-primary mb-1 text-sm font-semibold tracking-wide uppercase">
            Bundle & Save
          </p>
          <h1 className="font-heading text-foreground text-4xl font-bold">Combo Packs</h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-lg">
            Complete Ayurvedic rituals in one box — handpicked combinations at the best value.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{sorted.length} combos</p>
          <Suspense fallback={null}>
            <ProductSort />
          </Suspense>
        </div>
        <ProductGrid products={sorted} />
      </div>
    </div>
  );
}
