# Licorice Herbals — Project Plan

## Overview

A full-stack herbal/ayurvedic e-commerce website built with **Next.js 14 (App Router)**, **Firebase (Firestore + Auth + Storage)**, and **Shiprocket** for shipping. Inspired by weherbal.in — includes a complete storefront, admin back-office (inventory, orders, coupons, reviews, tracking, support), customer account area, free consultation booking, corporate gifting, and a blog/diet section.

---

## Tech Stack

| Layer         | Choice                       | Notes                                                        |
| ------------- | ---------------------------- | ------------------------------------------------------------ |
| Framework     | Next.js 14 (App Router)      | SSR + SSG + Server Actions                                   |
| Styling       | Tailwind CSS + CSS Variables | Theme tokens via `constants/theme.ts`                        |
| State         | Zustand                      | Cart, wishlist, auth, UI state                               |
| Backend/DB    | Firebase Firestore (Spark)   | Free tier only — no Cloud Functions required                 |
| Auth          | Firebase Auth (Spark)        | Google + Email/Password + custom role claims via Firestore   |
| Storage       | Firebase Storage (Spark)     | Product images, review photos, blog images (5 GB free)       |
| Shipping      | Shiprocket API + Manual      | API integration + manual override fallback                   |
| Payments      | WhatsApp + Razorpay + COD    | WhatsApp is primary; Razorpay optional, all togglable        |
| Email         | Resend (free 3k/month)       | Order confirmations, support replies — called from API routes |
| Forms         | React Hook Form + Zod        | Client + server validation                                   |
| Animations    | Framer Motion                | Hero, page transitions, micro-interactions                   |
| UI Primitives | Radix UI                     | Dialogs, selects, dropdowns, accordions                      |
| Carousel      | Embla Carousel               | Product sliders, testimonial carousels                       |
| Notifications | React Hot Toast              | Cart, order, error toasts                                    |
| Rich Text     | Tiptap                       | Blog editor + product descriptions in admin                  |
| i18n          | next-intl                    | English, Hindi, Marathi — App Router middleware locale routing |
| Deployment    | Vercel Hobby (free)          | Auto-deploy from main branch; API routes replace Cloud Fns   |

---

## Brand & Theme

### Logo (provided)
- Name: **LICORICÉ** (with accent)
- Motifs: Circular botanical emblem with leaves + butterfly, loose leaf element
- Style: Elegant, premium, nature-forward luxury

### Colour Palette (extracted from logo)

| Token               | Hex       | Usage                                   |
| ------------------- | --------- | --------------------------------------- |
| `primary`           | `#2B1A6B` | Deep royal indigo — main brand colour   |
| `primaryForeground` | `#FFFFFF` | Text/icons on primary                   |
| `secondary`         | `#6B4FA0` | Medium purple — hover states, accents   |
| `accent`            | `#C9B99A` | Warm champagne/gold — highlight, badges |
| `background`        | `#FAFAF7` | Off-white cream — page background       |
| `foreground`        | `#1A0F3C` | Very dark purple — body text            |
| `muted`             | `#F3F0F8` | Light lavender — card backgrounds       |
| `mutedForeground`   | `#6E5F9C` | Subdued text                            |
| `border`            | `#DDD5F0` | Dividers, input borders                 |
| `destructive`       | `#C0392B` | Error / danger                          |
| `success`           | `#2E7D32` | Stock confirmed, order delivered        |

### Typography

| Token     | Font                  | Notes                                         |
| --------- | --------------------- | --------------------------------------------- |
| `heading` | Cormorant Garamond    | Elegant serif — matches logo feel             |
| `body`    | Inter                 | Clean sans-serif — readability                |
| `accent`  | Cormorant Garamond (italic) | Pull-quotes, taglines                   |

> All tokens live in `constants/theme.ts` and are applied as CSS custom properties in `globals.css`. Changing a value there updates the entire site.

---

## Internationalisation (i18n)

### Languages Supported

| Code | Language | Script      | Launch Status |
| ---- | -------- | ----------- | ------------- |
| `en` | English  | Latin       | Phase 1 (required) |
| `hi` | Hindi    | Devanagari  | Phase 8 |
| `mr` | Marathi  | Devanagari  | Phase 8 |

Default locale: `en`. Language switcher rendered in `Navbar` and `MobileMenu`. URL structure: `/en/shop`, `/hi/shop`, `/mr/shop`. `/shop` redirects to `/en/shop` via middleware.

### Library: next-intl

- All routes live under `app/[locale]/` segment
- `middleware.ts` negotiates locale from URL prefix; falls back to `en`
- Server components: `getTranslations(namespace)` — Client components: `useTranslations(namespace)`
- All brand copy references **Licorice Herbals** (never weherbal)

### File Structure

```
messages/
├── en.json     ← English (primary — must be 100% complete)
├── hi.json     ← Hindi
└── mr.json     ← Marathi

lib/
└── i18n.ts     ← supported locales list, LocalizedString type, getLocalizedValue() helper
```

### Translation Namespaces (`messages/en.json` shape)

```json
{
  "nav":      { "shop": "Shop", "blog": "Blog", "consultation": "Free Consultation", "track": "Track Order" },
  "home":     { "heroTitle": "Pure Ayurvedic Skincare", "heroSub": "Rooted in nature. Proven by Ayurveda." },
  "product":  { "addToCart": "Add to Cart", "buyNow": "Buy Now", "inStock": "In Stock", "outOfStock": "Out of Stock" },
  "cart":     { "empty": "Your cart is empty", "checkout": "Proceed to Checkout" },
  "checkout": { "payWhatsApp": "Pay via WhatsApp / UPI", "payCOD": "Cash on Delivery", "payRazorpay": "Pay Online" },
  "concerns": { "acne": "Acne & Pimples", "pigmentation": "Pigmentation & Melasma", "brightening": "Brightening", "anti-ageing": "Anti-Ageing", "tanning": "Tanning", "dryness": "Dryness", "hair-care": "Hair Care", "blemishes": "Blemishes & Dark Spots" },
  "policies": { "freeShipping": "Free shipping above ₹999", "returnWindow": "3-day return policy (damaged/defective only)" },
  "account":  { "orders": "My Orders", "wishlist": "Wishlist", "addresses": "My Addresses", "profile": "My Profile" },
  "errors":   { "outOfStock": "Out of stock", "couponInvalid": "Invalid coupon code", "pincodeUnserved": "Delivery not available at this pincode" },
  "admin":    { "dashboard": "Dashboard", "products": "Products", "orders": "Orders", "inventory": "Inventory" }
}
```

### Firestore Dynamic Content (LocalizedString)

Product names, descriptions, benefits, FAQs, blog posts, and other user-edited content are stored as `LocalizedString` maps in Firestore:

```ts
// lib/i18n.ts
export type LocalizedString = { en: string; hi?: string; mr?: string };

export function getLocalizedValue(field: LocalizedString, locale: string): string {
  return field[locale as keyof LocalizedString] ?? field.en; // always falls back to English
}
```

Localizable fields in `Product`: `name`, `tagline`, `shortDescription`, `description`, `benefits[]`, `howToUse[]`, `faqs[].question`, `faqs[].answer`, `ingredients[].benefit`.

The admin product form shows an **EN | HI | MR** tab strip for each localizable field. Slug, SKU, price, and images remain single-language.

### SEO Per-Locale

- `generateMetadata()` returns locale-specific `metaTitle` + `metaDescription`
- Root layout injects `<link rel="alternate" hreflang="...">` for all three locales
- Sitemap includes `/en/…`, `/hi/…`, `/mr/…` variants for all indexable pages

---

## Firebase Plan (Free Spark — No Blaze Required)

### Spark (Free) includes:

- Firestore: 1 GiB storage, 50k reads/day, 20k writes/day
- Auth: Unlimited
- Storage: 5 GB, 1 GB/day download
- Hosting: 10 GB/month

### Blaze (Pay-as-you-go — same free quotas + unlocks):

- Cloud Functions: order webhooks, Shiprocket callbacks, email triggers, scheduled jobs (low-stock alerts, coupon expiry)
- Estimated cost at low traffic: ~₹0 (within free tier)

### Firestore Collections (complete):

```
/products/{productId}
  /variants/{variantId}           ← sub-collection for Firestore composite queries

/categories/{categoryId}          ← Face | Body | Hair | Powder | Combo
/concerns/{concernId}             ← Acne | Pigmentation | Dryness | Anti-Ageing | Brightening | etc.

/orders/{orderId}
  /timeline/{eventId}             ← append-only status history log

/users/{userId}
  /cart/{itemId}
  /wishlist/{itemId}
  /addresses/{addressId}
  /consultations/{bookingId}

/reviews/{reviewId}               ← top-level for cross-product queries
/reviewFlags/{flagId}             ← moderation flags

/coupons/{couponCode}
/couponUsage/{usageId}            ← tracks who used what coupon

/blogs/{blogId}                   ← skincare + diet categories
/consultations/{bookingId}        ← free consultation bookings
/supportTickets/{ticketId}        ← customer support
  /messages/{messageId}

/corporateInquiries/{inquiryId}
/newsletter/{subscriberId}
/inventory/{productId}            ← stock ledger (current + reserved)
  /movements/{movementId}         ← stock-in / sale / return / adjustment log

/settings/siteConfig              ← announcement bar, maintenance mode, feature flags, payment method toggles
/settings/shippingRules           ← thresholds, COD rules, zone rates
/settings/paymentSettings         ← which payment methods are enabled (whatsapp, razorpay, cod)
```

---

## Complete Site Structure (Pages)

```
app/
├── (storefront)/
│   ├── page.tsx                        → Home
│   ├── shop/
│   │   ├── page.tsx                    → All Products (filter + sort)
│   │   └── [category]/page.tsx         → Category: face | body | hair | powder | combo
│   ├── concern/
│   │   └── [concern]/page.tsx          → Shop by Concern (acne, pigmentation, etc.)
│   ├── products/
│   │   └── [slug]/page.tsx             → Product Detail
│   ├── combos/page.tsx                 → Combo Packs
│   ├── blog/
│   │   ├── page.tsx                    → Blog List (skincare + ayurveda)
│   │   ├── [slug]/page.tsx             → Blog Post
│   │   └── diet/page.tsx               → Diet & Lifestyle section
│   ├── about/page.tsx
│   ├── contact/page.tsx                → Contact form + WhatsApp link
│   ├── track/page.tsx                  → Order Tracking (AWB / order ID lookup)
│   ├── consultation/page.tsx           → Free Skin & Hair Consultation Booking
│   ├── corporate-gifting/page.tsx      → Corporate Gifting inquiry form
│   ├── search/page.tsx                 → Search Results
│   └── (policies)/
│       ├── shipping-policy/page.tsx
│       ├── refund-policy/page.tsx
│       └── terms/page.tsx
│
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
│
├── (account)/
│   ├── account/page.tsx                → Dashboard (recent orders, quick links)
│   ├── account/orders/page.tsx         → Order history list
│   ├── account/orders/[id]/page.tsx    → Order detail + live tracking
│   ├── account/wishlist/page.tsx
│   ├── account/addresses/page.tsx
│   ├── account/profile/page.tsx        → Edit name, email, phone, password
│   └── checkout/page.tsx              → Multi-step: Cart → Address → Shipping → Payment → Confirm
│
└── (admin)/
    └── admin/
        ├── page.tsx                    → Dashboard (stats, charts, alerts)
        ├── products/
        │   ├── page.tsx                → Product list (search, filter, bulk actions)
        │   ├── new/page.tsx            → Create product
        │   └── [id]/page.tsx           → Edit product
        ├── inventory/
        │   ├── page.tsx                → Stock overview (all variants, low-stock alerts)
        │   └── [productId]/page.tsx    → Per-product stock ledger + adjust
        ├── orders/
        │   ├── page.tsx                → Order list (filter by status, search by ID/name)
        │   └── [id]/page.tsx           → Order detail: view, update status, ship, refund
        ├── coupons/
        │   ├── page.tsx                → Coupon list
        │   └── new/page.tsx            → Create/edit coupon
        ├── reviews/
        │   ├── page.tsx                → All reviews (pending approval queue)
        │   └── [id]/page.tsx           → Review detail: approve / reject / reply
        ├── blogs/
        │   ├── page.tsx
        │   ├── new/page.tsx
        │   └── [id]/page.tsx
        ├── consultations/page.tsx      → Booking list: upcoming, completed
        ├── support/
        │   ├── page.tsx                → Support ticket inbox
        │   └── [ticketId]/page.tsx     → Ticket thread + reply
        ├── corporate/page.tsx          → Corporate inquiry list
        ├── newsletter/page.tsx         → Subscriber list + export CSV
        ├── settings/page.tsx           → Site config, shipping rules, announcement bar, payment method toggles
        └── settings/payments/page.tsx  → Enable/disable WhatsApp, Razorpay, COD independently

├── (dev)/                               ← middleware returns 404 in production
│   └── dev/
│       └── seed/page.tsx               → Upsert / delete seed docs by known IDs (dev only)

api/
├── shiprocket/
│   ├── token/route.ts              → Fetch + cache Shiprocket JWT in Firestore (24h TTL)
│   ├── create-order/route.ts       → Create shipment after payment confirmed
│   ├── cancel-order/route.ts
│   ├── track/route.ts              → Proxy tracking by AWB / order ID
│   └── webhook/route.ts            → Receive + validate Shiprocket status updates
├── payment/
│   ├── razorpay/
│   │   ├── create-order/route.ts   → Create Razorpay order (only if enabled in settings)
│   │   └── verify/route.ts         → HMAC signature verification
│   └── whatsapp/
│       └── submit-proof/route.ts   → Customer uploads payment screenshot → stored in Firebase Storage
├── order-confirm/route.ts          → Sends confirmation email via Resend after payment verified
├── pincode-check/route.ts          → Shiprocket serviceability + ETA
├── newsletter/route.ts
├── contact/route.ts
└── review/
    └── flag/route.ts               → Report abusive review
```

---

## Data Models (Complete)

### Product

```ts
interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  description: string; // Rich HTML (Tiptap output)
  ingredients: Ingredient[]; // { name, benefit, icon? }
  benefits: string[];
  howToUse: string[]; // Ordered steps
  faqs: FAQ[]; // { question, answer }
  images: string[]; // Firebase Storage URLs
  videoUrl?: string; // YouTube/Vimeo embed URL
  category: ProductCategory; // face | body | hair | powder | combo
  concerns: string[]; // acne | pigmentation | dryness | anti-ageing | brightening | tanning
  comboItems?: string[]; // product IDs included in this combo
  variants: Variant[];
  relatedProducts: string[]; // product IDs
  upsellProducts: string[]; // "Buy More Save More" product IDs
  certifications: string[]; // cruelty-free | vegan | no-parabens | etc.
  rating: number; // denormalised average, updated by Cloud Function
  reviewCount: number;
  inStock: boolean; // true if any variant has stock > 0
  isFeatured: boolean;
  isCombo: boolean;
  isActive: boolean; // soft-delete / draft toggle
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  sortOrder: number; // manual sort for admin
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Variant {
  id: string;
  label: string; // "10ml" | "20ml" | "Pack of 2"
  price: number;
  compareAtPrice?: number; // strike-through price
  sku: string;
  stock: number; // updated by inventory system
  reservedStock: number; // stock held by pending orders
  weight: number; // grams — required for Shiprocket
  dimensions?: { l: number; b: number; h: number }; // cm
  isDefault: boolean;
}

interface Ingredient {
  name: string;
  benefit: string;
  icon?: string; // optional Firebase Storage URL
}

interface FAQ {
  question: string;
  answer: string;
}

// i18n: When translations are active the following Product fields use LocalizedString instead of string:
// name, tagline, shortDescription, description, benefits[], howToUse[],
// faqs[].question, faqs[].answer, ingredients[].benefit
// See lib/i18n.ts → LocalizedString + getLocalizedValue()
```

### Inventory

```ts
// /inventory/{productId}
interface InventoryDoc {
  productId: string;
  variants: {
    [variantId: string]: {
      stock: number;
      reservedStock: number;
      lowStockThreshold: number; // trigger alert below this
      reorderPoint: number;
    };
  };
  updatedAt: Timestamp;
}

// /inventory/{productId}/movements/{movementId}
interface StockMovement {
  id: string;
  variantId: string;
  type: "stock_in" | "sale" | "return" | "adjustment" | "reserved" | "released";
  quantity: number; // positive = in, negative = out
  referenceId?: string; // orderId, purchaseOrderId, etc.
  note?: string;
  performedBy: string; // userId (admin) or "system"
  createdAt: Timestamp;
}
```

### Order

```ts
interface Order {
  id: string;
  orderNumber: string; // human-readable: LH-2026-00001
  userId: string;
  guestEmail?: string; // for guest checkout
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;

  // Pricing
  subtotal: number;
  discount: number;
  couponCode?: string;
  couponType?: "percentage" | "flat";
  couponValue?: number;
  shippingCharge: number;
  codFee: number; // ₹50 if COD
  total: number;

  // Payment
  paymentMethod: "whatsapp" | "razorpay" | "cod";
  paymentStatus:
    | "pending_whatsapp"    // customer chose WhatsApp — awaiting proof
    | "proof_submitted"     // customer sent proof, admin needs to confirm
    | "pending"             // COD — pending delivery
    | "paid"                // confirmed by admin (WhatsApp) or gateway callback
    | "failed"
    | "refunded"
    | "partially_refunded";
  paymentId?: string;              // Razorpay transaction ID (if applicable)
  paymentSignature?: string;       // HMAC for Razorpay verification
  whatsappProofImageUrl?: string;  // Firebase Storage URL of payment screenshot (if submitted)
  whatsappConfirmedBy?: string;    // admin userId who confirmed WhatsApp payment
  whatsappConfirmedAt?: Timestamp;

  // Order Status
  orderStatus:
    | "draft" // cart → checkout started
    | "pending" // order placed, payment pending (COD)
    | "confirmed" // payment received
    | "processing" // being packed
    | "ready_to_ship" // packed, awaiting pickup
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "return_requested"
    | "return_picked_up"
    | "refunded";

  // Shipping
  shippingMode: "standard" | "express" | "same_day"; // same-day for Mumbai
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  awbCode?: string;
  courierName?: string;
  courierTrackingUrl?: string;
  estimatedDeliveryDate?: Timestamp;
  deliveredAt?: Timestamp;
  manualShipping?: boolean; // true if admin bypassed Shiprocket
  manualCourierName?: string;
  manualAwbCode?: string;

  // Return / Refund
  returnReason?: string;
  returnImages?: string[]; // Firebase Storage URLs
  refundAmount?: number;
  refundId?: string;
  refundNote?: string;

  // Notes
  customerNote?: string;
  adminNote?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface OrderItem {
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

// /orders/{orderId}/timeline/{eventId}
interface OrderEvent {
  status: string;
  description: string;
  location?: string; // courier scan locations
  source: "system" | "shiprocket" | "admin";
  createdAt: Timestamp;
}

interface Address {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}
```

### Coupon

```ts
interface Coupon {
  code: string; // primary key (uppercase)
  description: string;
  type: "percentage" | "flat" | "free_shipping" | "buy_x_get_y";
  value: number; // percentage (0-100) or flat ₹ amount
  minOrderValue?: number; // minimum cart value to apply
  maxDiscount?: number; // cap for percentage coupons
  applicableTo: "all" | "category" | "product" | "combo";
  applicableIds?: string[]; // category/product IDs if scoped

  // Usage limits
  usageLimit?: number; // total uses allowed (null = unlimited)
  usageLimitPerUser?: number; // per-user limit (typically 1 for first-order codes)
  usedCount: number;

  // Validity
  startsAt: Timestamp;
  expiresAt?: Timestamp; // null = no expiry
  isActive: boolean;

  // Buy X Get Y
  buyQuantity?: number;
  getQuantity?: number;
  getProductId?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// /couponUsage/{usageId}
interface CouponUsage {
  couponCode: string;
  userId: string;
  orderId: string;
  discountApplied: number;
  usedAt: Timestamp;
}
```

### Review

```ts
interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId?: string; // link to verified purchase
  isVerifiedPurchase: boolean;

  rating: number; // 1–5
  title?: string;
  body: string;
  images?: string[]; // customer-uploaded photos (Firebase Storage)
  videoUrl?: string;

  // Moderation
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  moderatedBy?: string; // admin userId
  moderatedAt?: Timestamp;

  // Admin reply
  adminReply?: string;
  adminRepliedAt?: Timestamp;

  // Helpfulness
  helpfulCount: number;
  reportCount: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// /reviewFlags/{flagId}
interface ReviewFlag {
  reviewId: string;
  reportedBy: string;
  reason: "spam" | "offensive" | "fake" | "irrelevant" | "other";
  note?: string;
  createdAt: Timestamp;
}
```

### Support Ticket

```ts
interface SupportTicket {
  id: string;
  ticketNumber: string; // LH-TKT-00001
  userId?: string; // null for guests
  guestEmail?: string;
  orderId?: string;

  subject: string;
  category:
    | "order"
    | "shipping"
    | "product"
    | "return"
    | "payment"
    | "consultation"
    | "other";
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
  assignedTo?: string; // admin userId

  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
}

// /supportTickets/{ticketId}/messages/{messageId}
interface TicketMessage {
  senderType: "customer" | "admin";
  senderId: string;
  body: string;
  attachments?: string[]; // Firebase Storage URLs
  createdAt: Timestamp;
}
```

### Consultation Booking

```ts
interface ConsultationBooking {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  concern: string[]; // from checkboxes on the form
  preferredDate: string;
  preferredTime: string;
  message?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  adminNote?: string;
  createdAt: Timestamp;
}
```

---

## Inventory Management System

### Stock Lifecycle

```
Supplier/Purchase
     ↓
stock_in movement recorded                    (admin panel)
     ↓
Product variant stock updated                 (Firestore atomic increment)
     ↓
Customer adds to cart
     ↓
reserved movement on checkout initiation      (prevents overselling)
     ↓
Payment success → sale movement
released movement removed
     ↓
Payment fail / timeout (15 min) → release reservation
     ↓
Return approved → return movement
stock restored
```

### Admin Inventory UI

- **Stock Overview** table: all products × variants, colour-coded by stock level
  - Red = 0 (out of stock)
  - Amber = below `lowStockThreshold`
  - Green = healthy
- **Low Stock Alerts**: Cloud Function checks daily, sends email to admin
- **Stock Adjustment**: admin can add/remove manually with a note (damaged, lost, gift sample)
- **Stock Ledger**: per-variant history of all movements with timestamps + reasons
- **Bulk Import**: CSV upload to update stock across all variants at once
- **Reorder Trigger**: `reorderPoint` field — when stock drops below, system flags it

---

## Order Management System

### Admin Order List

| Feature              | Detail                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------- |
| Filter by status     | pending, confirmed, processing, shipped, delivered, cancelled, return_requested, refunded |
| Filter by payment    | paid, pending, COD, failed                                                                |
| Filter by shipping   | Shiprocket, manual                                                                        |
| Filter by date range | between any two dates                                                                     |
| Search               | order number, customer name, email, phone, AWB code                                       |
| Bulk actions         | Mark as confirmed, Mark as processing, Export CSV                                         |
| Sort                 | newest, oldest, highest value                                                             |

### Admin Order Detail

- Full order summary: items, pricing breakdown, coupon applied
- Customer info + address
- **Status updater**: dropdown to change order status with optional admin note, logged to timeline
- **WhatsApp Payment Confirm button**: appears when `paymentStatus === "proof_submitted"` or `"pending_whatsapp"` — admin clicks → sets `paymentStatus: "paid"`, records `whatsappConfirmedBy` + timestamp, triggers order confirmation email
- **Payment proof viewer**: shows submitted screenshot inline (if customer uploaded it), plus WhatsApp conversation deep-link button
- **Ship with Shiprocket**: one-click button that calls Shiprocket API → gets AWB + courier
- **Manual Shipping override**: enter courier name + AWB when Shiprocket fails
- **Pincode serviceability check**: inline check before shipping
- **Refund**: enter partial/full refund amount → for WhatsApp orders, records manual refund note; for Razorpay, calls gateway API
- **Timeline**: full history of status changes with source (system / shiprocket webhook / admin / whatsapp)
- **Internal notes**: admin-only notes visible only in admin panel
- **Invoice download**: auto-generated PDF
- **Resend order confirmation email**: button for support cases
- **Initiate return**: when customer requests it → triggers return pickup with Shiprocket

### Customer Order View (`/account/orders/[id]`)

- Order summary + invoice PDF download link
- **Live tracking timeline**: synced from Shiprocket webhook events stored in `/timeline`
- Tracking map / courier link
- Return request button (within 3-day window for damaged/defective only)
- Reorder button

---

## Shipping System

### Domestic India

| Mode                   | SLA               | Cost                             |
| ---------------------- | ----------------- | -------------------------------- |
| Standard               | 5-7 business days | Free above ₹999, else ₹80        |
| Express                | 2-3 business days | Additional charge by weight+zone |
| Same Day (Mumbai only) | Same day          | Additional charge                |
| COD                    | Standard SLA      | +₹50 COD fee                     |

**Processing time**: 1-2 business days. Orders placed on weekends/holidays → next business day.

### International

- Enabled via Shiprocket International
- SLA: 8-12 business days
- Threshold: Free above $120 USD / ₹10,000 (some countries excluded)

### Shiprocket Integration Flow

```
1. Order placed (payment success / COD confirmed)
         ↓
2. Server Action: POST /api/shiprocket/token   (JWT cached in Redis/Firestore, valid 24h)
         ↓
3. Server Action: POST /api/shiprocket/create-order
   → Payload: items (name, sku, units, price), addresses, weight, dimensions
   → Response: shiprocket_order_id, shipment_id, courier recommendation
         ↓
4. (Optional) Courier assignment: if auto-assignment off, admin picks courier in admin panel
         ↓
5. AWB generated → stored in order doc
         ↓
6. Shiprocket webhook (POST /api/shiprocket/webhook)
   → Validates HMAC signature
   → Writes to /orders/{id}/timeline
   → Updates top-level orderStatus
   → Sends customer notification (email + optional WhatsApp)
         ↓
7. Customer tracks via /track?awb=XXX  or  /account/orders/[id]
```

### Pincode Serviceability Check

- On checkout address entry: `POST /api/pincode-check` → Shiprocket serviceability API
- Shows ETA + availability of COD for that pincode
- Blocks order if pincode unserviceable; suggests alternative options

### Manual Shipping Fallback

- Admin panel: if Shiprocket is unavailable, enter courier name + AWB manually
- Sets `manualShipping: true` on order doc
- Tracking shows static courier name + link

---

## WhatsApp Payment System

### Why WhatsApp Payments (Primary Method)

- Zero gateway fees (no Razorpay 2% + GST per transaction)
- Works entirely within Firebase Spark + Vercel Hobby — no paid payment gateway needed
- Admin has full control: manually confirm after viewing proof
- Common and trusted for small Indian D2C brands

### Customer Flow

```
1. Customer selects "Pay via WhatsApp / UPI" at checkout
         ↓
2. Order created in Firestore:
   paymentMethod: "whatsapp"
   paymentStatus: "pending_whatsapp"
   orderStatus: "draft"
         ↓
3. Customer sees payment instructions page:
   ┌─────────────────────────────────────────┐
   │  Pay ₹X to:                             │
   │  UPI ID: licoriceherbal@upi             │
   │  Or scan QR code                        │
   │                                         │
   │  After paying, WhatsApp us the          │
   │  screenshot + your Order #LH-0001       │
   │  → [Open WhatsApp]                      │
   │                                         │
   │  (Optional) Upload screenshot here ↑   │
   └─────────────────────────────────────────┘
         ↓
4. Customer sends screenshot on WhatsApp to business number
         ↓
5. (Optional) Customer uploads screenshot via "Submit Proof" button
   → stored in Firebase Storage at /payment-proofs/{orderId}.jpg
   → paymentStatus updated to "proof_submitted"
         ↓
6. Admin sees alert on dashboard:
   "3 WhatsApp payments pending confirmation"
         ↓
7. Admin opens order → views proof image → clicks "Confirm Payment"
   → paymentStatus: "paid"
   → orderStatus: "confirmed"
   → whatsappConfirmedBy: adminUserId
   → whatsappConfirmedAt: now
   → Order confirmation email sent via Resend
   → Shiprocket order creation triggered
         ↓
8. Customer receives email: "Your order is confirmed!"
```

### Admin WhatsApp Payment Dashboard Widget

- **Pending WhatsApp Payments** card on admin home — count badge
- Filter on Orders list: `paymentMethod = whatsapp AND paymentStatus IN [pending_whatsapp, proof_submitted]`
- Bulk confirm button for verified payments
- If payment not received after 24h: admin can cancel order (stock reservation released)

### Payment Method Toggle (Admin Settings)

Stored in `/settings/paymentSettings` Firestore doc:

```ts
interface PaymentSettings {
  whatsappEnabled: boolean;           // default: true
  whatsappUpiId: string;              // shown to customer on payment screen
  whatsappBusinessNumber: string;     // pre-filled WhatsApp message target
  whatsappQrImageUrl?: string;        // optional QR code image (Firebase Storage)
  razorpayEnabled: boolean;           // default: false (enable when account ready)
  codEnabled: boolean;                // default: true
  codFee: number;                     // default: 50
  codMinOrder?: number;               // minimum order for COD eligibility
  prepaidDiscountPercent?: number;    // e.g. 5 — "Save 5% on prepaid orders"
}
```

- Checkout page reads this doc (SSR, cached 60s) and renders only enabled methods
- If Razorpay disabled: Razorpay SDK is never loaded (no wasted JS)
- Settings page in admin: toggle switches for each method with instant Firestore update

---

## Coupon System

### Coupon Types

| Type            | Behaviour                                |
| --------------- | ---------------------------------------- |
| `percentage`    | e.g. 10%, capped by `maxDiscount`        |
| `flat`          | e.g. ₹500 off                            |
| `free_shipping` | waives shipping charge                   |
| `buy_x_get_y`   | e.g. Buy 2 get 1 free (specific product) |

### Validation Rules (server-side, in Server Action)

1. Coupon exists and `isActive = true`
2. Current time is between `startsAt` and `expiresAt`
3. Cart total ≥ `minOrderValue`
4. `usedCount < usageLimit` (global)
5. User's usage count < `usageLimitPerUser` (per-user)
6. Cart contains applicable product/category (if scoped)
7. Not combinable with another coupon (one coupon per order)

### Admin Coupon Panel

- List with usage stats (used/limit, revenue impact)
- Create: set all fields with date pickers
- Disable/re-enable toggle
- Export usage log (who used it, when, which order)
- Auto-generate random code button
- Bulk expiry setter

---

## Reviews System

### Customer Review Flow

1. Only authenticated users who have a **delivered** order containing the product can submit
2. Review form: 1-5 star rating, optional title, body (min 20 chars), up to 5 images
3. Review stored with `status: "pending"` — not visible on storefront until approved
4. Admin receives notification of pending review
5. Admin approves/rejects (with reason)
6. On approval: product `rating` + `reviewCount` updated atomically by Cloud Function
7. Admin can reply to approved reviews (reply shown publicly below review)

### Storefront Review Display

- Average rating + star distribution bar (like Amazon/weherbal.in)
- Filter by: star rating, verified purchase, with photos
- Sort by: most recent, most helpful, highest rating, lowest rating
- Pagination / "Load more"
- Verified Purchase badge
- Customer photo gallery (lightbox)
- "Was this helpful?" thumbs up/down
- "Report review" link → creates `reviewFlag`
- Admin reply shown below customer review

### Admin Review Panel

- **Pending queue** (default view)
- Approve / Reject with one click
- Bulk approve
- Rejected reviews show reason to prevent resubmission
- Flag queue: reviews reported by customers
- All reviews searchable by product, rating, date

---

## Order Tracking (Customer-facing)

### `/track` page

- Input: Order ID or AWB number + email for guest lookup
- Shows: full status timeline with icons + dates
- Current status highlight card (e.g. "Out for Delivery")
- Estimated delivery date
- Courier name + external tracking link
- Map integration (optional, phase 2)

### Timeline Events (from Shiprocket webhooks)

```
Order Placed → Payment Confirmed → Processing → Packed → Ready to Ship
→ Picked Up → In Transit → Out for Delivery → Delivered
```

Each event shows: status, timestamp, location (if available from courier scan), source.

---

## Customer Support System

### Support Ticket Features

- Customer can open a ticket from:
  - Account → My Orders → [order] → "Get Help"
  - Contact page form
  - Admin can manually create on behalf of customer
- Ticket categories: Order Issue, Shipping, Product Query, Return/Refund, Payment, Consultation, Other
- Auto-assign ticket number
- Email notification to customer on new ticket + each reply
- Customer can upload images (damaged product screenshots)
- Admin inbox with priority sort and unread count badge
- SLA tracking: highlight tickets open > 24h
- Internal notes (admin-only, not visible to customer)
- Ticket close + satisfaction rating prompt

### Contact Page

- Contact form → creates support ticket
- WhatsApp deep link (`api.whatsapp.com/send?phone=...`)
- Support hours clearly displayed

---

## Free Consultation System

### Booking Flow

1. Customer fills form: name, email, phone, concerns (checkboxes), preferred date/time, message
2. Booking stored in `/consultations` with `status: pending`
3. Admin sees booking in admin → Consultations panel
4. Admin confirms → customer gets email/WhatsApp confirmation with link/time
5. After consultation: admin marks `completed`, can add internal notes
6. Post-consultation: automated email with recommended products (linkable)

### Admin Consultation Panel

- Upcoming bookings calendar / list view
- Status: Pending → Confirmed → Completed / Cancelled
- Filter by date
- Customer history: previous consultations + orders
- Quick link to send product recommendations

---

## Blog / Content System

### Blog Structure

- **Skincare & Ayurveda** category (main blog)
- **Diet & Lifestyle** category (separate section)
- Each post: title, slug, body (rich text), author, category, cover image, tags, published date, SEO fields
- Related products widget at bottom of each post (linkable to product pages)
- Comment section (optional phase 2 — Firebase Firestore backed)

### Admin Blog Panel

- CRUD with Tiptap rich text editor
- Image upload inline (Firebase Storage)
- Draft / Published / Archived status
- Scheduled publishing (set future `publishedAt`)
- SEO fields: meta title, meta description, OG image

---

## Corporate Gifting

### Inquiry Form captures:

- Company name
- Contact person + designation
- Email + phone
- Number of units
- Budget per unit / total
- Delivery date required
- Custom branding requirement (yes/no)
- Message / product preferences

Stored in `/corporateInquiries`, admin gets email notification, can respond via support ticket.

---

## Product Detail Page Sections

Based on weherbal.in product pages, each product page includes:

1. **Image Gallery** — zoomable, multi-photo, thumbnail strip, up to 8 images
2. **Title + Brand + Rating summary** (stars + review count, links to review section)
3. **Price** — sale price + compare-at (strike-through) + savings badge
4. **Variant Selector** — size/pack options (e.g. 10ml | 20ml)
5. **Quantity Selector**
6. **Add to Cart + Buy Now buttons**
7. **Product Badges** — No Artificial Chemicals | Cruelty Free | Ayurvedic | Paraben Free
8. **EMI / Pay Later widget** (Snapmint or Razorpay EMI — optional)
9. **Active Promo banners** — e.g. "5% off on prepaid orders", coupon codes
10. **Buy More Save More** — upsell products with bundled discount
11. **Tabbed content section**:
    - Key Benefits (bullet points)
    - Ingredients (with individual ingredient benefits)
    - How To Use (numbered steps)
    - FAQs (accordion)
12. **About the product** — extended description
13. **Certifications row** — icon badges
14. **Customer Reviews** — full review section (see Reviews System)
15. **Related Products** carousel

---

## Shop by Concern (Collections)

Based on weherbal.in collections, these concern pages are required:

| Concern                | URL                             |
| ---------------------- | ------------------------------- |
| Anti-Ageing            | `/concern/anti-ageing`          |
| Blemishes & Dark Spots | `/concern/blemishes-dark-spots` |
| Pigmentation & Melasma | `/concern/pigmentation-melasma` |
| Acne & Pimples         | `/concern/pimples-open-pores`   |
| Brightening            | `/concern/brightening`          |
| Tanning                | `/concern/tanning`              |
| Dryness & Dull Skin    | `/concern/dryness`              |
| Hair Fall & Dandruff   | `/concern/hair-care`            |

Each concern page = filtered product grid + concern description header.

---

## Admin Dashboard (Overview Stats)

| Widget                                 | Data                                       |
| -------------------------------------- | ------------------------------------------ |
| Revenue today / this week / this month | Sum of paid orders                         |
| Orders today                           | Count + status breakdown donut chart       |
| Pending orders                         | Needs processing alert                     |
| Low stock alerts                       | Products below threshold                   |
| Pending reviews                        | Needs moderation count                     |
| Open support tickets                   | Needs response count                       |
| Consultation bookings today            | Count                                      |
| Top products (last 30 days)            | By revenue / units sold                    |
| Recent orders list                     | Latest 10 orders with quick status buttons |
| Coupon usage                           | Active coupons + redemption rates          |
| Newsletter signups (last 7 days)       | Growth trend                               |

---

## Component Architecture

### Theme System

All colours, fonts, spacing tokens live in `constants/theme.ts` → referenced by `globals.css` CSS variables → used in `tailwind.config.ts`. Swap theme in one file; everything updates.

```
constants/
├── theme.ts          → color tokens, font names, spacing, radius
├── site.ts           → brand name (Licorice Herbals), tagline, contact, social links, nav items
├── policies.ts       → free-shipping threshold, COD fee, return window, processing days
└── categories.ts     → product categories + concern definitions

messages/
├── en.json           → English UI strings (required baseline — 100% complete)
├── hi.json           → Hindi UI strings
└── mr.json           → Marathi UI strings

lib/
├── i18n.ts           → LocalizedString type, getLocalizedValue() helper, supported locales array
├── db.ts             → unified data-access layer (Firestore with automatic mock fallback)
└── mocks/            → in-memory seed data, identical TypeScript types as live Firestore data
    ├── index.ts      → SEED_MAP: Record<collection, SeedDoc[]> — used by seed API and db.ts fallback
    ├── products.ts
    ├── categories.ts
    ├── concerns.ts
    ├── reviews.ts
    ├── coupons.ts
    ├── blogs.ts
    └── settings.ts
```

### Component Tree

```
components/
├── ui/               ← Design-system primitives (100% reusable)
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Textarea.tsx
│   ├── Modal.tsx
│   ├── Drawer.tsx
│   ├── Skeleton.tsx
│   ├── StarRating.tsx
│   ├── CountdownTimer.tsx
│   ├── SectionHeading.tsx
│   ├── Pagination.tsx
│   ├── ImageLightbox.tsx
│   ├── Breadcrumb.tsx
│   └── StatusBadge.tsx           ← order/ticket/review status colours
│
├── layout/
│   ├── Navbar.tsx
│   ├── MobileMenu.tsx
│   ├── Footer.tsx
│   ├── AnnouncementBar.tsx
│   ├── CartDrawer.tsx
│   └── LanguageSwitcher.tsx      ← EN / हिं / मर dropdown, persists to cookie
│
├── home/
│   ├── HeroBanner.tsx
│   ├── ProductCarousel.tsx
│   ├── CategoryGrid.tsx
│   ├── BeforeAfterSlider.tsx
│   ├── BrandValues.tsx           ← trust icons row
│   ├── TestimonialsCarousel.tsx
│   ├── BlogPreview.tsx
│   └── NewsletterBanner.tsx
│
├── product/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductFilters.tsx
│   ├── ProductSort.tsx
│   ├── ProductImages.tsx
│   ├── ProductInfo.tsx
│   ├── VariantSelector.tsx
│   ├── QuantitySelector.tsx
│   ├── ProductBadges.tsx
│   ├── BuyMoreSaveMore.tsx
│   ├── ProductTabs.tsx           ← Benefits / Ingredients / How To Use / FAQs
│   ├── RelatedProducts.tsx
│   ├── ReviewCard.tsx
│   ├── ReviewsList.tsx
│   ├── ReviewFilters.tsx
│   ├── ReviewPhotoGallery.tsx
│   └── AddReviewForm.tsx
│
├── cart/
│   ├── CartItem.tsx
│   ├── CartSummary.tsx
│   └── CouponInput.tsx
│
├── checkout/
│   ├── CheckoutStepper.tsx
│   ├── AddressForm.tsx
│   ├── AddressList.tsx
│   ├── ShippingOptions.tsx             ← standard / express / same-day
│   ├── PincodeChecker.tsx
│   ├── PaymentOptions.tsx              ← renders only methods enabled in /settings/paymentSettings
│   ├── WhatsAppPaymentInstructions.tsx ← shown after order placed via WhatsApp method
│   ├── WhatsAppProofUpload.tsx         ← optional: customer uploads screenshot
│   └── OrderSummary.tsx
│
├── account/
│   ├── OrderCard.tsx
│   ├── OrderTimeline.tsx         ← tracking timeline steps
│   ├── AddressCard.tsx
│   └── WishlistItem.tsx
│
├── blog/
│   ├── BlogCard.tsx
│   ├── BlogContent.tsx
│   └── RelatedPosts.tsx
│
├── support/
│   ├── TicketCard.tsx
│   └── TicketThread.tsx
│
└── admin/                        ← Admin-only components
    ├── StatsCard.tsx
    ├── DataTable.tsx                   ← reusable sortable/filterable table
    ├── OrderStatusSelect.tsx
    ├── WhatsAppPaymentConfirm.tsx      ← "Confirm Payment" button + proof image viewer
    ├── PaymentMethodToggle.tsx         ← enable/disable WhatsApp / Razorpay / COD
    ├── InventoryRow.tsx
    ├── StockAdjustModal.tsx
    ├── ShipOrderModal.tsx              ← Shiprocket / manual shipping
    ├── RefundModal.tsx
    ├── ReviewModerationCard.tsx
    ├── CouponForm.tsx
    ├── ProductForm.tsx                 ← full product create/edit form
    ├── VariantManager.tsx
    ├── RichTextEditor.tsx              ← Tiptap wrapper
    ├── ImageUploader.tsx               ← Firebase Storage drag-and-drop
    ├── TicketInbox.tsx
    └── ConsultationCard.tsx
```

---

## Shipping Logic (constants/policies.ts)

```
Domestic Orders:
  freeShippingThreshold: ₹999
  standardShippingRate: ₹80
  codFee: ₹50
  expressAvailable: true (WhatsApp order for now, or Shiprocket express)
  sameDayAvailable: true (Mumbai pincodes only)
  processingDays: 1-2
  standardSLA: "5-7 business days"
  expressSLA: "2-3 business days"

International Orders:
  freeShippingThreshold: $120 USD / ₹10,000
  excludedCountries: ["CA", "ZA", "NP", "BD", "LK"]
  internationalSLA: "8-12 business days"

Refund Policy:
  returnWindow: 3           (days from delivery)
  returnEligibility: "damaged_defective_wrong_expired_only"
  replacementSLA: 24        (hours after return received)
```

---

### Environment Variables Needed

```env
# Firebase (Spark — free tier, no Blaze required)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=          # server-side service account
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Shiprocket
SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
SHIPROCKET_CHANNEL_ID=
SHIPROCKET_WEBHOOK_SECRET=

# Payments — Razorpay is optional (can be disabled in admin settings)
RAZORPAY_KEY_ID=                    # leave empty if not using Razorpay
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# WhatsApp Payment
NEXT_PUBLIC_WHATSAPP_PAYMENT_NUMBER= # business WhatsApp number for payment (e.g. 919999999999)
NEXT_PUBLIC_WHATSAPP_PAYMENT_UPI=    # UPI ID shown to customer on WhatsApp payment screen

# Email (Resend free tier = 3,000 emails/month)
RESEND_API_KEY=
RESEND_FROM_EMAIL=                  # e.g. orders@licoriceherbal.in

# App
NEXT_PUBLIC_APP_URL=
ADMIN_EMAILS=                       # comma-separated admin email addresses
```

---

## What Needs to Come From You

- [x] Brand logo — **provided** (LICORICÉ, deep indigo, botanical/butterfly motif)
- [x] Colour palette — **extracted from logo** (see Brand & Theme section above)
- [ ] Font confirmation — default plan: Cormorant Garamond (heading) + Inter (body)
- [ ] Product catalogue (names, prices, images, descriptions, variants)
- [ ] Translations — Hindi and Marathi for product names, descriptions, benefits, FAQs, blog posts (English is the required baseline; other locales are optional at launch and can be added progressively via the admin product form's EN | HI | MR tab strip)
- [ ] Contact details (customer support phone + email)
- [ ] WhatsApp business number for payments (+ UPI ID to show customers)
- [ ] Social media handles (Instagram, Facebook, YouTube, LinkedIn)
- [ ] Razorpay account credentials (optional — can launch WhatsApp + COD only)
- [ ] Firebase project credentials (create at console.firebase.google.com, Spark plan)
- [ ] Shiprocket account credentials
- [ ] Domain name
- [ ] Free shipping threshold (default: ₹999)
- [ ] COD preference (default: enabled, +₹50 fee)
- [ ] Return/refund policy (default: 3 days, damaged/defective only)
- [ ] Support hours (default: Mon–Sat 9:30am–6:30pm IST)
- [ ] Consultant name + bio (for free consultation page)
- [ ] Corporate gifting: launch from day 1 or phase 2?
- [ ] Translations — Hindi + Marathi for product names, descriptions, benefits, FAQs (English is the required baseline; other locales are optional at launch and can be added progressively)

---

## Seed Data

All seed data is branded as **Licorice Herbals** (no weherbal references anywhere). English is the baseline; Hindi/Marathi translations for seed content are added in Phase 8.

### Deterministic IDs

Every seed document uses a stable, human-readable ID so upserts are idempotent and deletes are surgical (only seed-owned IDs are ever touched):

| Collection | Example Seed IDs |
| ---------- | ---------------- |
| `products` | `prod_kumkumadi_oil`, `prod_brightening_ubtan`, `prod_hair_repair_oil`, … |
| `categories` | `cat_face`, `cat_body`, `cat_hair`, `cat_powder`, `cat_combo` |
| `concerns` | `concern_acne`, `concern_pigmentation`, `concern_brightening`, … |
| `coupons` | `WELCOME10`, `LICORICE20`, `FREESHIP` |
| `blogs` | `blog_kumkumadi_benefits`, `blog_ubtan_guide`, `blog_ayurvedic_hair` |
| `reviews` | `rev_kumkumadi_1`, `rev_kumkumadi_2`, `rev_vitc_1`, … |
| `inventory` | same ID as product (`prod_kumkumadi_oil`, …) |
| `settings` | `siteConfig`, `shippingRules`, `paymentSettings` (fixed well-known IDs) |

### Seed Products (9 — inspired by weherbal.in product range, all Licorice-branded)

| ID | Name | Category | Concerns | Variants |
| -- | ---- | -------- | -------- | -------- |
| `prod_kumkumadi_oil` | Licorice Kumkumadi Face Oil | face | brightening, anti-ageing, pigmentation | 10 ml / 20 ml |
| `prod_brightening_ubtan` | Licorice Brightening Ubtan | powder | brightening, tanning, pigmentation | 50 g / 100 g |
| `prod_hair_repair_oil` | Licorice Hair Repair & Growth Oil | hair | hair-care | 100 ml / 200 ml |
| `prod_neem_face_wash` | Licorice Neem & Tulsi Face Wash | face | acne | 100 ml |
| `prod_vitamin_c_serum` | Licorice 20% Vitamin C Serum | face | brightening, pigmentation | 15 ml / 30 ml |
| `prod_under_eye_elixir` | Licorice Under Eye Elixir | face | anti-ageing, dryness | 10 ml |
| `prod_spf50_sunscreen` | Licorice Daily Sunscreen SPF50 | face | tanning | 50 g |
| `prod_body_butter` | Licorice Hydrating Body Butter | body | dryness | 100 g / 200 g |
| `prod_glow_bundle` | Licorice Glow Bundle | combo | brightening, anti-ageing | fixed combo (Kumkumadi Oil 10 ml + Vitamin C Serum 15 ml) |

### Seed Concerns (8)

`concern_anti_ageing` · `concern_pigmentation` · `concern_acne` · `concern_brightening` · `concern_tanning` · `concern_dryness` · `concern_hair_care` · `concern_blemishes`

### Seed Coupons (3)

| Code | Type | Value | Min Order | Notes |
| ---- | ---- | ----- | --------- | ----- |
| `WELCOME10` | percentage | 10% | ₹500 | First-order; 1 use per user |
| `LICORICE20` | flat | ₹200 | ₹999 | Recurring promo |
| `FREESHIP` | free_shipping | — | ₹500 | Waives shipping charge |

### Seed Blog Posts (3)

| ID | Title (EN) | Category |
| -- | ---------- | -------- |
| `blog_kumkumadi_benefits` | 7 Reasons Kumkumadi Oil Is Ayurveda's Best-Kept Secret | skincare |
| `blog_ubtan_guide` | How to Use Ubtan for Glowing Skin at Home | skincare |
| `blog_ayurvedic_hair` | The Ayurvedic Guide to Healthy, Strong Hair | hair-care |

### Seed Reviews (6 — 2 per flagship product, all approved)

| ID | Product | Rating | Verified Purchase |
| -- | ------- | ------ | ----------------- |
| `rev_kumkumadi_1` | prod_kumkumadi_oil | 5 | true |
| `rev_kumkumadi_2` | prod_kumkumadi_oil | 4 | true |
| `rev_ubtan_1` | prod_brightening_ubtan | 5 | true |
| `rev_ubtan_2` | prod_brightening_ubtan | 4 | false |
| `rev_vitc_1` | prod_vitamin_c_serum | 5 | true |
| `rev_vitc_2` | prod_vitamin_c_serum | 4 | true |

---

## Firebase Fallback / Mock Layer

### Purpose

If Firebase env vars are absent or Firestore is unreachable (fresh clone, CI, no internet), the app falls back to the in-memory seed data instead of crashing. The fallback is transparent — every component gets the same TypeScript types regardless of data source.

### Unified Data-Access Layer (`lib/db.ts`)

```ts
// lib/db.ts — all Server Components and Server Actions import from here, never from Firestore directly
export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  if (!isFirebaseReady()) return filterMockProducts(SEED_PRODUCTS, filters);
  try {
    const snap = await getDocs(buildProductQuery(filters));
    return snap.docs.map(d => d.data() as Product);
  } catch (err) {
    console.warn('[db] Firestore error — falling back to mock data', err);
    return filterMockProducts(SEED_PRODUCTS, filters);
  }
}

function isFirebaseReady(): boolean {
  // Force mock mode with env var (useful for UI-only development)
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return false;
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  );
}
```

- `NEXT_PUBLIC_USE_MOCK_DATA=true` forces mock mode without touching Firebase config
- Mock data has identical TypeScript types — no drift possible
- Same pattern repeated for `getProduct()`, `getOrders()`, `getCoupons()`, `getBlogs()`, etc.

### When Mock Data Is Used

| Scenario | Behaviour |
| -------- | --------- |
| No Firebase env vars | Silently serves mock data |
| `NEXT_PUBLIC_USE_MOCK_DATA=true` | Forces mock data even if Firebase is configured |
| Firestore read throws | Catches error, falls back to mock, logs warning |
| Production with valid Firebase | Never uses mocks |

---

## Dev Seed Page (`/dev/seed`)

### Purpose

Browser-based tool (development only) to populate or wipe Firestore with known seed data in one click. Useful for setting up a fresh Firebase project, resetting test state, or onboarding new developers.

### Security

- `middleware.ts` matches `/dev/*` and returns `NextResponse.next()` only in `development`; returns 404 in `production` and `test`
- No authentication required in development
- The API routes (`/api/dev/seed`, `/api/dev/unseed`) also check `process.env.NODE_ENV === 'production'` and return 404 — double guard

### Page UI

```
┌──────────────────────────────────────────────────────────────┐
│  🌱 Licorice Herbals — Seed Database           [Dev Only]    │
│                                                              │
│  Collection         Docs    Actions                          │
│  ─────────────────────────────────────────                   │
│  Products             9     [Seed ↑]  [Delete ✕]            │
│  Categories           5     [Seed ↑]  [Delete ✕]            │
│  Concerns             8     [Seed ↑]  [Delete ✕]            │
│  Coupons              3     [Seed ↑]  [Delete ✕]            │
│  Blog Posts           3     [Seed ↑]  [Delete ✕]            │
│  Reviews              6     [Seed ↑]  [Delete ✕]            │
│  Settings             3     [Seed ↑]  [Delete ✕]            │
│  Inventory            9     [Seed ↑]  [Delete ✕]            │
│                                                              │
│  [Seed All Collections]    [Delete All Seed Data]            │
│                                                              │
│  ✅ Last action: Seeded 9 products — 2026-03-07 10:05 IST    │
└──────────────────────────────────────────────────────────────┘
```

### API Routes

```
app/api/dev/
├── seed/route.ts     → POST { collections: string[] } — upserts seed docs by known ID
└── unseed/route.ts   → POST { collections: string[] } — deletes seed docs by known ID
```

### Upsert (idempotent — safe to run repeatedly)

```ts
// app/api/dev/seed/route.ts
export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response('Not found', { status: 404 });
  const { collections } = await req.json();
  for (const col of collections) {
    const docs = SEED_MAP[col];   // e.g. SEED_PRODUCTS from lib/mocks/products.ts
    const batch = writeBatch(db);
    docs.forEach(d => {
      batch.set(doc(db, col, d.id), { ...d, _seeded: true }); // set (not merge) — clean upsert
    });
    await batch.commit();
  }
  return Response.json({ ok: true });
}
```

### Delete (surgical — only known seed IDs)

```ts
// app/api/dev/unseed/route.ts
export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response('Not found', { status: 404 });
  const { collections } = await req.json();
  for (const col of collections) {
    const ids = SEED_MAP[col].map(d => d.id); // only the exact seed doc IDs
    const batch = writeBatch(db);
    ids.forEach(id => batch.delete(doc(db, col, id))); // never deletes non-seed documents
    await batch.commit();
  }
  return Response.json({ ok: true });
}
```

> **Safety**: Delete only targets the exact IDs defined in `lib/mocks/`. Documents with any other ID — including real customer data — are never touched, even if the route is called in a shared staging environment.

---

## Development Phases

### Phase 1 — Foundation

- Next.js + Tailwind + Firebase setup
- `constants/theme.ts`, `constants/site.ts`, `constants/policies.ts`, `constants/categories.ts`
- **i18n setup**: install next-intl, create `app/[locale]/` route group, configure `middleware.ts` locale detection, scaffold `messages/en.json` with all namespaces, add `LanguageSwitcher` to Navbar
- **Mock / seed layer**: implement `lib/db.ts` unified data-access layer with Firebase fallback, write all seed data in `lib/mocks/`, build `/dev/seed` page with upsert + delete by known IDs, scaffold `/api/dev/seed` and `/api/dev/unseed` routes
- Layout: Navbar, Footer, AnnouncementBar, CartDrawer
- Auth: Login, Register, Google OAuth
- Home page skeleton with all section placeholders

### Phase 2 — Product Catalogue

- Product listing + filtering by category + concern
- Product detail page (all tabs: benefits, ingredients, how to use, FAQs)
- Firestore product CRUD in admin
- Image upload to Firebase Storage
- Inventory system (stock tracking per variant)

### Phase 3 — Commerce & Payments

- Cart (Zustand + Firestore sync when logged in)
- Wishlist (Firestore)
- Checkout flow: Address → Pincode check → Shipping mode → Payment
- **WhatsApp Payment flow** (primary):
  - Order created with `paymentStatus: "pending_whatsapp"`
  - Customer shown UPI ID + WhatsApp number + order amount
  - Customer optionally uploads screenshot (stored in Firebase Storage)
  - Admin sees pending WhatsApp orders in dashboard queue
  - Admin clicks "Confirm Payment" → `paymentStatus: "paid"` → order proceeds
- **Razorpay integration** (optional, admin-togglable): HMAC verification in API route
- **COD** (admin-togglable, +₹50 fee)
- **Payment Method Toggle** in admin settings — all three switchable on/off independently
- Order creation in Firestore with inventory deduction (Firestore transaction)
- Coupon system (all types, all validation rules)
- Guest checkout
- Order confirmation email via Resend

### Phase 4 — Shipping & Order Management

- Shiprocket API integration (create order, track, cancel)
- Shiprocket webhook → order timeline updates
- Manual shipping fallback in admin
- Order tracking page (guest + logged-in)
- Return request flow
- Refund trigger

### Phase 5 — Reviews & Trust

- Review submission (verified purchase only)
- Admin moderation queue
- Review display (filters, photos, helpful votes, admin replies)
- Rating aggregation Cloud Function

### Phase 6 — Support & Consultation

- Support ticket system (customer + admin)
- Email notifications for tickets
- Free consultation booking form
- Admin consultation panel
- Corporate gifting inquiry form

### Phase 7 — Content

- Blog (Firestore + admin Tiptap editor)
- Diet & Lifestyle section
- Before/After image management (admin upload, storefront display)
- Newsletter signup + subscriber management

### Phase 8 — Polish & Launch

- SEO: metadata, sitemap.xml, robots.txt, OG images per page
- Performance: Next.js Image optimisation, lazy loading, bundle splits
- Firebase Analytics (Spark — free) or GA4 via gtag
- Admin dashboard charts (Revenue, Orders, Stock alerts) — all computed from Firestore reads, no Cloud Functions
- PWA manifest + icons
- Deploy to Vercel Hobby + connect custom domain
- Security audit: Firestore security rules, API route auth checks (`verifyIdToken`), Zod input sanitisation on all routes
- Vercel hobby timeout audit: ensure all API routes complete within 10 seconds
