import * as React from "react";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/db";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Search Products",
};

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim().toLowerCase();

  const allProducts = await getProducts();
  const results = query
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)) ||
          p.shortDescription.toLowerCase().includes(query),
      )
    : [];

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {query ? (
          <>
            <SectionHeading
              title={`Search results for "${query}"`}
              subtitle={
                results.length > 0
                  ? `${results.length} product${results.length !== 1 ? "s" : ""} found`
                  : "No products found"
              }
              className="mb-8"
            />
            {results.length > 0 ? (
              <ProductGrid products={results} />
            ) : (
              <div className="py-16 text-center">
                <p className="text-muted-foreground text-lg">
                  No results for &ldquo;{query}&rdquo;.
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Try a different keyword or browse our collections.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-lg">Enter a search term to find products.</p>
          </div>
        )}
      </div>
    </div>
  );
}
