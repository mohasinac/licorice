import type { PromoBanner } from "@/lib/types";

const now = new Date();

export const SEED_PROMO_BANNERS: (PromoBanner & { id: string })[] = [
  {
    id: "promo_welcome",
    text: "Welcome! Use code WELCOME15 for 15% off your first order",
    badgeLabel: "New Customer",
    couponCode: "WELCOME15",
    type: "discount",
    scope: "global",
    bgColor: "#065f46",
    textColor: "#ffffff",
    isActive: true,
    sortOrder: 1,
    createdAt: now,
  },
  {
    id: "promo_free_shipping",
    text: "Free shipping on orders above ₹499",
    badgeLabel: "Free Delivery",
    type: "info",
    scope: "global",
    bgColor: "#1e40af",
    textColor: "#ffffff",
    isActive: true,
    sortOrder: 2,
    createdAt: now,
  },
  {
    id: "promo_summer",
    text: "Summer Sale — Flat 20% off sitewide with code SUMMER20",
    badgeLabel: "Limited Time",
    couponCode: "SUMMER20",
    type: "urgency",
    scope: "global",
    bgColor: "#9f1239",
    textColor: "#ffffff",
    isActive: false,
    sortOrder: 3,
    createdAt: now,
  },
];
