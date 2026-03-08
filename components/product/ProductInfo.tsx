"use client";

import * as React from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ShoppingBag, Zap } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { VariantSelector } from "@/components/product/VariantSelector";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { getLocalizedValue } from "@/lib/i18n";
import type { Product, Variant, Locale } from "@/lib/types";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

interface ProductInfoProps {
  product: Product;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ProductInfo({ product }: ProductInfoProps) {
  const locale = useLocale() as Locale;
  const { add, openCart } = useCartStore();
  const { toggle, isWished } = useWishlistStore();
  const wished = isWished(product.id);

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const [selectedVariant, setSelectedVariant] = React.useState<Variant>(defaultVariant);
  const [qty, setQty] = React.useState(1);

  const name = getLocalizedValue(product.name, locale);
  const tagline = getLocalizedValue(product.tagline, locale);

  const discount = selectedVariant.compareAtPrice
    ? Math.round(
        ((selectedVariant.compareAtPrice - selectedVariant.price) /
          selectedVariant.compareAtPrice) *
          100,
      )
    : 0;

  function handleAddToCart() {
    add(product, selectedVariant, qty);
    openCart();
    toast.success(`${name} added to cart`);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Category tag */}
      <span className="text-accent text-sm font-semibold tracking-widest uppercase">
        {product.category}
      </span>

      {/* Name */}
      <h1 className="font-heading text-foreground text-3xl leading-tight font-bold tracking-tight lg:text-4xl">
        {name}
      </h1>

      {/* Tagline */}
      {tagline && <p className="text-muted-foreground italic">{tagline}</p>}

      {/* Ratings */}
      <a href="#reviews" className="flex items-center gap-2">
        <StarRating value={product.rating} size="sm" />
        <span className="text-muted-foreground text-sm">
          {product.rating.toFixed(1)} ({product.reviewCount}{" "}
          {product.reviewCount === 1 ? "review" : "reviews"})
        </span>
      </a>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-heading text-primary text-3xl font-bold">
          {formatPrice(selectedVariant.price)}
        </span>
        {selectedVariant.compareAtPrice && (
          <>
            <span className="text-muted-foreground text-lg line-through">
              {formatPrice(selectedVariant.compareAtPrice)}
            </span>
            {discount > 0 && (
              <span className="bg-accent/20 text-primary rounded-full px-2 py-0.5 text-sm font-semibold">
                Save {discount}%
              </span>
            )}
          </>
        )}
      </div>

      {/* Variant selector */}
      {product.variants.length > 1 && (
        <VariantSelector
          variants={product.variants}
          selected={selectedVariant}
          onSelect={setSelectedVariant}
        />
      )}

      {/* Qty + add to cart */}
      <div className="flex flex-wrap items-center gap-3">
        <QuantitySelector
          value={qty}
          onChange={setQty}
          max={selectedVariant.stock - selectedVariant.reservedStock}
        />
        <Button size="lg" onClick={handleAddToCart} disabled={!product.inStock} className="flex-1">
          <ShoppingBag className="h-5 w-5" />
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
        <button
          onClick={() => toggle(product.id)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="border-border rounded-full border p-3 transition-colors hover:border-red-300"
        >
          <Heart
            className={[
              "h-5 w-5 transition-colors",
              wished ? "fill-red-500 text-red-500" : "text-muted-foreground",
            ].join(" ")}
          />
        </button>
      </div>

      {/* Buy now */}
      {product.inStock && (
        <Link href={`/${locale}/checkout`}>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => {
              add(product, selectedVariant, qty);
            }}
          >
            <Zap className="h-5 w-5" /> Buy Now
          </Button>
        </Link>
      )}

      {/* Short description */}
      <p className="text-muted-foreground text-sm leading-relaxed">
        {getLocalizedValue(product.shortDescription, locale)}
      </p>

      {/* Stock warning */}
      {product.inStock && selectedVariant.stock <= 5 && (
        <p className="text-sm font-medium text-amber-600">
          Only {selectedVariant.stock} left in stock!
        </p>
      )}
    </div>
  );
}
