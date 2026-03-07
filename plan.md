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

### Product Packaging (confirmed from Keshli photo)

The Keshli Hair Care Tablet bottle confirms the production visual identity:
- **Label background**: deep indigo `#2B1A6B` — exact match to `primary` token
- **Typography**: bold gold serif for product name, italic gold script for sub-label — matches `accent` token `#C9B99A`
- **Logo placement**: top-centre, white L-with-leaves-butterfly emblem on label
- **Gold border strips**: top and bottom of label — use `accent` colour as decorative rule
- **Botanical illustrations**: white line-art herbs, flowers, and a profile illustration of a woman with flowing hair
- **Label layout**: brand → product name → category sub-label → illustration → formulation type + count

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

> **Confirmed deployment target**: Firebase **Spark** (free tier) + **Vercel Hobby** (free). No Blaze upgrade, no Cloud Functions. All background logic runs as Next.js API routes or Server Actions on Vercel.

### Spark (Free) quotas:

- Firestore: 1 GiB storage, 50k reads/day, 20k writes/day
- Auth: Unlimited
- Storage: 5 GB, 1 GB/day download
- Hosting: 10 GB/month (unused — hosting is on Vercel)

### Vercel Hobby constraints:

- Serverless function timeout: **10 seconds** (all API routes must complete within this)
- Bandwidth: 100 GB/month
- No native cron — scheduled tasks (e.g. low-stock alerts) triggered on-demand via admin dashboard
- Auto-deploy from `main` branch on GitHub

### Cloud Function → Server Action / API Route mapping:

| Previously a Cloud Function | Replaced with |
| --------------------------- | ------------- |
| Shiprocket webhook receiver | `POST /api/shiprocket/webhook` (Next.js API route) |
| Order confirmation email    | `POST /api/order-confirm` (called after payment confirmed) |
| Review rating aggregation   | Server Action in approve-review flow (reads approved reviews, computes average, writes back) |
| Low-stock alert email       | Computed on admin dashboard load; admin triggers email manually |
| Coupon expiry cleanup       | Firestore query at coupon validation time (`expiresAt < now`) — no background job needed |
| Shiprocket JWT refresh      | Cached in Firestore with 24h TTL; refreshed lazily on first request after expiry |

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
  category: ProductCategory; // face | body | hair | powder | combo | supplements
  concerns: string[]; // acne | pigmentation | dryness | anti-ageing | brightening | tanning
  comboItems?: string[]; // product IDs included in this combo
  variants: Variant[];
  relatedProducts: string[]; // product IDs
  upsellProducts: string[]; // "Buy More Save More" product IDs
  certifications: string[]; // cruelty-free | vegan | no-parabens | etc.
  rating: number; // denormalised average — updated by Server Action when admin approves a review
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
- **Low Stock Alerts**: computed on admin dashboard load; admin can trigger a summary email from the dashboard (no Cloud Functions — Spark tier)
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

> **Currency**: All transactions are in **INR (₹)** only. International shipping is out of scope for the current launch — domestic India only.

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
6. On approval: product `rating` + `reviewCount` updated by the approve-review Server Action (reads all approved reviews for the product, computes average, writes back — no Cloud Function needed)
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

// International shipping: not in scope for current launch — INR / domestic India only

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
| `categories` | `cat_face`, `cat_body`, `cat_hair`, `cat_powder`, `cat_combo`, `cat_supplements` |
| `concerns` | `concern_acne`, `concern_pigmentation`, `concern_brightening`, … |
| `coupons` | `WELCOME10`, `LICORICE20`, `FREESHIP` |
| `blogs` | `blog_kumkumadi_benefits`, `blog_ubtan_guide`, `blog_ayurvedic_hair` |
| `reviews` | `rev_kumkumadi_1`, `rev_kumkumadi_2`, `rev_vitc_1`, … |
| `inventory` | same ID as product (`prod_kumkumadi_oil`, …) |
| `settings` | `siteConfig`, `shippingRules`, `paymentSettings` (fixed well-known IDs) |

### Seed Products (10 — 9 inspired by product range + 1 confirmed from product photo)

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
| **`prod_keshli_tablets`** | **Licorice Keshli Hair Care Tablet** | **supplements** | **hair-care** | **60 tablets / 120 tablets** |

> `prod_keshli_tablets` is a **confirmed real product** (photo provided). It is an oral Keehovedic (Ayurvedic) hair supplement — not a topical product. Seed data should reflect: formulation = tablet, weight used only for shipping (approx 150 g / 280 g), no variant images needed beyond the bottle photo.

### Seed Concerns (8)

`concern_anti_ageing` · `concern_pigmentation` · `concern_acne` · `concern_brightening` · `concern_tanning` · `concern_dryness` · `concern_hair_care` · `concern_blemishes`

### Seed Categories (6)

| ID | Label | Includes |
| -- | ----- | -------- |
| `cat_face` | Face Care | Oils, serums, face washes, sunscreens |
| `cat_body` | Body Care | Body butters, lotions |
| `cat_hair` | Hair Care | Topical hair oils |
| `cat_powder` | Powder | Ubtans, face packs |
| `cat_combo` | Combo Packs | Bundled products |
| `cat_supplements` | Supplements | Oral tablets and capsules (e.g. Keshli) |

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

### Seed Reviews (8 — 2 per flagship product, all approved)

| ID | Product | Rating | Verified Purchase |
| -- | ------- | ------ | ----------------- |
| `rev_kumkumadi_1` | prod_kumkumadi_oil | 5 | true |
| `rev_kumkumadi_2` | prod_kumkumadi_oil | 4 | true |
| `rev_ubtan_1` | prod_brightening_ubtan | 5 | true |
| `rev_ubtan_2` | prod_brightening_ubtan | 4 | false |
| `rev_vitc_1` | prod_vitamin_c_serum | 5 | true |
| `rev_vitc_2` | prod_vitamin_c_serum | 4 | true |
| `rev_keshli_1` | prod_keshli_tablets | 5 | true |
| `rev_keshli_2` | prod_keshli_tablets | 4 | true |

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
│  Products             10     [Seed ↑]  [Delete ✕]            │
│  Categories           6     [Seed ↑]  [Delete ✕]            │
│  Concerns             8     [Seed ↑]  [Delete ✕]            │
│  Coupons              3     [Seed ↑]  [Delete ✕]            │
│  Blog Posts           3     [Seed ↑]  [Delete ✕]            │
│  Reviews              8     [Seed ↑]  [Delete ✕]            │
│  Settings             3     [Seed ↑]  [Delete ✕]            │
│  Inventory            10     [Seed ↑]  [Delete ✕]            │
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

> Tick each checkbox as you complete it. Phases are sequential — complete all tasks in the current phase before moving to the next. Each phase ends with a working, deployable slice of the product.

---

### Phase 1 — Foundation ✅ COMPLETE (commit: `phase-1-foundation`)
**Goal**: A runnable Next.js app with brand theming, locale routing, Firebase init, auth, and a complete in-memory mock data layer. Every UI built in later phases will "just work" on a fresh clone with zero Firebase config.

**Exit criteria**: `npm run dev` boots, home page renders with real brand colours, login/register work, language switcher works, seed page populates Firestore.

#### 1.1 Project Bootstrap
- [ ] Initialise Next.js 14 App Router project with TypeScript: `npx create-next-app@latest licorice --ts --app --tailwind --eslint --src-dir=false --import-alias="@/*"`
- [ ] Install all Phase 1 dependencies in one shot:
  ```
  next-intl firebase firebase-admin zustand react-hook-form @hookform/resolvers zod
  framer-motion @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-dropdown-menu
  @radix-ui/react-accordion @radix-ui/react-toast react-hot-toast embla-carousel-react
  ```
- [ ] Create `.env.example` with all keys stubbed (empty values); commit to repo
- [ ] Create `.env.local` from `.env.example`; set `NEXT_PUBLIC_USE_MOCK_DATA=true` — working UI without Firebase
- [ ] Configure `eslint` with `@typescript-eslint` + `eslint-config-next`; add `prettier` with `prettier-plugin-tailwindcss`
- [ ] Add `@next/bundle-analyzer` as dev dependency; add `ANALYZE=true` script to `package.json`
- [ ] Confirm absolute imports `@/*` resolve to project root in `tsconfig.json`

#### 1.2 Theme & Constants
- [ ] `constants/theme.ts` — export typed colour tokens (`primary: "#2B1A6B"`, `accent: "#C9B99A"`, etc.), font names (`heading: "Cormorant Garamond"`, `body: "Inter"`), border radius, spacing scale
- [ ] `constants/site.ts` — `BRAND_NAME`, `TAGLINE`, `SUPPORT_EMAIL`, `SUPPORT_HOURS`, `WHATSAPP_NUMBER`, social handles, top-nav items array
- [ ] `constants/policies.ts` — `FREE_SHIPPING_THRESHOLD` (999), `COD_FEE` (50), `RETURN_WINDOW_DAYS` (3), `PROCESSING_DAYS` ("1-2"), `STANDARD_SLA`, `EXPRESS_SLA`; **INR only, domestic India**
- [ ] `constants/categories.ts` — `CATEGORIES` array (id, label, slug) for 6 categories; `CONCERNS` array (id, label, slug, description) for 8 concerns
- [ ] `app/globals.css` — declare CSS custom properties from `constants/theme.ts` on `:root`; include Tailwind directives
- [ ] `tailwind.config.ts` — extend `colors` with CSS-variable-backed palette (`primary: "hsl(var(--primary))"` etc.); add `Cormorant Garamond` and `Inter` to `fontFamily`; add `animate-shimmer` keyframe for skeletons

#### 1.3 Internationalisation (i18n)
- [ ] Restructure all app routes under `app/[locale]/` segment
- [ ] `middleware.ts` — detect locale from URL prefix using `next-intl`; redirect `/` → `/en`; block `/dev/*` paths (return 404) in production; block `/api/dev/*` same way
- [ ] `lib/i18n.ts` — `LOCALES = ["en","hi","mr"]`, `DEFAULT_LOCALE = "en"`, `LocalizedString` type, `getLocalizedValue(field, locale)` helper with English fallback
- [ ] `messages/en.json` — complete baseline with all namespaces: `nav`, `home`, `product`, `cart`, `checkout`, `concerns`, `policies`, `account`, `auth`, `errors`, `admin`, `support`, `consultation`, `blog`, `footer`
- [ ] `messages/hi.json` — placeholder (copy EN structure, keep EN values — to be filled in Phase 8)
- [ ] `messages/mr.json` — placeholder (same as above)
- [ ] `app/[locale]/layout.tsx` root layout — load `Cormorant Garamond` + `Inter` via `next/font/google`; wrap with `NextIntlClientProvider`; inject `AnnouncementBar`, `Navbar`, `Footer`, `Toaster`
- [ ] `components/layout/LanguageSwitcher.tsx` — EN / हिं / मर dropdown using Radix; writes locale to `NEXT_LOCALE` cookie; reads from `useLocale()`

#### 1.4 Mock & Seed Data Layer
- [ ] `lib/mocks/products.ts` — all 10 seed products (9 inspired + 1 confirmed Keshli tablet) with complete fields: `variants`, `benefits`, `ingredients`, `faqs`, `concerns`, `images` (placeholder `/images/product-{id}.jpg` paths), `rating`, `reviewCount`
- [ ] `lib/mocks/categories.ts` — 6 category docs matching `CATEGORIES` constant
- [ ] `lib/mocks/concerns.ts` — 8 concern docs matching `CONCERNS` constant
- [ ] `lib/mocks/coupons.ts` — 3 coupons: `WELCOME10` (10%, min ₹500, 1/user), `LICORICE20` (₹200 flat, min ₹999), `FREESHIP` (free shipping, min ₹500)
- [ ] `lib/mocks/reviews.ts` — 8 approved seed reviews (2 per flagship product: kumkumadi, ubtan, vitamin-c, keshli tablets)
- [ ] `lib/mocks/blogs.ts` — 3 blog posts with full Tiptap-compatible HTML body (EN only at Phase 1)
- [ ] `lib/mocks/settings.ts` — `siteConfig` doc (announcement bar, maintenance mode, feature flags), `shippingRules` doc, `paymentSettings` doc (whatsapp enabled, razorpay disabled, COD enabled)
- [ ] `lib/mocks/inventory.ts` — inventory doc per product; 50 units default per variant; `lowStockThreshold: 10`, `reorderPoint: 5`
- [ ] `lib/mocks/index.ts` — `SEED_MAP: Record<string, SeedDoc[]>` combining all collections; exported for seed API routes and `lib/db.ts`
- [ ] `lib/db.ts` — `isFirebaseReady()` reads env vars + `NEXT_PUBLIC_USE_MOCK_DATA`; implement: `getProducts(filters?)`, `getProduct(slug)`, `getCategories()`, `getConcerns()`, `getBlogs(category?)`, `getBlog(slug)`, `getCoupons()`, `getSettings(key)` — each tries Firestore first, catches errors, falls back to mock

#### 1.5 Firebase Initialisation
- [ ] `lib/firebase/client.ts` — `initializeApp` with public env vars; singleton guard (`getApps().length`); export `auth`, `db` (Firestore), `storage`
- [ ] `lib/firebase/admin.ts` — `initializeApp` for Admin SDK using `FIREBASE_ADMIN_*` env vars; server-side only (never imported in client components); export `adminDb`, `adminAuth`
- [ ] Confirm Firestore Security Rules baseline (public read for products/blogs, no writes from client without auth)

#### 1.6 Dev Seed Page & API
- [ ] `app/[locale]/(dev)/dev/seed/page.tsx` — table UI with per-collection row (doc count, Seed ↑, Delete ✕ buttons) + "Seed All" / "Delete All Seed Data" buttons; `[Dev Only]` badge in header; shows last-action status message
- [ ] `app/api/dev/seed/route.ts` — `POST { collections: string[] }` → batch `set()` upsert using `SEED_MAP`; marks each doc with `_seeded: true`; returns 404 if `NODE_ENV === "production"`
- [ ] `app/api/dev/unseed/route.ts` — `POST { collections: string[] }` → batch `delete()` only for known seed IDs (never touches other docs); returns 404 in production

#### 1.7 Auth
- [ ] `lib/auth.ts` — `getCurrentUser(request)` server helper using `adminAuth.verifyIdToken()`; `isAdmin(uid)` checks `users/{uid}.role === "admin"` in Firestore; return typed `User | null`
- [ ] `stores/useAuthStore.ts` — Zustand store: `user`, `loading`, `setUser`, `clearUser`; `onAuthStateChanged` listener in a client-side provider component
- [ ] `app/[locale]/(auth)/login/page.tsx` — email/password form + Google OAuth button; React Hook Form + Zod validation; redirects to `/account` on success
- [ ] `app/[locale]/(auth)/register/page.tsx` — name, email, password, confirm password; creates Firestore `/users/{uid}` doc with `role: "customer"` on first sign-in

#### 1.8 Layout Components
- [ ] `components/layout/AnnouncementBar.tsx` — reads `siteConfig.announcementText` + `announcementLink`; dismissible via `localStorage` key; hidden if text is empty
- [ ] `components/layout/Navbar.tsx` — logo (links to `/`), nav links from `constants/site.ts`, search icon, wishlist icon (with Zustand count badge), cart icon (with Zustand count badge), account icon; hamburger for mobile; `LanguageSwitcher` dropdown; sticky with blur backdrop
- [ ] `components/layout/MobileMenu.tsx` — slide-out Radix Sheet drawer; full nav + concern links organised by section; close on nav
- [ ] `components/layout/Footer.tsx` — 4-column layout: brand blurb + certifications, shop links, account links, contact + social icons; newsletter input (inline, calls `POST /api/newsletter`); policy links row at bottom; copyright
- [ ] `components/layout/CartDrawer.tsx` — Radix Sheet from right; lists cart items (image thumbnail, name, variant, qty controls, remove); shows subtotal; "Continue Shopping" + "Checkout →" CTAs; empty state with Browse CTA

#### 1.9 Home Page Skeleton
- [ ] `app/[locale]/page.tsx` — assembles all home sections in order; server component at root fetching products + reviews from `lib/db.ts`
- [ ] `components/home/HeroBanner.tsx` — full-width split-layout hero: headline (`home.heroTitle`), subhead, "Shop Now" + "Free Consultation" CTA buttons; background uses brand `primary` colour + botanical SVG overlay; Framer Motion `fadeInUp` on mount
- [ ] `components/home/CategoryGrid.tsx` — responsive grid of 6 category cards; each card has category image, label, hover scale; links to `/shop/[category]`
- [ ] `components/home/ProductCarousel.tsx` — section heading + Embla Carousel of `ProductCard` components; prev/next arrow buttons; accepts `title` + `products[]` props; used for "Featured" and "New Arrivals" sections
- [ ] `components/home/BrandValues.tsx` — 4 trust-signal cards (Ayurvedic Formula, Cruelty Free, No Parabens, Natural Ingredients) with SVG icons and one-line descriptions
- [ ] `components/home/TestimonialsCarousel.tsx` — Embla Carousel of quote cards; each shows star rating, review excerpt, customer name + city, verified badge; auto-plays every 4s
- [ ] `components/home/BeforeAfterSlider.tsx` — drag-handle image comparison component; two overlaid images with a vertical divider the user can slide; mobile touch-enabled
- [ ] `components/home/BlogPreview.tsx` — "From the Blog" section; 3 `BlogCard` components in a row; "View All" link to `/blog`
- [ ] `components/home/NewsletterBanner.tsx` — full-width accent-coloured stripe: headline, subhead, email input + Subscribe button; calls `POST /api/newsletter` on submit; shows success toast
- [ ] `app/api/newsletter/route.ts` — validates email; saves to Firestore `/newsletter/{subscriberId}` with `email`, `subscribedAt`, deduplicates by email; returns 200

---

### Phase 2 — Product Catalogue 🔜 NEXT
**Goal**: Complete browsable storefront — shop, concern pages, product detail — fully wired to mock data (and seamlessly to Firestore when credentials are added).

**Exit criteria**: Visitor can browse all products, filter by category/concern, view a full product detail page, and see reviews. Admin can create, edit, and manage products and inventory.

#### 2.1 UI Primitive Components
- [ ] `components/ui/Button.tsx` — `variant`: `primary | secondary | outline | ghost | destructive`; `size`: `sm | md | lg`; `loading` prop shows spinner; `asChild` passthrough via Radix `Slot`
- [ ] `components/ui/Badge.tsx` — `variant` maps to theme tokens; used for product tags, order status, stock level
- [ ] `components/ui/Input.tsx` — controlled input with `label`, `error` message slot, optional leading/trailing icon; forwards ref
- [ ] `components/ui/Textarea.tsx` — same API as Input; auto-resize option
- [ ] `components/ui/Select.tsx` — Radix Select wrapper; accepts `options: {value, label}[]`; controlled + uncontrolled modes
- [ ] `components/ui/Modal.tsx` — Radix Dialog wrapper with overlay, animated entrance, close button, title + description slots
- [ ] `components/ui/Drawer.tsx` — Radix Sheet wrapper; `side`: `left | right | bottom`; used for mobile menus, cart, modals on mobile
- [ ] `components/ui/Skeleton.tsx` — shimmer placeholder; accepts `className` for sizing; used in all loading states
- [ ] `components/ui/StarRating.tsx` — read-only (renders filled/half/empty stars from `value: number`) + interactive mode (click to select, hover preview); accessible with `aria-label`
- [ ] `components/ui/Pagination.tsx` — prev/next buttons + numbered page pills; `currentPage`, `totalPages`, `onPageChange` props
- [ ] `components/ui/Breadcrumb.tsx` — accepts `items: {label, href?}[]`; last item is non-linked current page; structured `<nav aria-label="breadcrumb">`
- [ ] `components/ui/StatusBadge.tsx` — maps order status, review status, and ticket status strings to colour variants (green/amber/red/purple)
- [ ] `components/ui/ImageLightbox.tsx` — full-screen overlay; keyboard arrow navigation; touch swipe on mobile; ESC to close; zoom on click
- [ ] `components/ui/SectionHeading.tsx` — `heading` (Cormorant Garamond), optional `subheading`, optional decorative rule; `align`: `left | center`

#### 2.2 Product Components
- [ ] `components/product/ProductCard.tsx` — product image (`next/image`), name, price + compare-at (strike-through), star rating, "Add to Cart" button; on hover: quick-add overlay with variant selector; wishlist heart icon; links to product detail page
- [ ] `components/product/ProductGrid.tsx` — CSS grid with responsive columns (2 mobile, 3 tablet, 4 desktop); renders `ProductCard` list; shows `Skeleton` grid when `loading={true}`
- [ ] `components/product/ProductFilters.tsx` — sidebar/drawer: category checkboxes, concern checkboxes, price range slider, certification checkboxes; syncs state to URL search params (`?category=face&concern=acne`); "Clear All" button
- [ ] `components/product/ProductSort.tsx` — dropdown: "Newest", "Price: Low → High", "Price: High → Low", "Top Rated", "Best Selling"; syncs to `?sort=` URL param
- [ ] `components/product/ProductImages.tsx` — main large image with zoom-on-hover (CSS `transform: scale`); thumbnail filmstrip below; clicking thumbnail swaps main image; clicking main image opens `ImageLightbox`
- [ ] `components/product/ProductInfo.tsx` — product name (h1), brand, star rating + review count (anchor jumps to reviews section), price display, compare-at price, savings percentage badge, variant selector, quantity selector, "Add to Cart" primary button, "Buy Now" secondary button (skips to checkout), certifications icon row
- [ ] `components/product/VariantSelector.tsx` — pill button group for variant options (e.g. "10ml", "20ml"); selected state highlighted; updating selection updates displayed price
- [ ] `components/product/QuantitySelector.tsx` — `−` / number input / `+` buttons; min=1, max=`availableStock`; shows "Only X left" warning below threshold (5)
- [ ] `components/product/ProductBadges.tsx` — horizontal scrolling icon row: Cruelty Free, Ayurvedic, No Parabens, Vegan etc.; icons from `/public/badges/` or inline SVG
- [ ] `components/product/ProductTabs.tsx` — Radix Tabs: "Benefits" (bulleted list), "Ingredients" (cards with name + benefit), "How To Use" (numbered steps), "FAQs" (Radix Accordion)
- [ ] `components/product/BuyMoreSaveMore.tsx` — 2-up and 3-up bundle upsell cards; shows per-item savings compared to buying individually; "Add Bundle to Cart" button
- [ ] `components/product/RelatedProducts.tsx` — "You May Also Like" Embla Carousel of `ProductCard` components; data from `product.relatedProducts` IDs

#### 2.3 Shop & Browse Pages
- [ ] `app/[locale]/shop/page.tsx` — server component; calls `getProducts(filters)` from `lib/db.ts`; renders `ProductFilters` (sidebar on desktop, drawer on mobile) + `ProductSort` + `ProductGrid`; total product count display; Suspense boundary with skeleton grid
- [ ] `app/[locale]/shop/[category]/page.tsx` — pre-filters by category; `generateStaticParams` from `CATEGORIES`; `generateMetadata` with category name; same layout as shop
- [ ] `app/[locale]/concern/[concern]/page.tsx` — concern hero header (name, description, illustration); concern-filtered product grid; `generateStaticParams` from `CONCERNS`; `generateMetadata` with concern name
- [ ] `app/[locale]/combos/page.tsx` — combo-filtered grid; "Bundle & Save" themed header
- [ ] `app/[locale]/search/page.tsx` — reads `?q=` param; searches product `name`, `tags`, `shortDescription` in Firestore (or mock); shows result count; "No results" state with suggestions

#### 2.4 Product Detail Page
- [ ] `app/[locale]/products/[slug]/page.tsx` — `getProduct(slug)` from `lib/db.ts`; `generateStaticParams` for all slugs; `generateMetadata` with locale-aware `metaTitle` + `metaDescription` + OG image
- [ ] Assemble page: `Breadcrumb` → `ProductImages` + `ProductInfo` (side-by-side on desktop, stacked on mobile) → `ProductBadges` → `BuyMoreSaveMore` → `ProductTabs` → Reviews section → `RelatedProducts`
- [ ] Inject `Product` JSON-LD structured data in `<head>` using `next/head` (name, image, description, rating, offers)
- [ ] "Back in stock" notify form: if `inStock === false`, show email capture → saves to Firestore `/stockAlerts/{productId}/subscribers`

#### 2.5 Static / Policy Pages
- [ ] `app/[locale]/about/page.tsx` — brand story, founder note, mission statement, certifications; uses Cormorant Garamond headings, product lifestyle imagery
- [ ] `app/[locale]/contact/page.tsx` — contact form (name, email, subject, message); WhatsApp deep-link button; support hours from `constants/site.ts`; Google Maps embed (optional)
- [ ] `app/api/contact/route.ts` — Zod validation; creates `/supportTickets/{ticketId}` with `status: "open"`; sends Resend acknowledgement email to customer; returns ticket number
- [ ] `app/[locale]/(policies)/shipping-policy/page.tsx` — content from `constants/policies.ts`; renders domestic SLA table, free shipping threshold, COD rules
- [ ] `app/[locale]/(policies)/refund-policy/page.tsx` — 3-day window, damaged/defective eligibility, return process steps
- [ ] `app/[locale]/(policies)/terms/page.tsx` — terms of service (standard e-commerce template, Licorice Herbals branded)

#### 2.6 Admin — Product Management
- [ ] `app/[locale]/admin/products/page.tsx` — `DataTable` of all products; columns: image, name, category, price, stock badge, active toggle, actions; search by name/SKU; bulk activate/deactivate; "New Product" CTA
- [ ] `app/[locale]/admin/products/new/page.tsx` — renders `ProductForm` in create mode
- [ ] `app/[locale]/admin/products/[id]/page.tsx` — loads product by ID; renders `ProductForm` in edit mode with pre-filled values
- [ ] `components/admin/ProductForm.tsx` — all product fields grouped in sections; localizable fields (`name`, `tagline`, `description`, `benefits`, `howToUse`, `faqs`, `ingredients.benefit`) show EN | HI | MR tab strip; `RichTextEditor` for `description`; `ImageUploader` for product images; `VariantManager` sub-section; `concerns` multi-select (checkboxes); `relatedProducts` + `upsellProducts` product pickers; "Save Draft" + "Publish" buttons
- [ ] `components/admin/VariantManager.tsx` — add/edit/delete variant rows (label, price, compareAt, SKU, weight, dimensions, `isDefault` radio); minimum 1 variant enforced
- [ ] `components/admin/RichTextEditor.tsx` — Tiptap editor; toolbar: bold, italic, underline, h2/h3, ordered/unordered list, blockquote, link insert, image insert (triggers `ImageUploader`); outputs HTML string
- [ ] `components/admin/ImageUploader.tsx` — drag-and-drop zone + file picker; preview grid with drag-to-reorder; upload progress per image; deletes from Firebase Storage on remove; returns ordered URL array

#### 2.7 Admin — Inventory
- [ ] `app/[locale]/admin/inventory/page.tsx` — full product × variant table; stock values colour-coded (red = 0, amber = below threshold, green = healthy); "Low Stock" filter tab; "Bulk CSV Import" button
- [ ] `app/[locale]/admin/inventory/[productId]/page.tsx` — per-product variant rows; per-variant stock ledger (all `StockMovement` docs); "Adjust Stock" button per variant
- [ ] `components/admin/InventoryRow.tsx` — shows variant label, current stock, reserved, available (= stock − reserved), threshold, reorder point; inline "Adjust" link
- [ ] `components/admin/StockAdjustModal.tsx` — `type`: stock_in / adjustment / damaged; `quantity` input; `note` required; writes `StockMovement` doc + atomically updates `inventory/{productId}.variants.{variantId}.stock`
- [ ] `lib/db.ts` additions: `getInventory(productId)`, `getStockMovements(productId, variantId)`, `adjustStock(productId, variantId, delta, movement)` — uses Firestore transaction for atomicity

---

### Phase 3 — Commerce & Payments
**Goal**: Complete end-to-end purchase flow — cart → checkout → payment (WhatsApp, COD, Razorpay) → order confirmed → admin can process.

**Exit criteria**: A customer can place an order via WhatsApp payment method from start to finish. Admin receives the order, views proof, confirms payment. Customer receives confirmation email.

#### 3.1 Cart State
- [ ] `stores/useCartStore.ts` — Zustand store: `items: CartItem[]`, `add(product, variant, qty)`, `remove(itemId)`, `updateQty(itemId, qty)`, `clear()`, `total`, `itemCount`; persisted to `localStorage` with `zustand/middleware/persist`
- [ ] Firestore cart sync: `useCartSync` hook — on `onAuthStateChanged` login, merge `localStorage` cart into `/users/{uid}/cart`; on sign-out, clear local store
- [ ] Wire `CartDrawer` to live `useCartStore`: live item list, remove buttons, qty controls, subtotal

#### 3.2 Cart UI
- [ ] `components/cart/CartItem.tsx` — product thumbnail, name, variant label, unit price, qty controller (`QuantitySelector`), line total, remove button
- [ ] `components/cart/CartSummary.tsx` — itemised subtotal, coupon discount line, shipping estimate ("Free" or "₹80"), COD fee line (if applicable), total in bold; "Savings" highlighted if coupon active
- [ ] `components/cart/CouponInput.tsx` — text input + "Apply" button → client calls `POST /api/coupon/validate`; shows discount applied or error message; "Remove" link clears coupon
- [ ] `app/api/coupon/validate/route.ts` — server-side: all 7 validation rules (exists, active, dates, minOrder, globalUsage, perUserUsage, applicable IDs); returns `{ valid: true, discountAmount, type }` or `{ valid: false, error }`

#### 3.3 Wishlist
- [ ] `stores/useWishlistStore.ts` — similar to cart; `toggle(productId)`, `isWished(productId)`; persisted to localStorage; synced to `/users/{uid}/wishlist` when logged in
- [ ] Wishlist heart icon in `ProductCard` and `ProductInfo` connected to store
- [ ] Navbar wishlist icon shows `itemCount` badge
- [ ] `app/[locale]/account/wishlist/page.tsx` — `ProductGrid` of wishlisted products; "Move to Cart" button per item; empty state with "Browse Products" CTA

#### 3.4 Checkout Flow
- [ ] `app/[locale]/checkout/page.tsx` — 5-step flow: **Cart Review → Address → Shipping → Payment → Confirmation**; step state persisted in Zustand `useCheckoutStore`; each step validates before advancing
- [ ] `components/checkout/CheckoutStepper.tsx` — horizontal step indicator; completed steps have checkmark; active step highlighted; past steps are clickable (go back)
- [ ] `components/checkout/AddressList.tsx` — lists `/users/{uid}/addresses`; "Use this address" radio selection; "Add New Address" card at the bottom; guest checkout shows inline form only
- [ ] `components/checkout/AddressForm.tsx` — React Hook Form + Zod: name, phone (10-digit Indian), line1, line2, city, state (dropdown from Indian states list), pincode (6-digit), country (locked to India); saves to Firestore on submit
- [ ] `components/checkout/PincodeChecker.tsx` — triggers `POST /api/pincode-check` on pincode blur; shows "✓ Delivery available — ETA 5-7 days" or error; "COD not available at this pincode" warning; blocks advance if unserviceable
- [ ] `app/api/pincode-check/route.ts` — calls Shiprocket serviceability API with JWT from `/api/shiprocket/token`; in mock mode (`NEXT_PUBLIC_USE_MOCK_DATA=true`) returns always-serviceable with standard SLA
- [ ] `components/checkout/ShippingOptions.tsx` — radio options: Standard (free above ₹999 / ₹80), Express (+₹X, 2-3 days), Same Day (Mumbai pincodes only); shows SLA and price; reads availability from pincode check result
- [ ] `components/checkout/PaymentOptions.tsx` — SSR fetches `/settings/paymentSettings` (60s cache); renders only enabled methods as radio options; if only 1 method, auto-selects it
- [ ] `components/checkout/OrderSummary.tsx` — final breakdown: items × qty, subtotal, discount (coupon), shipping, COD fee, **Total**; product thumbnails; not editable — "← Edit Cart" link

#### 3.5 WhatsApp Payment
- [ ] `components/checkout/WhatsAppPaymentInstructions.tsx` — post-order page: UPI ID in copy-able field, QR code image (from `paymentSettings.whatsappQrImageUrl` if set), "Open WhatsApp" deep-link button with pre-filled message (`"Hi, I've paid ₹X for Order #LH-0001. Please find screenshot attached."`); instructions numbered list; order number prominently shown
- [ ] `components/checkout/WhatsAppProofUpload.tsx` — optional file input (image only, max 5 MB); "Upload Screenshot" button triggers `POST /api/payment/whatsapp/submit-proof`; progress indicator; success state shows "Proof received — we'll confirm shortly"
- [ ] `app/api/payment/whatsapp/submit-proof/route.ts` — verifies auth token; validates file: MIME type must be `image/*`, max 5 MB; uploads to Firebase Storage `/payment-proofs/{orderId}.{ext}`; updates order `paymentStatus: "proof_submitted"`, `whatsappProofImageUrl`; sends Resend email to admin

#### 3.6 Razorpay Payment (optional — only rendered when `razorpayEnabled: true`)
- [ ] `app/api/payment/razorpay/create-order/route.ts` — verifies auth; reads `razorpayEnabled` from Firestore settings; if disabled returns 403; creates Razorpay order via API key; returns `{ orderId, amount, currency: "INR", keyId }`
- [ ] `app/api/payment/razorpay/verify/route.ts` — receives `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`; computes HMAC-SHA256(`orderId|paymentId`, `RAZORPAY_KEY_SECRET`); rejects if mismatch; sets `paymentStatus: "paid"`, `paymentId` on order; triggers confirmation email
- [ ] Razorpay SDK (`<script src="...">`) loaded client-side only via `next/script strategy="lazyOnload"` and only when payment method is active

#### 3.7 COD Payment
- [ ] "Cash on Delivery" option rendered when `codEnabled: true` in settings
- [ ] Selecting COD adds visible `+₹50 COD fee` line to `OrderSummary`
- [ ] Order creation sets `paymentMethod: "cod"`, `paymentStatus: "pending"`, `orderStatus: "pending"`; stock reserved immediately
- [ ] COD min-order check: if `codMinOrder` is set and cart is below it, COD option is greyed out with tooltip

#### 3.8 Order Creation
- [ ] `lib/actions/createOrder.ts` — Server Action: 1) Zod-validate inputs; 2) re-validate coupon server-side; 3) check stock per variant with Firestore `runTransaction`; 4) atomically: decrement stock + write `reserved` + write order doc + increment `orderCounter` in `siteConfig`; 5) returns `{ orderId, orderNumber }`
- [ ] `orderNumber` generation: `LH-${year}-${String(counter).padStart(5, "0")}` — counter stored in `siteConfig.orderCounter`, incremented atomically in the same transaction as order creation
- [ ] Guest checkout: requires `guestEmail`; `userId` is null; address stored inline on order
- [ ] 15-minute reservation timeout: on order creation write `reservationExpiresAt: now + 15min`; `getInventory` query filters out expired reservations (lazy expiry — no background job)

#### 3.9 Post-Order & Emails
- [ ] `app/api/order-confirm/route.ts` — called after payment confirmed (WhatsApp admin action or Razorpay verify); builds order summary HTML; sends Resend email to customer (`orders@licoriceherbal.in` as from); writes first `OrderEvent` to `/orders/{id}/timeline`; idempotent (checks `confirmationEmailSentAt` before sending)
- [ ] Confirmation email template: order number, items table, delivery address, expected delivery date, contact support link

#### 3.10 Admin — Order Management
- [ ] `app/[locale]/admin/orders/page.tsx` — `DataTable` with filters: status tabs (All / Awaiting Payment / Processing / Shipped / Delivered / Cancelled), payment method filter, date range picker, search (order number / name / email / AWB); sortable by date, total; bulk mark-as-confirmed action; Export CSV
- [ ] `app/[locale]/admin/orders/[id]/page.tsx` — full order detail: items breakdown, pricing, customer + address, payment details, shipping info, timeline; action buttons depend on `orderStatus`
- [ ] `components/admin/DataTable.tsx` — generic reusable table component: column config array, sortable headers, client-side filter, Skeleton loading rows, empty state, pagination
- [ ] `components/admin/OrderStatusSelect.tsx` — dropdown of valid next statuses given current status; shows confirmation dialog for destructive moves (cancel, refund); writes status change + optional admin note to Firestore; appends timeline event
- [ ] `components/admin/WhatsAppPaymentConfirm.tsx` — shows proof screenshot inline (`<img src={proofUrl}>`); "Confirm Payment" button → Server Action sets `paymentStatus: "paid"`, `orderStatus: "confirmed"`, `whatsappConfirmedBy`, `whatsappConfirmedAt`; triggers `POST /api/order-confirm`; WhatsApp conversation deep-link for reference
- [ ] `components/admin/RefundModal.tsx` — `amount` input (pre-filled with order total), `note` textarea; for Razorpay: calls Razorpay refund API + records `refundId`; for WhatsApp/COD: records manual refund note only; sets `paymentStatus: "refunded"` and `refundedAt`

#### 3.11 Admin — Payment Settings
- [ ] `app/[locale]/admin/settings/payments/page.tsx` — toggle switches for WhatsApp, Razorpay, COD; WhatsApp section: UPI ID text field, business phone number, QR image upload; Razorpay section: shows key ID (masked), test mode toggle; COD section: fee amount, min order; all changes write instantly to `/settings/paymentSettings` via Server Action
- [ ] `components/admin/PaymentMethodToggle.tsx` — labelled toggle switch; optimistic UI update; on error reverts

#### 3.12 Customer Account
- [ ] `app/[locale]/account/page.tsx` — dashboard: greeting (`"Welcome back, {name}"`), last 3 orders as `OrderCard`, quick links (All Orders, Wishlist, Addresses, Profile)
- [ ] `app/[locale]/account/orders/page.tsx` — paginated order history; `OrderCard` list; filter by status
- [ ] `app/[locale]/account/orders/[id]/page.tsx` — full order detail: items, pricing breakdown, delivery address, `OrderTimeline` (live tracking events), return request button (visible if within 3-day window); invoice PDF download link
- [ ] `components/account/OrderCard.tsx` — order number, date, items count, total, status `StatusBadge`, "View Details" link
- [ ] `components/account/OrderTimeline.tsx` — vertical timeline of `OrderEvent` docs from `/orders/{id}/timeline`; icons per status; timestamps; location if available; most-recent event at top
- [ ] `app/[locale]/account/addresses/page.tsx` — address cards grid; "Add New" opens `AddressForm` modal; edit/delete per card
- [ ] `components/account/AddressCard.tsx` — formatted address display; "Edit", "Delete", "Set as Default" actions
- [ ] `app/[locale]/account/profile/page.tsx` — edit display name + phone; change password (requires current password); danger zone: delete account link (disabled—contact support)

---

### Phase 4 — Shipping & Tracking
**Goal**: Shiprocket integration provides automatic shipment creation, live webhook tracking, and customer-facing order tracking. Return flow and admin shipping tools complete.

**Exit criteria**: Admin ships an order via Shiprocket, AWB is stored, customer sees live tracking timeline updated by webhook. Manual shipping fallback works.

#### 4.1 Shiprocket Token Management
- [ ] `app/api/shiprocket/token/route.ts` — on `GET`: checks Firestore `/settings/shiprocketToken` for cached JWT + `expiresAt`; if valid returns cached; else POSTs to Shiprocket auth endpoint with `SHIPROCKET_EMAIL` + `SHIPROCKET_PASSWORD`; stores token + `expiresAt = now + 24h` in Firestore; returns token — all within 10s Vercel timeout
- [ ] `lib/shiprocket.ts` — `getToken(): Promise<string>` calls `/api/shiprocket/token`; expose helpers: `createShipment(order)`, `cancelShipment(shipmentId)`, `trackByAwb(awb)`, `checkServiceability(pincode, weight)`

#### 4.2 Shipment Creation
- [ ] `app/api/shiprocket/create-order/route.ts` — verifies admin auth; fetches order from Firestore; builds Shiprocket API payload (items as `order_items[]`, pickup address from `siteConfig`, delivery address from order, weight from variant); POST to Shiprocket; stores `shiprocketOrderId`, `shiprocketShipmentId`, `awbCode`, `courierName` on order; appends timeline event `"Shipment created"`
- [ ] `app/api/shiprocket/cancel-order/route.ts` — verifies admin auth; calls Shiprocket cancel API; releases stock reservation (write `StockMovement` of type `released`); updates `orderStatus: "cancelled"`
- [ ] `app/api/shiprocket/track/route.ts` — proxy: GET with `?awb=` param; calls Shiprocket tracking API; returns normalised timeline events array; used by customer track page

#### 4.3 Shiprocket Webhook
- [ ] `app/api/shiprocket/webhook/route.ts` — validates `X-Shiprocket-Hmac-Sha256` header against `SHIPROCKET_WEBHOOK_SECRET`; rejects non-matching with 401; maps Shiprocket event status to internal `orderStatus`; appends event to `/orders/{id}/timeline`; updates top-level `orderStatus`; for `delivered` status sets `deliveredAt = now`; triggers Resend email to customer for key status milestones (shipped, out-for-delivery, delivered)
- [ ] Document expected webhook payload shape in code comment; fail silently on unknown event types

#### 4.4 Admin Shipping Tools
- [ ] `components/admin/ShipOrderModal.tsx` — two tabs: **Shiprocket** (calls `/api/shiprocket/create-order`; shows courier recommendation; AWB auto-populated after success) and **Manual** (courier name text field + AWB text field + tracking URL; sets `manualShipping: true`); shows Pincode serviceability inline check before submitting
- [ ] Admin order detail: show AWB code, courier name, tracking link, estimated delivery date after shipping; "Re-ship" option if shipment failed

#### 4.5 Customer Order Tracking
- [ ] `app/[locale]/track/page.tsx` — public page; `?orderId=` or `?awb=` + `?email=` params; fetches order (verifies email matches `guestEmail` or account email as auth alternative); renders `OrderTimeline`; shows current status hero card; courier name + external tracking link; "Order not found" error state
- [ ] Customer `account/orders/[id]` — `OrderTimeline` already shows webhook-updated events in real time (Firestore `onSnapshot` listener on the timeline sub-collection)
- [ ] Courier tracking link (`courierTrackingUrl`) opens in new tab; shows courier name

#### 4.6 Returns & Refunds
- [ ] Return request button on `account/orders/[id]` — visible only: `orderStatus === "delivered"` AND `deliveredAt` is within `RETURN_WINDOW_DAYS` (3 days); not visible for digital or non-returnable items
- [ ] Return request form: reason dropdown (damaged, wrong item, defective, expired) + image uploads (up to 3) + optional note; writes `status: "return_requested"`, `returnReason`, `returnImages` on order
- [ ] Admin: "Initiate Return Pickup" button on order detail → calls Shiprocket return shipment API; updates `orderStatus: "return_picked_up"`
- [ ] On return received (admin manual action): trigger refund via `RefundModal`; write `StockMovement` of type `return`

#### 4.7 Admin Dashboard — Baseline
- [ ] `app/[locale]/admin/page.tsx` — stats grid + ordered alert cards; server-rendered; refreshes on page load
- [ ] `components/admin/StatsCard.tsx` — icon, label, primary value, optional secondary (e.g. "vs yesterday"), optional trend arrow
- [ ] Stats widgets: Revenue today / this week / this month (sum of `paymentStatus: "paid"` orders), Orders today (count), Pending confirmation count, Low-stock count, Open tickets count, Pending reviews count, Upcoming consultations count
- [ ] Charts (server-computed, no Cloud Functions): Revenue last 30 days (line chart via CSS/SVG — no chart library dependency unless already installed), Orders by status today (donut), Top 5 products last 30 days (bar)
- [ ] **WhatsApp pending payments** alert card: count of `paymentStatus IN ["pending_whatsapp","proof_submitted"]`; "Review All" link to filtered orders list
- [ ] Recent orders: last 10 rows with `OrderStatusSelect` inline for quick processing

---

### Phase 5 — Reviews & Trust
**Goal**: Verified purchase review system with photo uploads, admin moderation, helpful votes, and public display integrated into product pages.

**Exit criteria**: Customer with a delivered order can submit a review with photos. Admin can approve/reject in a moderation queue. Approved reviews appear on the product page. Product rating is updated automatically.

#### 5.1 Review Submission
- [ ] `components/product/AddReviewForm.tsx` — shown only if current user has a `delivered` order containing this product (checked server-side via `lib/actions/checkReviewEligibility.ts`); fields: star rating (mandatory, 1–5), title (optional), body (min 20 chars, max 1000), up to 5 photo uploads; React Hook Form + Zod; Submit creates review with `status: "pending"`
- [ ] `lib/actions/checkReviewEligibility.ts` — Server Action: queries `/orders` where `userId = currentUser AND orderStatus = "delivered"` and one of `items.productId` matches; returns `{ eligible: boolean, orderId? }`
- [ ] `lib/actions/submitReview.ts` — Server Action: re-checks eligibility; validates inputs; uploads images to `/reviews/{reviewId}/` in Firebase Storage (sequential, fail gracefully if one fails); writes Firestore review doc; returns `reviewId`
- [ ] "Review submitted — pending approval" success toast

#### 5.2 Admin Review Moderation
- [ ] `app/[locale]/admin/reviews/page.tsx` — **Pending** tab (default) + **All Reviews** tab; `DataTable` with columns: product, rating, excerpt, author, date, verified badge, actions; filter by product, star rating, date
- [ ] `app/[locale]/admin/reviews/[id]/page.tsx` — full review body, all images (grid with lightbox), customer name + verified purchase status, product link; Approve / Reject (requires reason text) / Add Reply buttons
- [ ] `components/admin/ReviewModerationCard.tsx` — composable card used in both list and detail views; approve/reject buttons; reply textarea (shown only after approval)
- [ ] `lib/actions/moderateReview.ts` — Server Action: on approve → sets `status: "approved"`, `moderatedBy`, `moderatedAt`; then reads all approved reviews for the product → computes average rating → updates `product.rating` + `product.reviewCount` in Firestore transaction; on reject → sets `status: "rejected"`, `rejectionReason`
- [ ] Admin reply: sets `adminReply` + `adminRepliedAt` on review doc; reply shown publicly on product page below customer review

#### 5.3 Storefront Review Display
- [ ] `components/product/ReviewsList.tsx` — top section: average star rating (large), rating distribution bar chart (5→1 stars with fill percentage); filter row and sort dropdown; paginated `ReviewCard` list (10 per page); "Load more" button or pagination; total count display
- [ ] `components/product/ReviewCard.tsx` — star rating, title, body, `Verified Purchase` badge (if `isVerifiedPurchase`), date, customer first name + city, review photos row (click opens lightbox), `adminReply` section (indented, labelled "Response from Licorice Herbals"), helpful vote thumbs-up (`helpfulCount`), "Report" link
- [ ] `components/product/ReviewFilters.tsx` — pill filters: "All", "5 Stars", "4 Stars" … "1 Star", "Verified Only", "With Photos"; updates URL param `?reviewFilter=`
- [ ] `components/product/ReviewPhotoGallery.tsx` — all customer photos from approved reviews in a masonry/grid; clicking opens `ImageLightbox` with customer name + rating overlay
- [ ] Helpful vote: `POST /api/review/helpful` → Firestore `increment(1)` on `helpfulCount`; debounced, one vote per session (stored in `sessionStorage`)
- [ ] Flag review: "Report" opens compact form (reason dropdown); `POST /api/review/flag` → writes `reviewFlag` doc
- [ ] `app/api/review/flag/route.ts` — verifies auth; writes `/reviewFlags/{flagId}`; checks user hasn't flagged same review already

---

### Phase 6 — Support & Consultation
**Goal**: Support ticket inbox (threaded), free consultation booking, and corporate gifting inquiry form — all with admin management panels.

**Exit criteria**: Customer can open a ticket from an order. Admin sees tickets in an inbox, replies, and closes them. Customer can book a consultation. Corporate inquiry form works.

#### 6.1 Support Tickets — Customer Side
- [ ] "Get Help" button on `account/orders/[id]` — opens ticket create modal pre-filled with order number; category auto-set to "order"
- [ ] `app/[locale]/contact/page.tsx` form → `POST /api/contact` → creates ticket; shows ticket number in success state
- [ ] Customer can view their tickets at `app/[locale]/account/` (add "Support" quick link); view thread at a dedicated page
- [ ] `components/support/TicketCard.tsx` — ticket number, subject, category badge, status `StatusBadge`, last message timestamp, unread indicator
- [ ] `components/support/TicketThread.tsx` — chronological message bubbles (customer: right-aligned, admin: left-aligned); shows `attachments` as image thumbnails; timestamps; closed ticket shows "This ticket is resolved" banner with re-open link

#### 6.2 Support Tickets — Admin Side
- [ ] `app/[locale]/admin/support/page.tsx` — `TicketInbox` component; tabs: Open / In Progress / Waiting Customer / Resolved; unread count badge per tab; sort by: Last updated, Priority, Oldest first; SLA highlight: tickets open > 24h shown with amber border
- [ ] `app/[locale]/admin/support/[ticketId]/page.tsx` — `TicketThread` + reply form (Textarea + file attachment + Send); internal notes section (admin-only, grey background, padlock icon); status change dropdown; close/reopen button; assigns ticket to admin user
- [ ] `components/admin/TicketInbox.tsx` — wraps the ticket list with composable filter/sort controls; row click navigates to detail
- [ ] On every admin reply: write `TicketMessage` to `/supportTickets/{id}/messages/`; send Resend email to customer; update ticket `updatedAt` and `status: "waiting_customer"`

#### 6.3 Free Consultation
- [ ] `app/[locale]/consultation/page.tsx` — two-column layout: consultant bio (photo, credentials, specialties) on left; booking form on right; form fields: name, email, phone, concern checkboxes (multi-select from `CONCERNS`), preferred date (date picker, future dates only), preferred time slot (dropdown), message (optional)
- [ ] `lib/actions/bookConsultation.ts` — Zod validation; writes `/consultations/{bookingId}` with `status: "pending"`; sends Resend confirmation email to customer ("Booking received, we'll confirm shortly"); sends admin alert email with booking details
- [ ] `app/[locale]/admin/consultations/page.tsx` — two tabs: Upcoming (sorted by date) and Completed; `ConsultationCard` list; date range filter
- [ ] `components/admin/ConsultationCard.tsx` — name, concerns, preferred slot, status badge; inline action buttons: Confirm (sends customer confirmation email), Complete, Cancel; internal notes field
- [ ] On confirmation: sends Resend email to customer with confirmed date/time, meeting link placeholder (`[Online link or phone number]`), prep instructions

#### 6.4 Corporate Gifting
- [ ] `app/[locale]/corporate-gifting/page.tsx` — hero section with corporate gifting visual; value propositions; inquiry form with all required fields (company, contact, email, phone, units, budget, delivery date, custom branding, message); "Request Quote" CTA
- [ ] `lib/actions/submitCorporateInquiry.ts` — validation; writes `/corporateInquiries/{id}`; admin alert email via Resend; customer acknowledgement email
- [ ] `app/[locale]/admin/corporate/page.tsx` — `DataTable` of inquiries; columns: company, units, budget, date; status filter (New / In Progress / Won / Lost); click opens inquiry detail modal

---

### Phase 7 — Content
**Goal**: Blog with rich text, diet section, newsletter subscription management, and before/after gallery — all with admin CRUD.

**Exit criteria**: Admin can publish a blog post via Tiptap editor. Visitors can browse and read posts. Newsletter captures subscribers. Before/after slider shows real content.

#### 7.1 Blog — Storefront
- [ ] `lib/db.ts` additions: `getBlogs(category?, limit?)`, `getBlog(slug)`, `getBlogsByTag(tag)` — with mock fallback to `lib/mocks/blogs.ts`
- [ ] `app/[locale]/blog/page.tsx` — blog list: category filter tabs (Skincare & Ayurveda / Diet & Lifestyle); grid of `BlogCard` components; load-more pagination; `generateMetadata` with blog listing meta
- [ ] `app/[locale]/blog/[slug]/page.tsx` — article with: cover image, category tag, title (Cormorant Garamond), author avatar + name, publish date, read time estimate, `BlogContent` body, tags row, related products widget (from `blog.relatedProducts`), social share buttons, `RelatedPosts` section; `generateStaticParams` + `generateMetadata`; `Article` JSON-LD
- [ ] `app/[locale]/blog/diet/page.tsx` — same as blog list but pre-filtered to `category: "diet-lifestyle"`
- [ ] `components/blog/BlogCard.tsx` — cover image, category pill, title, excerpt (first 150 chars), author, date, read time, "Read more →" link
- [ ] `components/blog/BlogContent.tsx` — renders Tiptap HTML via `dangerouslySetInnerHTML` (safe: Tiptap output is controlled, admin-only); applies prose typography styles; syntax-highlighted `<pre>` blocks; image figures with captions
- [ ] `components/blog/RelatedPosts.tsx` — "More Posts" sidebar section; 3 `BlogCard` components; shown below article

#### 7.2 Blog — Admin
- [ ] `app/[locale]/admin/blogs/page.tsx` — `DataTable` of all posts; status tabs: Draft / Published / Archived; columns: title, category, author, published date, views (optional); "New Post" CTA
- [ ] `app/[locale]/admin/blogs/new/page.tsx` — new blog form
- [ ] `app/[locale]/admin/blogs/[id]/page.tsx` — edit blog form (same component)
- [ ] Blog form fields: `title` (EN | HI | MR tabs), `slug` (auto-generated from EN title, editable), category dropdown, cover image (`ImageUploader`), `body` (`RichTextEditor`, EN | HI | MR tabs), author name, tags (comma-separated), `relatedProducts` multi-select, `metaTitle` + `metaDescription` + OG image, `publishedAt` date picker (future date = scheduled), status toggle (Draft / Published); Save + Publish buttons

#### 7.3 Newsletter
- [ ] `POST /api/newsletter` — Zod: valid email; writes to `/newsletter/{id}` with `email`, `subscribedAt`; reads existing doc first to deduplicate; returns `{ alreadySubscribed: boolean }`
- [ ] `components/home/NewsletterBanner.tsx` — inline form already built in Phase 1; now fully wired to API; shows "You're subscribed!" if `alreadySubscribed`
- [ ] `app/[locale]/admin/newsletter/page.tsx` — subscriber `DataTable`: email, subscribed date, source; total count badge; "Export CSV" button (builds `text/csv` response from all subscriber docs)

#### 7.4 Before/After Gallery
- [ ] Admin: `/admin/settings` (or a dedicated `/admin/before-after`) — upload before/after image pairs; `product` tag (links to a product); `caption` text; stored in Firestore `/beforeAfterGallery/{id}` with two Firebase Storage URLs
- [ ] `components/home/BeforeAfterSlider.tsx` — already scaffolded in Phase 1; now feeds from `lib/db.ts` `getBeforeAfterItems()`; renders the real uploaded pairs

---

### Phase 8 — Polish & Launch
**Goal**: Production-ready: SEO complete, performance optimised, i18n fully translated, security hardened, PWA configured, deployed to Vercel with custom domain.

**Exit criteria**: Lighthouse scores ≥ 90 on mobile for home and product pages. All three locales working. Firestore security rules deployed. Site live at custom domain.

#### 8.1 i18n — Translation Completion
- [ ] `messages/hi.json` — replace all EN placeholder values with correct Hindi translations (all namespaces)
- [ ] `messages/mr.json` — replace all EN placeholder values with correct Marathi translations (all namespaces)
- [ ] `lib/mocks/products.ts` — add `hi` + `mr` values to every `LocalizedString` field in all seed products
- [ ] Smoke-test all 3 locales: navigation, product pages, checkout flow, account pages
- [ ] `LanguageSwitcher` — confirm locale persists in `NEXT_LOCALE` cookie across navigation + page reload

#### 8.2 SEO
- [ ] `generateMetadata()` on every page — locale-specific `title`, `description`, `openGraph.image`, `twitter.card`; falls back to `constants/site.ts` defaults
- [ ] Root `app/[locale]/layout.tsx` — inject `<link rel="alternate" hreflang="en|hi|mr|x-default">` for all pages
- [ ] `app/sitemap.ts` — dynamic sitemap: all product slugs (`/en/products/…`, `/hi/products/…`, `/mr/products/…`), all blog slugs, all concern pages, static pages; exclude admin + auth + account
- [ ] `app/robots.ts` — `Disallow: /admin`, `Disallow: /api`, `Disallow: /dev`, `Disallow: /account`; `Sitemap:` header
- [ ] Product pages: `Product` JSON-LD (name, image, description, offers with price + currency, aggregateRating)
- [ ] Blog pages: `Article` JSON-LD (headline, author, datePublished, image)
- [ ] OG images: use Next.js `ImageResponse` in `/opengraph-image.tsx` files for home + product + blog pages

#### 8.3 Performance
- [ ] All `<img>` tags replaced with `next/image`; set `priority` on LCP images (hero, product main image)
- [ ] Dynamic imports (`next/dynamic`) for: `RichTextEditor`, `ImageLightbox`, `BeforeAfterSlider`, Razorpay SDK
- [ ] Run `ANALYZE=true npm run build`; verify no chunk exceeds 200 kB gzipped; remove unused Radix primitives
- [ ] Server Components cache: `{ next: { revalidate: 60 } }` on Firestore reads for products, blogs, categories
- [ ] Lighthouse audit on mobile (Chrome DevTools); target ≥ 90 for Performance, Accessibility, SEO
- [ ] Fix any Accessibility issues found: alt text, focus rings, colour contrast (minimum 4.5:1), ARIA labels

#### 8.4 Analytics & Monitoring
- [ ] Add GA4 via `@next/third-parties/google` (tree-shake friendly); track: `page_view`, `add_to_cart`, `begin_checkout`, `purchase`
- [ ] Admin dashboard charts now use real Firestore data (already server-rendered — confirm Spark quota not exceeded by projecting query volume)
- [ ] Error monitoring: add `console.error` → Vercel Log Drains (Vercel Hobby supports this); OR integrate Sentry free tier (`@sentry/nextjs`)

#### 8.5 Security Hardening
- [ ] Deploy Firestore Security Rules:
  - `/products`, `/blogs`, `/concerns`, `/categories`: `read = true`, `write = isAdmin()`
  - `/orders/{orderId}`: `read = isOwner() || isAdmin()`, `write = isAuthenticated()`
  - `/users/{uid}/*`: `read = isOwner()`, `write = isOwner()`
  - `/reviews`: `read = true` (approved only — filtered in queries), `write = isAuthenticated()`
  - `/coupons`: `read = false` (server-side only), `write = isAdmin()`
  - `/settings/*`: `read = false`, `write = isAdmin()`
- [ ] All admin API routes: call `verifyIdToken()` + `isAdmin()` at start; return 403 with generic error if either fails
- [ ] All mutation API routes: Zod schema validation at entry point; `stripUnknown: true` (or equivalent) to reject extra fields
- [ ] Shiprocket webhook: reject requests without valid `X-Shiprocket-Hmac-Sha256` header (HMAC-SHA256 of body with `SHIPROCKET_WEBHOOK_SECRET`)
- [ ] Razorpay verify: always re-compute HMAC server-side; never trust a client-provided payment amount — always fetch order amount from Firestore
- [ ] WhatsApp proof upload: validate MIME type (allow only `image/jpeg`, `image/png`, `image/webp`); enforce 5 MB max size; require authenticated session
- [ ] Review flag API: check user hasn't already flagged the same review (query existing flags); max 10 flags per user per hour (Firestore counter)
- [ ] `/dev/seed` + `/dev/unseed`: double-guarded — `middleware.ts` blocks in production AND inside route handler checks `NODE_ENV`
- [ ] Content Security Policy headers: add `next.config.js` `headers()` with strict CSP; allow Razorpay, Firebase, Google Fonts, GA4

#### 8.6 PWA
- [ ] `public/manifest.json` — `name: "Licorice Herbals"`, `short_name: "Licorice"`, icons at 192×192 and 512×512 (brand indigo background, white logo), `theme_color: "#2B1A6B"`, `background_color: "#FAFAF7"`, `display: "standalone"`, `start_url: "/en"`
- [ ] `app/[locale]/layout.tsx` — add `<link rel="manifest">`, `<meta name="theme-color">`, `<link rel="apple-touch-icon">`
- [ ] Service Worker via `next-pwa`: cache static assets + Next.js build output; offline fallback page (`/offline`) with brand styling
- [ ] Generate favicon set: 16×16, 32×32, 48×48 `favicon.ico`; 180×180 Apple touch icon; place in `/public`

#### 8.7 Deployment
- [ ] Create Vercel project; connect GitHub repo; set `main` as production branch; set `develop` as preview branch
- [ ] Add **all** environment variables in Vercel dashboard (Firebase public + admin, Shiprocket, Razorpay, Resend, WhatsApp payment, `NEXT_PUBLIC_APP_URL`, `ADMIN_EMAILS`)
- [ ] Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in Vercel production environment (not in `.env.local`)
- [ ] Configure custom domain in Vercel; verify DNS records; SSL auto-provisioned
- [ ] Verify all API routes complete within **10 seconds** (Vercel Hobby function timeout); add `AbortController` with 8s timeout on Shiprocket API calls as safety margin
- [ ] Run production smoke tests:
  - [ ] Browse shop, open product detail, add to cart
  - [ ] Full WhatsApp payment checkout flow (place order, upload proof, admin confirms)
  - [ ] COD checkout flow
  - [ ] Admin: seed page returns 404 ✓, order status update ✓, inventory adjust ✓
  - [ ] Shiprocket webhook (send test payload) — timeline updates ✓
  - [ ] `/en`, `/hi`, `/mr` all load without error
- [ ] Set up Vercel deployment notifications (Slack / email) for failed deployments
