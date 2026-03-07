// lib/mocks/navigation.ts
import type { NavigationConfig } from "@/lib/types";

export const SEED_NAVIGATION: NavigationConfig & { id: string } = {
  id: "navigation",
  mainNav: [
    { label: "Shop", href: "/shop" },
    {
      label: "Concerns",
      href: "/concern",
      children: [
        { label: "Anti-Ageing", href: "/concern/anti-ageing" },
        { label: "Pigmentation", href: "/concern/pigmentation-melasma" },
        { label: "Acne & Pimples", href: "/concern/pimples-open-pores" },
        { label: "Brightening", href: "/concern/brightening" },
        { label: "Tanning", href: "/concern/tanning" },
        { label: "Dryness", href: "/concern/dryness" },
        { label: "Hair Care", href: "/concern/hair-care" },
        { label: "Blemishes", href: "/concern/blemishes-dark-spots" },
      ],
    },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Free Consultation", href: "/consultation" },
    { label: "Track Order", href: "/track" },
  ],
  footerNav: {
    shop: [
      { label: "All Products", href: "/shop" },
      { label: "Face Care", href: "/shop?category=face" },
      { label: "Hair Care", href: "/shop?category=hair" },
      { label: "Body Care", href: "/shop?category=body" },
      { label: "Combo Packs", href: "/combos" },
    ],
    account: [
      { label: "My Account", href: "/account" },
      { label: "My Orders", href: "/account/orders" },
      { label: "Wishlist", href: "/account/wishlist" },
      { label: "Track Order", href: "/track" },
      { label: "Support", href: "/account/support" },
    ],
    policies: [
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
};
