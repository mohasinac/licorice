"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import type { CartItem as CartItemType } from "@/lib/types";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQty, remove } = useCartStore();

  return (
    <li className="flex gap-4 py-4">
      <div className="bg-muted relative h-20 w-20 flex-none overflow-hidden rounded-lg">
        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-foreground line-clamp-1 text-sm font-medium">{item.name}</p>
        <p className="text-muted-foreground text-xs">{item.variantLabel}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateQty(item.variantId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="border-border text-foreground hover:bg-muted flex h-7 w-7 items-center justify-center rounded-md border transition-colors disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-foreground w-7 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQty(item.variantId, item.quantity + 1)}
              disabled={!!(item.maxQuantity && item.quantity >= item.maxQuantity)}
              className="border-border text-foreground hover:bg-muted flex h-7 w-7 items-center justify-center rounded-md border transition-colors disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="text-right">
            <p className="text-primary text-sm font-semibold">{fmt(item.price * item.quantity)}</p>
            {item.compareAtPrice && (
              <p className="text-muted-foreground text-xs line-through">
                {fmt(item.compareAtPrice * item.quantity)}
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => remove(item.variantId)}
        className="text-muted-foreground hover:text-destructive self-start p-1 transition-colors"
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
