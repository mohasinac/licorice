"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { Button } from "@/components/ui/Button";
import { getLocalizedValue } from "@/lib/i18n";
import { SEED_PRODUCTS } from "@/lib/seeds";
import type { Product, Locale } from "@/lib/types";
import toast from "react-hot-toast";

interface BuyMoreSaveMoresProps {
  upsellProductIds: string[];
  currentProduct: Product;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function BuyMoreSaveMore({ upsellProductIds, currentProduct }: BuyMoreSaveMoresProps) {
  const locale = useLocale() as Locale;
  const { add, openCart } = useCartStore();

  // In seed mode resolve upsell products from seed data
  const upsellProducts = upsellProductIds
    .map((id) => SEED_PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  if (upsellProducts.length === 0) return null;

  const bundleItems = [currentProduct, ...upsellProducts];
  const bundleTotal = bundleItems.reduce((sum, p) => {
    const v = p.variants.find((v) => v.isDefault) ?? p.variants[0];
    return sum + (v?.price ?? 0);
  }, 0);
  const compareTotal = bundleItems.reduce((sum, p) => {
    const v = p.variants.find((v) => v.isDefault) ?? p.variants[0];
    return sum + (v?.compareAtPrice ?? v?.price ?? 0);
  }, 0);
  const savings = compareTotal - bundleTotal;

  function handleAddBundle() {
    bundleItems.forEach((p) => {
      const v = p.variants.find((v) => v.isDefault) ?? p.variants[0];
      if (v) add(p, v);
    });
    openCart();
    toast.success("Bundle added to cart!");
  }

  return (
    <div className="bg-muted rounded-2xl p-5">
      <h3 className="font-heading text-foreground mb-4 text-lg font-bold">Buy More, Save More</h3>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {bundleItems.map((p, i) => (
          <React.Fragment key={p.id}>
            <div className="flex flex-col items-center gap-1">
              <Image
                src={p.images[0] ?? "/images/placeholder.jpg"}
                alt={getLocalizedValue(p.name, locale)}
                width={64}
                height={64}
                className="rounded-xl object-cover"
              />
              <span className="text-muted-foreground max-w-[72px] truncate text-xs">
                {getLocalizedValue(p.name, locale)}
              </span>
            </div>
            {i < bundleItems.length - 1 && <span className="text-primary font-bold">+</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-foreground font-bold">{formatPrice(bundleTotal)}</p>
          {savings > 0 && <p className="text-sm text-green-600">You save {formatPrice(savings)}</p>}
        </div>
        <Button onClick={handleAddBundle}>
          <ShoppingBag className="h-4 w-4" /> Add Bundle
        </Button>
      </div>
    </div>
  );
}
