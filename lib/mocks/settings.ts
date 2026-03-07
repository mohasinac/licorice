// lib/mocks/settings.ts
import type { SiteConfig, ShippingRules, PaymentSettings, InventorySettings } from "@/lib/types";

const now = new Date();

export const SEED_SITE_CONFIG: SiteConfig & { id: string } = {
  id: "siteConfig",
  announcementText: "🌿 Free shipping above ₹999 | Use code WELCOME10 for 10% off your first order",
  announcementLink: "/shop",
  maintenanceMode: false,
  orderCounter: 0,
  supportPhone: "+91 99999 99999",
  supportEmail: "support@licoriceherbal.in",
  supportHours: "Mon–Sat, 9:30 AM – 6:30 PM IST",
  socialInstagram: "https://instagram.com/licoriceherbal",
  socialFacebook: "https://facebook.com/licoriceherbal",
  socialYoutube: "https://youtube.com/@licoriceherbal",
  consultantName: "Dr. Ayesha Sharma",
  consultantBio: "Certified Ayurvedic practitioner with 10+ years of experience in herbal skincare and hair care.",
  metaTitle: "Licorice Herbals — Pure Ayurvedic Skincare",
  metaDescription: "Shop Licorice Herbals' range of authentic Ayurvedic skincare, hair care, and wellness products. Free shipping above ₹999.",
  createdAt: now,
  updatedAt: now,
};

export const SEED_SHIPPING_RULES: ShippingRules & { id: string } = {
  id: "shippingRules",
  freeShippingThreshold: 999,
  standardRate: 80,
  codFee: 50,
  codEnabled: true,
  expressEnabled: true,
  expressRate: 120,
  sameDayEnabled: true,
  sameDayRate: 199,
  sameDayCities: ["Mumbai"],
  processingDays: "1-2",
  standardSla: "5-7 business days",
  expressSla: "2-3 business days",
  sameDaySla: "Same day (Mumbai only)",
  createdAt: now,
  updatedAt: now,
};

export const SEED_PAYMENT_SETTINGS: PaymentSettings & { id: string } = {
  id: "paymentSettings",
  whatsappEnabled: true,
  whatsappUpiId: "licoriceherbal@upi",
  whatsappBusinessNumber: "919999999999",
  whatsappQrImageUrl: undefined,
  razorpayEnabled: false,
  codEnabled: true,
  codFee: 50,
  codMinOrder: undefined,
  prepaidDiscountPercent: 5,
  createdAt: now,
  updatedAt: now,
};

export const SEED_INVENTORY_SETTINGS: InventorySettings & { id: string } = {
  id: "inventorySettings",
  defaultLowStockThreshold: 10,
  defaultReorderPoint: 5,
  defaultStockPerVariant: 50,
  reservationTimeoutMinutes: 15,
  updatedAt: now,
};
