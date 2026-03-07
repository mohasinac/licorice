// lib/mocks/index.ts
// SEED_MAP is the authoritative registry of all seed collections.
// Used by: lib/db.ts (mock fallback), /api/dev/seed, /api/dev/unseed.
// Every collection key maps to an array of documents with a stable `id` field.

import type { SeedDoc } from "@/lib/types";
import { SEED_PRODUCTS } from "./products";
import { SEED_CATEGORIES } from "./categories";
import { SEED_CONCERNS } from "./concerns";
import { SEED_COUPONS } from "./coupons";
import { SEED_REVIEWS } from "./reviews";
import { SEED_BLOGS } from "./blogs";
import {
  SEED_SITE_CONFIG,
  SEED_SHIPPING_RULES,
  SEED_PAYMENT_SETTINGS,
  SEED_INVENTORY_SETTINGS,
} from "./settings";
import { SEED_INVENTORY } from "./inventory";

export const SEED_MAP: Record<string, SeedDoc[]> = {
  products: SEED_PRODUCTS as unknown as SeedDoc[],
  categories: SEED_CATEGORIES as unknown as SeedDoc[],
  concerns: SEED_CONCERNS as unknown as SeedDoc[],
  coupons: SEED_COUPONS.map((c) => ({ ...c, id: c.code })) as unknown as SeedDoc[],
  reviews: SEED_REVIEWS as unknown as SeedDoc[],
  blogs: SEED_BLOGS as unknown as SeedDoc[],
  settings: [
    SEED_SITE_CONFIG,
    SEED_SHIPPING_RULES,
    SEED_PAYMENT_SETTINGS,
    SEED_INVENTORY_SETTINGS,
  ] as unknown as SeedDoc[],
  inventory: SEED_INVENTORY as unknown as SeedDoc[],
};

// Re-export raw arrays for direct use in db.ts
export {
  SEED_PRODUCTS,
  SEED_CATEGORIES,
  SEED_CONCERNS,
  SEED_COUPONS,
  SEED_REVIEWS,
  SEED_BLOGS,
  SEED_SITE_CONFIG,
  SEED_SHIPPING_RULES,
  SEED_PAYMENT_SETTINGS,
  SEED_INVENTORY_SETTINGS,
  SEED_INVENTORY,
};
