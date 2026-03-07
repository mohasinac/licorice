// lib/mocks/navigation.ts
import type { NavigationConfig } from "@/lib/types";

export const SEED_NAVIGATION: NavigationConfig & { id: string } = {
  id: "navigation",
  mainNav: [
    { label: "Shop", href: "/shop" },
    {
      label: "Concerns",
      href: "/concerns",
      children: [
        { label: "Acne & Pimples", href: "/concern/acne" },
        { label: "Pigmentation", href: "/concern/pigmentation" },
        { label: "Anti-Aging", href: "/concern/anti-aging" },
        { label: "Hair Fall", href: "/concern/hair-fall" },
        { label: "Dry Skin", href: "/concern/dry-skin" },
      ],
    },
    { label: "Consultation", href: "/consultation" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  footerNav: {
    shop: [
      { label: "All Products", href: "/shop" },
      { label: "Skincare", href: "/shop?category=skincare" },
      { label: "Haircare", href: "/shop?category=haircare" },
      { label: "Combos", href: "/shop?type=combo" },
    ],
    account: [
      { label: "My Account", href: "/account" },
      { label: "Track Order", href: "/track" },
      { label: "Wishlist", href: "/wishlist" },
    ],
    policies: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Return Policy", href: "/return-policy" },
    ],
  },
};
