// lib/mocks/settings.ts
import type {
  SiteConfig,
  ShippingRules,
  PaymentSettings,
  InventorySettings,
  HomepageSections,
  ConsultationConfig,
} from "@/lib/types";

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
  consultantName: "Dr. Mariya Nallamandu",
  consultantBio:
    "Certified Ayurvedic practitioner (BAMS) with 10+ years of experience in herbal skincare and hair care.",
  metaTitle: "Licorice Herbals — Pure Ayurvedic Skincare",
  metaDescription:
    "Shop Licorice Herbals' range of authentic Ayurvedic skincare, hair care, and wellness products. Free shipping above ₹999.",
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

export const SEED_HOMEPAGE_SECTIONS: HomepageSections & { id: string } = {
  id: "homepageSections",
  heroBanner: {
    headline: "Rediscover the Power of Ayurveda",
    subheadline:
      "Licorice Herbals blends time-honoured botanical extracts with precision formulation for skin and hair that truly thrives.",
    primaryCtaText: "Explore Products",
    primaryCtaHref: "/shop",
    secondaryCtaText: "Our Story",
    secondaryCtaHref: "/about",
  },
  featuredProductIds: [
    "prod_kumkumadi_oil",
    "prod_vitamin_c_serum",
    "prod_hair_repair_oil",
    "prod_neem_face_wash",
  ],
  newArrivalIds: [
    "prod_under_eye_elixir",
    "prod_spf50_sunscreen",
    "prod_body_butter",
    "prod_glow_bundle",
  ],
  brandValues: [
    {
      icon: "Leaf",
      title: "100% Natural",
      description:
        "Every ingredient is plant-derived, cold-pressed or steam-distilled — nothing synthetic.",
    },
    {
      icon: "Shield",
      title: "Cruelty-Free",
      description: "Never tested on animals. PETA-registered and Leaping Bunny certified.",
    },
    {
      icon: "FlaskConical",
      title: "Dermat Tested",
      description: "Clinically tested by certified dermatologists for every skin type.",
    },
    {
      icon: "Award",
      title: "GMP Certified",
      description:
        "Manufactured in a WHO-GMP certified facility adhering to the highest safety standards.",
    },
  ],
  sectionVisibility: {
    showBeforeAfter: true,
    showTestimonials: true,
    showBlog: true,
    showNewsletter: true,
    showBrandValues: true,
  },
};

export const SEED_CONSULTATION_CONFIG: ConsultationConfig & { id: string } = {
  id: "consultationConfig",
  consultantName: "Dr. Mariya Nallamandu",
  consultantTitle: "Certified Ayurvedic Practitioner (BAMS)",
  consultantBio:
    "<p>Dr. Mariya Nallamandu (BAMS) has over 10 years of experience in Ayurvedic skincare and hair care. She specialises in personalised wellness plans using traditional herbal formulations.</p>",
  consultationDurationMinutes: 30,
  availableTimeSlots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
  blockedDates: [],
  isEnabled: true,
  clinicName: "Licorice Herbals Wellness Centre",
  clinicAddress: "2nd Floor, Plot 12, Banjara Hills Road No. 3, Hyderabad, Telangana 500034",
};
