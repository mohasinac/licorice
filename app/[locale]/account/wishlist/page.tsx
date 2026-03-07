"use client";

import { useEffect, useState } from "react";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const { productIds } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    fetch(`/api/products?ids=${productIds.join(",")}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productIds]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-heading text-foreground mb-6 text-3xl font-bold">Wishlist</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface h-64 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-heading text-foreground mb-6 text-3xl font-bold">Wishlist</h1>

      {products.length === 0 ? (
        <p className="text-muted-foreground text-sm">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
