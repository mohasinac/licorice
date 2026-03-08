"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { getLocalizedValue } from "@/lib/i18n";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import type { Product, Locale } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale() as Locale;
  const { add, openCart } = useCartStore();
  const { toggle, isWished } = useWishlistStore();
  const wished = isWished(product.id);

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const name = getLocalizedValue(product.name, locale);
  const tagline = getLocalizedValue(product.tagline, locale);
  const discount = defaultVariant?.compareAtPrice
    ? Math.round(
        ((defaultVariant.compareAtPrice - defaultVariant.price) / defaultVariant.compareAtPrice) *
          100,
      )
    : 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!defaultVariant) return;
    add(product, defaultVariant);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggle(product.id);
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="ayur-card group border-border relative flex flex-col overflow-hidden rounded-2xl border bg-white"
    >
      {/* Image */}
      <div className="bg-surface relative aspect-square overflow-hidden">
        <Image
          src={product.images[0] ?? "/images/placeholder.jpg"}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount > 0 && <Badge variant="error">-{discount}%</Badge>}
        </div>
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
        >
          <Heart
            className={[
              "h-4 w-4 transition-colors",
              wished ? "fill-red-500 text-red-500" : "text-foreground",
            ].join(" ")}
          />
        </button>
        {/* Add to cart overlay */}
        <button
          onClick={handleAddToCart}
          className="bg-primary absolute right-0 bottom-0 left-0 flex items-center justify-center gap-2 py-3 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:opacity-100"
        >
          <ShoppingBag className="h-4 w-4" />
          Add to Cart
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-4">
        <p className="text-muted-foreground text-xs">{product.category}</p>
        <h3 className="font-heading text-foreground line-clamp-1 text-base font-semibold">
          {name}
        </h3>
        <p className="text-muted-foreground line-clamp-1 text-xs">{tagline}</p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-primary font-semibold">
              {formatPrice(defaultVariant?.price ?? 0)}
            </span>
            {defaultVariant?.compareAtPrice &&
              defaultVariant.compareAtPrice > defaultVariant.price && (
                <span className="text-muted-foreground text-xs line-through">
                  {formatPrice(defaultVariant.compareAtPrice)}
                </span>
              )}
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <StarRating value={product.rating} size="sm" />
              <span className="text-muted-foreground text-xs">({product.reviewCount})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
