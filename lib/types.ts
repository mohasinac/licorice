// lib/types.ts
// Centralised TypeScript types for the entire application.
// These mirror Firestore document shapes. Timestamp is compatible with both
// firebase/firestore Timestamp and firebase-admin Timestamp.

export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}

// ─── Localisation ────────────────────────────────────────────────────────────

export type Locale = "en" | "hi" | "mr";
export type LocalizedString = { en: string; hi?: string; mr?: string };

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductCategory = "face" | "body" | "hair" | "powder" | "combo" | "supplements";

export interface Variant {
  id: string;
  label: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stock: number;
  reservedStock: number;
  weight: number; // grams — for Shiprocket
  dimensions?: { l: number; b: number; h: number }; // cm
  isDefault: boolean;
}

export interface Ingredient {
  name: string;
  benefit: string;
  icon?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  description: string;
  ingredients: Ingredient[];
  benefits: string[];
  howToUse: string[];
  faqs: FAQ[];
  images: string[];
  videoUrl?: string;
  category: ProductCategory;
  concerns: string[];
  comboItems?: string[];
  variants: Variant[];
  relatedProducts: string[];
  upsellProducts: string[];
  certifications: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isFeatured: boolean;
  isCombo: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  sortOrder: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ─── Category & Concern ───────────────────────────────────────────────────────

export interface Category {
  id: string;
  label: string;
  slug: string;
  description: string;
  imageUrl?: string;
}

export interface Concern {
  id: string;
  label: string;
  slug: string;
  description: string;
  imageUrl?: string;
}

// ─── Inventory ─────────────────────────────────────────────────────────────

export interface InventoryVariantEntry {
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  reorderPoint: number;
}

export interface InventoryDoc {
  productId: string;
  variants: Record<string, InventoryVariantEntry>;
  updatedAt: Timestamp | Date;
}

export type StockMovementType =
  | "stock_in"
  | "sale"
  | "return"
  | "adjustment"
  | "reserved"
  | "released";

export interface StockMovement {
  id: string;
  variantId: string;
  type: StockMovementType;
  quantity: number;
  referenceId?: string;
  note?: string;
  performedBy: string;
  createdAt: Timestamp | Date;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type PaymentMethod = "whatsapp" | "razorpay" | "cod";

export type PaymentStatus =
  | "pending_whatsapp"
  | "proof_submitted"
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type OrderStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "processing"
  | "ready_to_ship"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "return_picked_up"
  | "refunded";

export interface Address {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantLabel: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  guestEmail?: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  discount: number;
  couponCode?: string;
  couponType?: "percentage" | "flat";
  couponValue?: number;
  shippingCharge: number;
  codFee: number;
  gstAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  paymentSignature?: string;
  whatsappProofImageUrl?: string;
  whatsappConfirmedBy?: string;
  whatsappConfirmedAt?: Timestamp | Date;
  orderStatus: OrderStatus;
  shippingMode: "standard" | "express" | "same_day";
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  awbCode?: string;
  courierName?: string;
  courierTrackingUrl?: string;
  estimatedDeliveryDate?: Timestamp | Date;
  deliveredAt?: Timestamp | Date;
  manualShipping?: boolean;
  manualCourierName?: string;
  manualAwbCode?: string;
  returnReason?: string;
  returnImages?: string[];
  refundAmount?: number;
  refundId?: string;
  refundNote?: string;
  customerNote?: string;
  adminNote?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface OrderEvent {
  status: string;
  description: string;
  location?: string;
  source: "system" | "shiprocket" | "admin";
  createdAt: Timestamp | Date;
}

// ─── Coupon ──────────────────────────────────────────────────────────────────

export type CouponType = "percentage" | "flat" | "free_shipping" | "buy_x_get_y";

export interface Coupon {
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  applicableTo: "all" | "category" | "product" | "combo";
  applicableIds?: string[];
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  usedCount: number;
  startsAt: Timestamp | Date;
  expiresAt?: Timestamp | Date | null;
  isActive: boolean;
  buyQuantity?: number;
  getQuantity?: number;
  getProductId?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ─── Review ──────────────────────────────────────────────────────────────────

export type ReviewFlagReason = "spam" | "offensive" | "fake" | "irrelevant" | "other";

export interface ReviewFlag {
  id: string;
  reviewId: string;
  reportedBy: string;
  reason: ReviewFlagReason;
  note?: string;
  createdAt: Timestamp | Date;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  authorName?: string; // display name — populated from user profile or order data
  orderId?: string;
  isVerifiedPurchase: boolean;
  rating: number;
  title?: string;
  body: string;
  images?: string[];
  videoUrl?: string;
  status: ReviewStatus;
  rejectionReason?: string;
  moderatedBy?: string;
  moderatedAt?: Timestamp | Date;
  adminReply?: string;
  adminRepliedAt?: Timestamp | Date;
  helpfulCount: number;
  reportCount: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ─── Blog ────────────────────────────────────────────────────────────────────

export type BlogCategory = "skincare" | "diet-lifestyle" | "hair-care" | "ayurveda";
export type BlogStatus = "draft" | "published" | "archived";

export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // Rich HTML
  coverImage: string;
  author: string;
  category: BlogCategory;
  tags: string[];
  status: BlogStatus;
  relatedProducts: string[];
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ─── Support Ticket ──────────────────────────────────────────────────────────

export type TicketCategory =
  | "order"
  | "shipping"
  | "product"
  | "return"
  | "payment"
  | "consultation"
  | "other";
export type TicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  guestEmail?: string;
  orderId?: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  resolvedAt?: Timestamp | Date;
}

export interface TicketMessage {
  senderType: "customer" | "admin";
  senderId: string;
  body: string;
  attachments?: string[];
  isInternalNote?: boolean;
  createdAt: Timestamp | Date;
}

// ─── Consultation ────────────────────────────────────────────────────────────

export type ConsultationStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type ConsultationMode = "remote" | "in-person";

export interface ConsultationBooking {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  concern: string[];
  preferredDate: string;
  preferredTime: string;
  mode: ConsultationMode;
  message?: string;
  status: ConsultationStatus;
  adminNote?: string;
  createdAt: Timestamp | Date;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface SiteConfig {
  announcementText: string;
  announcementLink?: string;
  maintenanceMode: boolean;
  orderCounter: number;
  // Branding
  logoUrl?: string;
  // Contact & support
  supportPhone?: string;
  supportEmail?: string;
  supportHours?: string;
  // Social
  socialInstagram?: string;
  socialFacebook?: string;
  socialYoutube?: string;
  // Consultation
  consultantName?: string;
  consultantBio?: string;
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface ShippingRules {
  freeShippingThreshold: number;
  standardRate: number;
  codFee: number;
  codEnabled: boolean;
  expressEnabled: boolean;
  expressRate?: number;
  sameDayEnabled: boolean;
  sameDayRate?: number;
  sameDayCities?: string[];
  processingDays?: string;
  standardSla?: string;
  expressSla?: string;
  sameDaySla?: string;
  /** GST percentage applied to order subtotal (e.g. 12 or 18). 0 = no GST. */
  gstPercent: number;
  /** If true, product prices already include GST (show breakdown only). */
  gstIncluded: boolean;
  /** If true, fetch live courier rates from Shiprocket instead of using flat rates. */
  useShiprocketRates: boolean;
  /** Warehouse / pickup pincode sent to Shiprocket for rate queries. */
  pickupPincode?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface PaymentSettings {
  whatsappEnabled: boolean;
  whatsappUpiId: string;
  whatsappBusinessNumber: string;
  whatsappQrImageUrl?: string | null;
  razorpayEnabled: boolean;
  codEnabled: boolean;
  codFee: number;
  codMinOrder?: number | null;
  prepaidDiscountPercent?: number;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface InventorySettings {
  defaultLowStockThreshold: number;
  defaultReorderPoint: number;
  defaultStockPerVariant: number;
  reservationTimeoutMinutes: number;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = "customer" | "admin";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  phone?: string;
  role: UserRole;
  photoURL?: string | null;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string; // `${productId}_${variantId}`
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantLabel: string;
  image: string;
  price: number;
  compareAtPrice?: number; // original price for strike-through display
  quantity: number;
  maxQuantity?: number; // stock cap for UI
}

// ─── Corporate Inquiry ───────────────────────────────────────────────────────

export type CorporateInquiryStatus = "new" | "in_progress" | "won" | "lost";

export interface CorporateInquiry {
  id: string;
  companyName: string;
  contactPerson: string;
  designation?: string;
  email: string;
  phone: string;
  units: number;
  budgetPerUnit?: number;
  totalBudget?: number;
  deliveryDateRequired?: string;
  customBranding: boolean;
  message?: string;
  status: CorporateInquiryStatus;
  adminNote?: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// ─── Navigation Config ───────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export interface NavigationConfig {
  mainNav: NavItem[];
  footerNav: {
    shop: { label: string; href: string }[];
    account: { label: string; href: string }[];
    policies: { label: string; href: string }[];
  };
}

// ─── Homepage Sections ───────────────────────────────────────────────────────

export interface HeroBannerConfig {
  headline: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  backgroundImageUrl?: string;
  mobileImageUrl?: string;
}

export interface BrandValueItem {
  icon: string;
  title: string;
  description: string;
}

export interface InstagramReelItem {
  id: string;
  caption: string;
  reelUrl?: string;
  thumbnailUrl?: string;
  sortOrder: number;
}

export interface TrustBadgeItem {
  icon: string;
  title: string;
  description: string;
}

export interface BrandStoryConfig {
  tag: string;
  headline: string;
  body: string;
}

export interface HomepageSections {
  heroBanner: HeroBannerConfig;
  featuredProductIds: string[];
  newArrivalIds: string[];
  brandValues: BrandValueItem[];
  instagramReels: InstagramReelItem[];
  trustBadges: TrustBadgeItem[];
  brandStory: BrandStoryConfig;
  sectionVisibility: {
    showBeforeAfter: boolean;
    showTestimonials: boolean;
    showBlog: boolean;
    showNewsletter: boolean;
    showBrandValues: boolean;
    showInstagramReels: boolean;
    showTrustBadges: boolean;
    showBrandStory: boolean;
    showConcernGrid: boolean;
  };
}

// ─── Testimonial ─────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  customerName: string;
  city: string;
  rating: number;
  text: string;
  productId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Timestamp | Date;
}

// ─── Static Page Doc ─────────────────────────────────────────────────────────

export interface PageDoc {
  id: string;
  title: string;
  body: string; // Tiptap HTML
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  updatedAt?: Timestamp | Date;
}

// ─── Consultation Config ─────────────────────────────────────────────────────

export interface ConsultationConfig {
  consultantName: string;
  consultantTitle: string;
  consultantBio: string; // HTML
  consultantPhotoUrl?: string;
  consultationDurationMinutes: number;
  availableTimeSlots: string[];
  blockedDates: string[]; // ISO YYYY-MM-DD
  isEnabled: boolean;
  clinicName: string;
  clinicAddress: string;
  clinicMapUrl?: string;
}

// ─── Promo Banner ────────────────────────────────────────────────────────────

export type PromoBannerType = "info" | "discount" | "urgency";
export type PromoBannerScope = "global" | "product";

export interface PromoBanner {
  id: string;
  text: string;
  badgeLabel?: string;
  couponCode?: string;
  type: PromoBannerType;
  scope: PromoBannerScope;
  productIds?: string[];
  bgColor?: string;
  textColor?: string;
  isActive: boolean;
  expiresAt?: Timestamp | Date;
  sortOrder: number;
  createdAt: Timestamp | Date;
}

// ─── Media Kit ───────────────────────────────────────────────────────────────

export type MediaKitCategory = "logo" | "brand-guide" | "press-release" | "product-images" | "other";

export interface MediaKitFile {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number; // bytes
  mimeType: string;
  category: MediaKitCategory;
  sortOrder: number;
  isActive: boolean;
  downloads: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ─── Seed doc marker ─────────────────────────────────────────────────────────

export interface SeedDoc {
  id: string;
  [key: string]: unknown;
}
