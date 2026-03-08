"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, Variant } from "@/lib/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (product: Product, variant: Variant, quantity?: number) => void;
  remove: (variantId: string) => void;
  updateQty: (variantId: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      add: (product, variant, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === variant.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === variant.id ? { ...i, quantity: i.quantity + quantity } : i,
              ),
              isOpen: true,
            };
          }
          const newItem: CartItem = {
            id: `${product.id}_${variant.id}`,
            productId: product.id,
            variantId: variant.id,
            name: typeof product.name === "string" ? product.name : (product.name as { en: string }).en,
            slug: product.slug,
            category: product.category ?? "",
            image: product.images[0] ?? "/images/placeholder.jpg",
            variantLabel: variant.label,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            quantity,
            maxQuantity: variant.stock > 0 ? Math.min(variant.stock, 10) : 10,
          };
          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      remove: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

      updateQty: (variantId, quantity) => {
        if (quantity <= 0) {
          get().remove(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        }));
      },

      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "licorice-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
