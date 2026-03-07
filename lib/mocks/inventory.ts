// lib/mocks/inventory.ts
import type { InventoryDoc } from "@/lib/types";
import { SEED_PRODUCTS } from "./products";
import {
  LOW_STOCK_THRESHOLD_DEFAULT,
  REORDER_POINT_DEFAULT,
  DEFAULT_STOCK_PER_VARIANT,
} from "@/constants/policies";

const now = new Date();

export const SEED_INVENTORY: (InventoryDoc & { id: string })[] = SEED_PRODUCTS.map((product) => ({
  id: product.id,
  productId: product.id,
  variants: Object.fromEntries(
    product.variants.map((variant) => [
      variant.id,
      {
        stock: DEFAULT_STOCK_PER_VARIANT,
        reservedStock: 0,
        lowStockThreshold: LOW_STOCK_THRESHOLD_DEFAULT,
        reorderPoint: REORDER_POINT_DEFAULT,
      },
    ]),
  ),
  updatedAt: now,
}));
