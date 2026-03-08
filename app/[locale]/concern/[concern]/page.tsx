import * as React from "react";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CONCERNS } from "@/constants/categories";
import { getProducts } from "@/lib/db";
import { sortProducts } from "@/lib/sort-products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductSort } from "@/components/product/ProductSort";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function generateStaticParams() {
  return CONCERNS.map((c) => ({ concern: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; concern: string }>;
}): Promise<Metadata> {
  const { concern } = await params;
  const con = CONCERNS.find((c) => c.slug === concern);
  if (!con) return {};
  return {
    title: `${con.label} — Ayurvedic Solutions`,
    description: con.description,
  };
}

interface ConcernPageProps {
  params: Promise<{ locale: string; concern: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export default async function ConcernPage({ params, searchParams }: ConcernPageProps) {
  const { concern } = await params;
  const sp = await searchParams;

  const con = CONCERNS.find((c) => c.slug === concern);
  if (!con) notFound();

  const sort = sp.sort ?? "featured";
  const products = await getProducts({ concern: con.id.replace("concern_", "") });

  // Also filter by actual concern tag
  const filtered = products.filter((p) =>
    p.concerns.some(
      (c) => c === con.slug || c === con.id.replace("concern_", "") || c.includes(concern),
    ),
  );
  const sorted = sortProducts(filtered.length > 0 ? filtered : products, sort);

  return (
    <div className="bg-background min-h-screen">
      {/* Concern hero */}
      <div className="bg-primary/5 border-border border-b py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-primary mb-1 text-sm font-semibold tracking-wide uppercase">
            Shop by Concern
          </p>
          <h1 className="font-heading text-foreground text-4xl font-bold">{con.label}</h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-lg">{con.description}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{sorted.length} products</p>
          <Suspense fallback={null}>
            <ProductSort />
          </Suspense>
        </div>
        <ProductGrid products={sorted} />
      </div>
    </div>
  );
}
