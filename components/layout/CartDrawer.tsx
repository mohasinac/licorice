"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { Button } from "@/components/ui/Button";
import { FREE_SHIPPING_THRESHOLD } from "@/constants/policies";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function CartDrawer() {
  const locale = useLocale();
  const { items, isOpen, closeCart, remove, updateQty, subtotal, itemCount } = useCartStore();
  const sub = subtotal();
  const remaining = FREE_SHIPPING_THRESHOLD - sub;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(v) => !v && closeCart()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Shopping cart</Dialog.Title>

          {/* Header */}
          <div className="border-border flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-primary h-5 w-5" />
              <span className="font-heading text-primary text-lg font-semibold">
                Your Cart {itemCount() > 0 && `(${itemCount()})`}
              </span>
            </div>
            <Dialog.Close asChild>
              <button
                className="text-foreground hover:bg-surface rounded-full p-2"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
              <ShoppingBag className="text-border h-16 w-16" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Dialog.Close asChild>
                <Link href={`/${locale}/shop`}>
                  <Button size="md">Start Shopping</Button>
                </Link>
              </Dialog.Close>
            </div>
          ) : (
            <>
              {/* Free shipping progress */}
              {remaining > 0 && (
                <div className="border-border border-b px-6 py-3 text-center text-sm">
                  <p className="text-muted-foreground">
                    Add <strong className="text-primary">{formatPrice(remaining)}</strong> more for
                    free shipping!
                  </p>
                  <div className="bg-surface mt-2 h-1.5 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((sub / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Items */}
              <ul className="divide-border flex-1 divide-y overflow-y-auto">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-4 px-6 py-4">
                    <div className="bg-surface relative h-20 w-20 flex-none overflow-hidden rounded-lg">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="text-foreground line-clamp-1 text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-muted-foreground text-xs">{item.variantLabel}</p>
                      <p className="text-primary text-sm font-semibold">
                        {formatPrice(item.price)}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="border-border flex items-center gap-1 rounded-lg border">
                          <button
                            onClick={() => updateQty(item.variantId, item.quantity - 1)}
                            className="text-foreground hover:text-primary px-2 py-1"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= (item.maxQuantity ?? 99)}
                            className="text-foreground hover:text-primary px-2 py-1 disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(item.variantId)}
                          className="text-red-400 transition-colors hover:text-red-600"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="border-border flex flex-col gap-3 border-t px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">Subtotal</span>
                  <span className="text-primary font-semibold">{formatPrice(sub)}</span>
                </div>
                <p className="text-muted-foreground text-center text-xs">
                  Taxes and shipping calculated at checkout
                </p>
                <Dialog.Close asChild>
                  <Link href={`/${locale}/checkout`} className="block">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Link
                    href={`/${locale}/cart`}
                    className="text-primary block text-center text-sm hover:underline"
                  >
                    View full cart
                  </Link>
                </Dialog.Close>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
