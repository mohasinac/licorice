import * as React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { getProductById } from "@/lib/db";
import type { Product } from "@/lib/types";

interface RelatedProductsProps {
  relatedIds: string[];
  currentProductId: string;
}

export async function RelatedProducts({ relatedIds, currentProductId }: RelatedProductsProps) {
  const related = (
    await Promise.all(
      relatedIds.filter((id) => id !== currentProductId).map((id) => getProductById(id)),
    )
  ).filter(Boolean) as Product[];

  if (related.length === 0) return null;

  return (
    <div>
      <SectionHeading title="You May Also Like" className="mb-6" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
