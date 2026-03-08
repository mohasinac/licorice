"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CouponInput } from "@/components/cart/CouponInput";
import { Button } from "@/components/ui/Button";
import { FREE_SHIPPING_THRESHOLD } from "@/constants/policies";
import { useState, useEffect } from "react";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations("cart");
  const { items, clear } = useCartStore();
  const subtotal = useCartStore((s) => s.subtotal());
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-heading text-foreground mb-8 text-3xl font-bold">{t("shoppingCart")}</h1>
        <div className="grid gap-6 lg:grid-cols-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-surface h-32 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
        <ShoppingBag className="text-muted-foreground mb-4 h-12 w-12" />
        <h1 className="font-heading text-foreground text-2xl font-bold">{t("empty")}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{t("browseCollection")}</p>
        <Link href={`/${locale}/shop`}>
          <Button className="mt-6" size="md">
            {t("continueShopping")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-heading text-foreground mb-8 text-3xl font-bold">{t("shoppingCart")}</h1>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2">
            {/* Free shipping progress */}
            {remaining > 0 && (
              <div className="border-border mb-6 rounded-xl border bg-card p-4">
                <p className="text-muted-foreground text-sm">
                  {t("addMore", { amount: fmt(remaining) })}
                </p>
                <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="border-border rounded-xl border bg-card">
              <ul className="divide-border divide-y px-5">
                {items.map((item) => (
                  <CartItem key={item.variantId} item={item} />
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Link
                href={`/${locale}/shop`}
                className="text-primary text-sm font-medium hover:underline"
              >
                {t("continueShopping")}
              </Link>
              <button
                onClick={clear}
                className="text-muted-foreground hover:text-destructive text-sm transition-colors"
              >
                {t("clearCart")}
              </button>
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="border-border sticky top-24 space-y-6 rounded-xl border bg-card p-6">
              <h2 className="font-heading text-foreground text-lg font-semibold">{t("orderSummary")}</h2>

              <CartSummary
                subtotal={subtotal}
                discount={discount}
                couponCode={couponCode}
                autoShipping
              />

              <CouponInput
                cartTotal={subtotal}
                onApplied={(code: string, disc: number) => {
                  setCouponCode(code);
                  setDiscount(disc);
                }}
                onRemoved={() => {
                  setCouponCode(undefined);
                  setDiscount(0);
                }}
                appliedCode={couponCode}
              />

              <Link href={`/${locale}/checkout`} className="block">
                <Button className="w-full" size="lg">
                  {t("proceedToCheckout")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
