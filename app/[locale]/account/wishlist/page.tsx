"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const t = useTranslations("account");
  const { productIds } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (productIds.length === 0) {
        if (!cancelled) { setProducts([]); setLoading(false); setError(null); }
        return;
      }
      try {
        const r = await fetch(`/api/products?ids=${productIds.join(",")}`);
        if (!r.ok) throw new Error(`Failed to load: ${r.status}`);
        const data = (await r.json()) as { products?: Product[] };
        if (!cancelled) { setProducts(data.products ?? []); setError(null); }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(t("errorLoadingWishlist"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [productIds, t]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-heading text-foreground mb-6 text-3xl font-bold">{t("wishlistTitle")}</h1>
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
      <h1 className="font-heading text-foreground mb-6 text-3xl font-bold">{t("wishlistTitle")}</h1>

      {error ? (
        <p className="text-destructive text-sm">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("wishlistEmpty")}</p>
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
