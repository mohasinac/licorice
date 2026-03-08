import type { Product } from "@/lib/types";
import { toSafeDate } from "@/lib/utils";

export type SortKey = "featured" | "newest" | "price_asc" | "price_desc" | "rating";

export function sortProducts(products: Product[], sort: string): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => {
        const aPrice = a.variants.find((v) => v.isDefault)?.price ?? 0;
        const bPrice = b.variants.find((v) => v.isDefault)?.price ?? 0;
        return aPrice - bPrice;
      });
    case "price_desc":
      return copy.sort((a, b) => {
        const aPrice = a.variants.find((v) => v.isDefault)?.price ?? 0;
        const bPrice = b.variants.find((v) => v.isDefault)?.price ?? 0;
        return bPrice - aPrice;
      });
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort((a, b) => {
        const aTime = toSafeDate(a.createdAt)?.getTime() ?? 0;
        const bTime = toSafeDate(b.createdAt)?.getTime() ?? 0;
        return bTime - aTime;
      });
    default:
      return copy.sort((a, b) => a.sortOrder - b.sortOrder);
  }
}
