"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CartItem } from "@/lib/types";
import type { ShippingMode } from "@/stores/useCheckoutStore";
import { getShippingCharge } from "./ShippingOptions";
import { COD_FEE, getGstAmount, GST_PERCENT, GST_INCLUDED } from "@/constants/policies";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  discount?: number;
  couponCode?: string;
  shippingMode: ShippingMode;
  isCod?: boolean;
  isFreeShipping?: boolean;
  locale: string;
  gstPercent?: number;
  gstIncluded?: boolean;
  /** Override shipping charge (e.g. from Shiprocket quote) */
  shiprocketShipping?: number;
}

export function OrderSummary({
  items,
  subtotal,
  discount = 0,
  couponCode,
  shippingMode,
  isCod = false,
  isFreeShipping = false,
  locale,
  gstPercent = GST_PERCENT,
  gstIncluded = GST_INCLUDED,
  shiprocketShipping,
}: OrderSummaryProps) {
  const t = useTranslations("checkout");
  const shipping =
    shiprocketShipping !== undefined
      ? shiprocketShipping
      : isFreeShipping
        ? 0
        : getShippingCharge(shippingMode, subtotal - discount);
  const codFee = isCod ? COD_FEE : 0;
  const discountedSubtotal = subtotal - discount;
  const gstAmount = getGstAmount(discountedSubtotal, gstPercent, gstIncluded);
  // If GST is included, total stays the same; if not, add GST on top
  const total = gstIncluded
    ? discountedSubtotal + shipping + codFee
    : discountedSubtotal + gstAmount + shipping + codFee;

  return (
    <div className="border-border rounded-xl border p-5">
      <h3 className="font-heading text-foreground mb-4 text-lg font-semibold">{t("orderSummary")}</h3>

      {/* Items */}
      <ul className="divide-border mb-4 divide-y">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 py-3">
            <div className="bg-muted relative h-14 w-14 flex-none overflow-hidden rounded-lg">
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              <p className="text-foreground line-clamp-1 text-sm font-medium">{item.name}</p>
              <p className="text-muted-foreground text-xs">
                {item.variantLabel} × {item.quantity}
              </p>
            </div>
            <p className="text-foreground self-center text-sm font-semibold">
              {fmt(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <ShoppingBag className="text-border h-10 w-10" />
          <p className="text-muted-foreground text-sm">{t("browseProducts")}</p>
          <Link href="/shop" className="text-primary text-sm underline">
            {t("browseProducts")}
          </Link>
        </div>
      )}

      {/* Pricing */}
      <div className="space-y-2 border-t pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("subtotal")}</span>
          <span>{fmt(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>{t("discount")} {couponCode && `(${couponCode})`}</span>
            <span>−{fmt(discount)}</span>
          </div>
        )}
        {gstPercent > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {gstIncluded ? t("gstInclLabel", { percent: gstPercent }) : t("gstLabel", { percent: gstPercent })}
            </span>
            <span>{fmt(gstAmount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("shippingLabel")}</span>
          <span className={shipping === 0 ? "font-medium text-green-600 dark:text-green-400" : ""}>
            {shipping === 0 ? t("freeLabel") : fmt(shipping)}
          </span>
        </div>
        {isCod && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("codFeeLabel")}</span>
            <span>{fmt(COD_FEE)}</span>
          </div>
        )}
        <div className="border-border flex justify-between border-t pt-2 text-base font-bold">
          <span className="text-foreground">{t("totalLabel")}</span>
          <span className="text-primary">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}
