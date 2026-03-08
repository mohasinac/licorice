// constants/policies.ts
// All business policy numbers in one place. INR only, domestic India.

export const FREE_SHIPPING_THRESHOLD = 999; // ₹
export const STANDARD_SHIPPING_RATE = 80; // ₹
export const COD_FEE = 50; // ₹ added for Cash on Delivery
export const GST_PERCENT = 12; // default GST % (cosmetics/skincare)
export const GST_INCLUDED = true; // product prices include GST
export const RETURN_WINDOW_DAYS = 3; // days from delivery
export const PROCESSING_DAYS = "1-2"; // business days
export const STANDARD_SLA = "5-7 business days";
export const EXPRESS_SLA = "2-3 business days";
export const SAME_DAY_SLA = "Same day (Mumbai only)";
export const RETURN_ELIGIBILITY = "Damaged, defective, wrong or expired items only";
export const REPLACEMENT_SLA_HOURS = 24;

export const LOW_STOCK_THRESHOLD_DEFAULT = 10;
export const REORDER_POINT_DEFAULT = 5;
export const DEFAULT_STOCK_PER_VARIANT = 50;

// Reservation timeout for pending orders (minutes)
export const ORDER_RESERVATION_TIMEOUT_MINUTES = 15;

// ── Shipping charge helper (shared between server and client code) ───────────

export type ShippingMode = "standard" | "express" | "same_day";

export function getShippingCharge(mode: ShippingMode, subtotal: number): number {
  switch (mode) {
    case "standard":
      return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_RATE;
    case "express":
      return 149;
    case "same_day":
      return 199;
  }
}

/**
 * Calculate GST amount from subtotal.
 * If GST is included in prices, extract the GST component.
 * If GST is not included, compute the additional GST to add.
 */
export function getGstAmount(
  subtotal: number,
  gstPercent: number = GST_PERCENT,
  gstIncluded: boolean = GST_INCLUDED,
): number {
  if (gstPercent <= 0) return 0;
  if (gstIncluded) {
    // GST is already in the price — extract the component for display
    return Math.round((subtotal * gstPercent) / (100 + gstPercent));
  }
  // GST is extra — add on top
  return Math.round((subtotal * gstPercent) / 100);
}
