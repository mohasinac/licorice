"use client";

import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_RATE,
  COD_FEE,
  getGstAmount,
  GST_PERCENT,
  GST_INCLUDED,
} from "@/constants/policies";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

interface CartSummaryProps {
  subtotal: number;
  discount?: number;
  couponCode?: string;
  shippingCharge?: number;
  isCod?: boolean;
  /** If true, compute shipping automatically from subtotal */
  autoShipping?: boolean;
  gstPercent?: number;
  gstIncluded?: boolean;
}

export function CartSummary({
  subtotal,
  discount = 0,
  couponCode,
  shippingCharge,
  isCod = false,
  autoShipping = false,
  gstPercent = GST_PERCENT,
  gstIncluded = GST_INCLUDED,
}: CartSummaryProps) {
  const shipping =
    shippingCharge !== undefined
      ? shippingCharge
      : autoShipping
        ? subtotal - discount >= FREE_SHIPPING_THRESHOLD
          ? 0
          : STANDARD_SHIPPING_RATE
        : undefined;

  const codFee = isCod ? COD_FEE : 0;
  const discountedSubtotal = subtotal - discount;
  const gstAmount = getGstAmount(discountedSubtotal, gstPercent, gstIncluded);
  const baseTotal = gstIncluded
    ? discountedSubtotal + (shipping ?? 0) + codFee
    : discountedSubtotal + gstAmount + (shipping ?? 0) + codFee;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="text-foreground font-medium">{fmt(subtotal)}</span>
      </div>

      {discount > 0 && couponCode && (
        <div className="flex justify-between text-green-600 dark:text-green-400">
          <span>Discount ({couponCode})</span>
          <span>−{fmt(discount)}</span>
        </div>
      )}

      {gstPercent > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            GST ({gstPercent}%){gstIncluded ? " incl." : ""}
          </span>
          <span className="text-foreground font-medium">{fmt(gstAmount)}</span>
        </div>
      )}

      {shipping !== undefined && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span
            className={
              shipping === 0 ? "font-medium text-green-600 dark:text-green-400" : "text-foreground font-medium"
            }
          >
            {shipping === 0 ? "Free" : fmt(shipping)}
          </span>
        </div>
      )}

      {isCod && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">COD Fee</span>
          <span className="text-foreground font-medium">{fmt(COD_FEE)}</span>
        </div>
      )}

      <div className="border-border flex justify-between border-t pt-2 text-base font-semibold">
        <span className="text-foreground">Total</span>
        <span className="text-primary">{fmt(baseTotal)}</span>
      </div>
    </div>
  );
}
