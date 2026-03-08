import * as React from "react";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProducts, getCategories, getConcerns } from "@/lib/db";
import { sortProducts } from "@/lib/sort-products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSort } from "@/components/product/ProductSort";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return {};
  return {
    title: `${cat.label} — Ayurvedic ${cat.label}`,
    description: cat.description,
  };
}

interface CategoryPageProps {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ concern?: string | string[]; sort?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const sp = await searchParams;

  const [categories, allConcerns] = await Promise.all([getCategories(), getConcerns()]);
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const concerns = Array.isArray(sp.concern) ? sp.concern : sp.concern ? [sp.concern] : [];
  const sort = sp.sort ?? "featured";

  const products = await getProducts({ category });
  const filtered = concerns.length
    ? products.filter((p) => concerns.some((c) => p.concerns.includes(c)))
    : products;
  const sorted = sortProducts(filtered, sort);

  return (
    <div className="bg-background min-h-screen">
      {/* Category hero */}
      <div className="bg-muted py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-primary mb-1 text-sm font-semibold tracking-wide uppercase">
            Collection
          </p>
          <h1 className="font-heading text-foreground text-4xl font-bold">{cat.label}</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">{cat.description}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-56 flex-shrink-0 lg:block">
            <Suspense fallback={null}>
              <ProductFilters lockedCategory={category} categories={categories} concerns={allConcerns} />
            </Suspense>
          </aside>

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
