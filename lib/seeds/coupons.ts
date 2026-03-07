// lib/mocks/coupons.ts
import type { Coupon } from "@/lib/types";

const now = new Date();
const past = new Date("2026-01-01");

export const SEED_COUPONS: Coupon[] = [
  {
    code: "WELCOME10",
    description: "10% off your first order",
    type: "percentage",
    value: 10,
    minOrderValue: 500,
    maxDiscount: 200,
    applicableTo: "all",
    usageLimit: undefined,
    usageLimitPerUser: 1,
    usedCount: 0,
    startsAt: past,
    expiresAt: undefined,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    code: "LICORICE20",
    description: "Flat ₹200 off on orders above ₹999",
    type: "flat",
    value: 200,
    minOrderValue: 999,
    applicableTo: "all",
    usageLimit: undefined,
    usageLimitPerUser: undefined,
    usedCount: 0,
    startsAt: past,
    expiresAt: undefined,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    code: "FREESHIP",
    description: "Free shipping on orders above ₹500",
    type: "free_shipping",
    value: 0,
    minOrderValue: 500,
    applicableTo: "all",
    usageLimit: undefined,
    usageLimitPerUser: undefined,
    usedCount: 0,
    startsAt: past,
    expiresAt: undefined,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];
