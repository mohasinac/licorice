// constants/site.ts
// Brand-wide constants. Import from here — never hard-code brand copy in components.

export const BRAND_NAME = "Licorice Herbals";
export const BRAND_SHORT = "Licoricé";
export const TAGLINE = "Pure Ayurvedic Skincare — Rooted in nature. Proven by Ayurveda.";
export const SUPPORT_EMAIL = "support@licoriceherbal.in";
export const ORDERS_EMAIL = "orders@licoriceherbal.in";
export const SUPPORT_PHONE = "+91 99999 99999";
export const SUPPORT_HOURS = "Mon–Sat, 9:30 AM – 6:30 PM IST";
export const WHATSAPP_NUMBER = "919999999999"; // international format, no +

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/licoriceherbal/",
  facebook: "https://facebook.com/licoriceherbal",
  youtube: "https://youtube.com/@licoriceherbal",
} as const;

export const NAV_ITEMS = [
  { label: "Shop", href: "/shop" },
  { label: "Concerns", href: "/shop", hasDropdown: true },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Free Consultation", href: "/consultation" },
  { label: "Track Order", href: "/track" },
] as const;
