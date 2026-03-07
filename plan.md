# Licorice Herbals â€” Project Plan

## Overview

A full-stack herbal/ayurvedic e-commerce website built with **Next.js 14 (App Router)**, **Firebase (Firestore + Auth + Storage)**, and **Shiprocket** for shipping. Inspired by weherbal.in â€” includes a complete storefront, admin back-office (inventory, orders, coupons, reviews, tracking, support), customer account area, free consultation booking, corporate gifting, and a blog/diet section.

---

## Tech Stack

| Layer         | Choice                       | Notes                                                          |
| ------------- | ---------------------------- | -------------------------------------------------------------- |
| Framework     | Next.js 14 (App Router)      | SSR + SSG + Server Actions                                     |
| Styling       | Tailwind CSS + CSS Variables | Theme tokens via `constants/theme.ts`                          |
| State         | Zustand                      | Cart, wishlist, auth, UI state                                 |
| Backend/DB    | Firebase Firestore (Spark)   | Free tier only â€” no Cloud Functions required                   |
| Auth          | Firebase Auth (Spark)        | Google + Email/Password + custom role claims via Firestore     |
| Storage       | Firebase Storage (Spark)     | Product images, review photos, blog images (5 GB free)         |
| Shipping      | Shiprocket API + Manual      | API integration + manual override fallback                     |
| Payments      | WhatsApp + Razorpay + COD    | WhatsApp is primary; Razorpay optional, all togglable          |
| Email         | Resend (free 3k/month)       | Order confirmations, support replies â€” called from API routes  |
| Forms         | React Hook Form + Zod        | Client + server validation                                     |
| Animations    | Framer Motion                | Hero, page transitions, micro-interactions                     |
| UI Primitives | Radix UI                     | Dialogs, selects, dropdowns, accordions                        |
| Carousel      | Embla Carousel               | Product sliders, testimonial carousels                         |
| Notifications | React Hot Toast              | Cart, order, error toasts                                      |
| Rich Text     | Tiptap                       | Blog editor + product descriptions in admin                    |
| i18n          | next-intl                    | English, Hindi, Marathi â€” App Router middleware locale routing |
| Deployment    | Vercel Hobby (free)          | Auto-deploy from main branch; API routes replace Cloud Fns     |

---

## Brand & Theme

### Logo (provided)

- Name: **LICORICÃ‰** (with accent)
- Motifs: Circular botanical emblem with leaves + butterfly, loose leaf element
- Style: Elegant, premium, nature-forward luxury

### Product Packaging (confirmed from Keshli photo)

The Keshli Hair Care Tablet bottle confirms the production visual identity:

- **Label background**: deep indigo `#2B1A6B` â€” exact match to `primary` token
- **Typography**: bold gold serif for product name, italic gold script for sub-label â€” matches `accent` token `#C9B99A`
- **Logo placement**: top-centre, white L-with-leaves-butterfly emblem on label
- **Gold border strips**: top and bottom of label â€” use `accent` colour as decorative rule
- **Botanical illustrations**: white line-art herbs, flowers, and a profile illustration of a woman with flowing hair
- **Label layout**: brand â†’ product name â†’ category sub-label â†’ illustration â†’ formulation type + count

### Colour Palette (extracted from logo)

| Token               | Hex       | Usage                                   |
| ------------------- | --------- | --------------------------------------- |
| `primary`           | `#2B1A6B` | Deep royal indigo â€” main brand colour   |
| `primaryForeground` | `#FFFFFF` | Text/icons on primary                   |
| `secondary`         | `#6B4FA0` | Medium purple â€” hover states, accents   |
| `accent`            | `#C9B99A` | Warm champagne/gold â€” highlight, badges |
| `background`        | `#FAFAF7` | Off-white cream â€” page background       |
| `foreground`        | `#1A0F3C` | Very dark purple â€” body text            |
| `muted`             | `#F3F0F8` | Light lavender â€” card backgrounds       |
| `mutedForeground`   | `#6E5F9C` | Subdued text                            |
| `border`            | `#DDD5F0` | Dividers, input borders                 |
| `destructive`       | `#C0392B` | Error / danger                          |
| `success`           | `#2E7D32` | Stock confirmed, order delivered        |

### Typography

| Token     | Font                        | Notes                             |
| --------- | --------------------------- | --------------------------------- |
| `heading` | Cormorant Garamond          | Elegant serif â€” matches logo feel |
| `body`    | Inter                       | Clean sans-serif â€” readability    |
| `accent`  | Cormorant Garamond (italic) | Pull-quotes, taglines             |

> All tokens live in `constants/theme.ts` and are applied as CSS custom properties in `globals.css`. Changing a value there updates the entire site.

---

## Internationalisation (i18n)

### Languages Supported

| Code | Language | Script     | Launch Status      |
| ---- | -------- | ---------- | ------------------ |
| `en` | English  | Latin      | Phase 1 (required) |
| `hi` | Hindi    | Devanagari | Phase 8            |
| `mr` | Marathi  | Devanagari | Phase 8            |

Default locale: `en`. Language switcher rendered in `Navbar` and `MobileMenu`. URL structure: `/en/shop`, `/hi/shop`, `/mr/shop`. `/shop` redirects to `/en/shop` via middleware.

### Library: next-intl

- All routes live under `app/[locale]/` segment
- `middleware.ts` negotiates locale from URL prefix; falls back to `en`
- Server components: `getTranslations(namespace)` â€” Client components: `useTranslations(namespace)`
- All brand copy references **Licorice Herbals** (never weherbal)

### File Structure

```
messages/
â”œâ”€â”€ en.json     â† English (primary â€” must be 100% complete)
â”œâ”€â”€ hi.json     â† Hindi
â””â”€â”€ mr.json     â† Marathi

lib/
â””â”€â”€ i18n.ts     â† supported locales list, LocalizedString type, getLocalizedValue() helper
```

### Translation Namespaces (`messages/en.json` shape)

```json
{
  "nav": {
    "shop": "Shop",
    "blog": "Blog",
    "consultation": "Free Consultation",
    "track": "Track Order"
  },
  "home": {
    "heroTitle": "Pure Ayurvedic Skincare",
    "heroSub": "Rooted in nature. Proven by Ayurveda."
  },
  "product": {
    "addToCart": "Add to Cart",
    "buyNow": "Buy Now",
    "inStock": "In Stock",
    "outOfStock": "Out of Stock"
  },
  "cart": { "empty": "Your cart is empty", "checkout": "Proceed to Checkout" },
  "checkout": {
    "payWhatsApp": "Pay via WhatsApp / UPI",
    "payCOD": "Cash on Delivery",
    "payRazorpay": "Pay Online"
  },
  "concerns": {
    "acne": "Acne & Pimples",
    "pigmentation": "Pigmentation & Melasma",
    "brightening": "Brightening",
    "anti-ageing": "Anti-Ageing",
    "tanning": "Tanning",
    "dryness": "Dryness",
    "hair-care": "Hair Care",
    "blemishes": "Blemishes & Dark Spots"
  },
  "policies": {
    "freeShipping": "Free shipping above â‚¹999",
    "returnWindow": "3-day return policy (damaged/defective only)"
  },
  "account": {
    "orders": "My Orders",
    "wishlist": "Wishlist",
    "addresses": "My Addresses",
    "profile": "My Profile"
  },
  "errors": {
    "outOfStock": "Out of stock",
    "couponInvalid": "Invalid coupon code",
    "pincodeUnserved": "Delivery not available at this pincode"
  },
  "admin": {
    "dashboard": "Dashboard",
    "products": "Products",
    "orders": "Orders",
    "inventory": "Inventory"
  }
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
- Sitemap includes `/en/â€¦`, `/hi/â€¦`, `/mr/â€¦` variants for all indexable pages

---

## Firebase Plan (Free Spark â€” No Blaze Required)

> **Confirmed deployment target**: Firebase **Spark** (free tier) + **Vercel Hobby** (free). No Blaze upgrade, no Cloud Functions. All background logic runs as Next.js API routes or Server Actions on Vercel.

### Spark (Free) quotas:

- Firestore: 1 GiB storage, 50k reads/day, 20k writes/day
- Auth: Unlimited
- Storage: 5 GB, 1 GB/day download
- Hosting: 10 GB/month (unused â€” hosting is on Vercel)

### Vercel Hobby constraints:

- Serverless function timeout: **10 seconds** (all API routes must complete within this)
- Bandwidth: 100 GB/month
- No native cron â€” scheduled tasks (e.g. low-stock alerts) triggered on-demand via admin dashboard
- Auto-deploy from `main` branch on GitHub

### Cloud Function â†’ Server Action / API Route mapping:

| Previously a Cloud Function | Replaced with                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| Shiprocket webhook receiver | `POST /api/shiprocket/webhook` (Next.js API route)                                           |
| Order confirmation email    | `POST /api/order-confirm` (called after payment confirmed)                                   |
| Review rating aggregation   | Server Action in approve-review flow (reads approved reviews, computes average, writes back) |
| Low-stock alert email       | Computed on admin dashboard load; admin triggers email manually                              |
| Coupon expiry cleanup       | Firestore query at coupon validation time (`expiresAt < now`) â€” no background job needed     |
| Shiprocket JWT refresh      | Cached in Firestore with 24h TTL; refreshed lazily on first request after expiry             |

### Firestore Collections (complete):

```
/products/{productId}
  /variants/{variantId}           â† sub-collection for Firestore composite queries

/categories/{categoryId}          â† Face | Body | Hair | Powder | Combo
/concerns/{concernId}             â† Acne | Pigmentation | Dryness | Anti-Ageing | Brightening | etc.

/orders/{orderId}
  /timeline/{eventId}             â† append-only status history log

/users/{userId}
  /cart/{itemId}
  /wishlist/{itemId}
  /addresses/{addressId}
  /consultations/{bookingId}

/reviews/{reviewId}               â† top-level for cross-product queries
/reviewFlags/{flagId}             â† moderation flags

/coupons/{couponCode}
/couponUsage/{usageId}            â† tracks who used what coupon

/blogs/{blogId}                   â† skincare + diet categories
/consultations/{bookingId}        â† free consultation bookings
/supportTickets/{ticketId}        â† customer support
  /messages/{messageId}

/corporateInquiries/{inquiryId}
/newsletter/{subscriberId}
/inventory/{productId}            â† stock ledger (current + reserved)
  /movements/{movementId}         â† stock-in / sale / return / adjustment log

/settings/siteConfig              â† announcement bar, maintenance mode, feature flags, payment method toggles
/settings/shippingRules           â† thresholds, COD rules, zone rates
/settings/paymentSettings         â† which payment methods are enabled (whatsapp, razorpay, cod)
```

---

## Complete Site Structure (Pages)

```
app/
â”œâ”€â”€ (storefront)/
â”‚   â”œâ”€â”€ page.tsx                        â†’ Home
â”‚   â”œâ”€â”€ shop/
â”‚   â”‚   â”œâ”€â”€ page.tsx                    â†’ All Products (filter + sort)
â”‚   â”‚   â””â”€â”€ [category]/page.tsx         â†’ Category: face | body | hair | powder | combo
â”‚   â”œâ”€â”€ concern/
â”‚   â”‚   â””â”€â”€ [concern]/page.tsx          â†’ Shop by Concern (acne, pigmentation, etc.)
â”‚   â”œâ”€â”€ products/
â”‚   â”‚   â””â”€â”€ [slug]/page.tsx             â†’ Product Detail
â”‚   â”œâ”€â”€ combos/page.tsx                 â†’ Combo Packs
â”‚   â”œâ”€â”€ blog/
â”‚   â”‚   â”œâ”€â”€ page.tsx                    â†’ Blog List (skincare + ayurveda)
â”‚   â”‚   â”œâ”€â”€ [slug]/page.tsx             â†’ Blog Post
â”‚   â”‚   â””â”€â”€ diet/page.tsx               â†’ Diet & Lifestyle section
â”‚   â”œâ”€â”€ about/page.tsx
â”‚   â”œâ”€â”€ contact/page.tsx                â†’ Contact form + WhatsApp link
â”‚   â”œâ”€â”€ track/page.tsx                  â†’ Order Tracking (AWB / order ID lookup)
â”‚   â”œâ”€â”€ consultation/page.tsx           â†’ Free Skin & Hair Consultation Booking
â”‚   â”œâ”€â”€ corporate-gifting/page.tsx      â†’ Corporate Gifting inquiry form
â”‚   â”œâ”€â”€ search/page.tsx                 â†’ Search Results
â”‚   â””â”€â”€ (policies)/
â”‚       â”œâ”€â”€ shipping-policy/page.tsx
â”‚       â”œâ”€â”€ refund-policy/page.tsx
â”‚       â””â”€â”€ terms/page.tsx
â”‚
â”œâ”€â”€ (auth)/
â”‚   â”œâ”€â”€ login/page.tsx
â”‚   â””â”€â”€ register/page.tsx
â”‚
â”œâ”€â”€ (account)/
â”‚   â”œâ”€â”€ account/page.tsx                â†’ Dashboard (recent orders, quick links)
â”‚   â”œâ”€â”€ account/orders/page.tsx         â†’ Order history list
â”‚   â”œâ”€â”€ account/orders/[id]/page.tsx    â†’ Order detail + live tracking
â”‚   â”œâ”€â”€ account/wishlist/page.tsx
â”‚   â”œâ”€â”€ account/addresses/page.tsx
â”‚   â”œâ”€â”€ account/profile/page.tsx        â†’ Edit name, email, phone, password
â”‚   â””â”€â”€ checkout/page.tsx              â†’ Multi-step: Cart â†’ Address â†’ Shipping â†’ Payment â†’ Confirm
â”‚
â””â”€â”€ (admin)/
    â””â”€â”€ admin/
        â”œâ”€â”€ page.tsx                    â†’ Dashboard (stats, charts, alerts)
        â”œâ”€â”€ products/
        â”‚   â”œâ”€â”€ page.tsx                â†’ Product list (search, filter, bulk actions)
        â”‚   â”œâ”€â”€ new/page.tsx            â†’ Create product
        â”‚   â””â”€â”€ [id]/page.tsx           â†’ Edit product
        â”œâ”€â”€ inventory/
        â”‚   â”œâ”€â”€ page.tsx                â†’ Stock overview (all variants, low-stock alerts)
        â”‚   â””â”€â”€ [productId]/page.tsx    â†’ Per-product stock ledger + adjust
        â”œâ”€â”€ orders/
        â”‚   â”œâ”€â”€ page.tsx                â†’ Order list (filter by status, search by ID/name)
        â”‚   â””â”€â”€ [id]/page.tsx           â†’ Order detail: view, update status, ship, refund
        â”œâ”€â”€ coupons/
        â”‚   â”œâ”€â”€ page.tsx                â†’ Coupon list
        â”‚   â””â”€â”€ new/page.tsx            â†’ Create/edit coupon
        â”œâ”€â”€ reviews/
        â”‚   â”œâ”€â”€ page.tsx                â†’ All reviews (pending approval queue)
        â”‚   â””â”€â”€ [id]/page.tsx           â†’ Review detail: approve / reject / reply
        â”œâ”€â”€ blogs/
        â”‚   â”œâ”€â”€ page.tsx
        â”‚   â”œâ”€â”€ new/page.tsx
        â”‚   â””â”€â”€ [id]/page.tsx
        â”œâ”€â”€ consultations/page.tsx      â†’ Booking list: upcoming, completed
        â”œâ”€â”€ support/
        â”‚   â”œâ”€â”€ page.tsx                â†’ Support ticket inbox
        â”‚   â””â”€â”€ [ticketId]/page.tsx     â†’ Ticket thread + reply
        â”œâ”€â”€ corporate/page.tsx          â†’ Corporate inquiry list
        â”œâ”€â”€ newsletter/page.tsx         â†’ Subscriber list + export CSV
        â”œâ”€â”€ settings/page.tsx           â†’ Site config, shipping rules, announcement bar, payment method toggles
        â””â”€â”€ settings/payments/page.tsx  â†’ Enable/disable WhatsApp, Razorpay, COD independently

â”œâ”€â”€ (dev)/                               â† middleware returns 404 in production
â”‚   â””â”€â”€ dev/
â”‚       â””â”€â”€ seed/page.tsx               â†’ Upsert / delete seed docs by known IDs (dev only)

api/
â”œâ”€â”€ shiprocket/
â”‚   â”œâ”€â”€ token/route.ts              â†’ Fetch + cache Shiprocket JWT in Firestore (24h TTL)
â”‚   â”œâ”€â”€ create-order/route.ts       â†’ Create shipment after payment confirmed
â”‚   â”œâ”€â”€ cancel-order/route.ts
â”‚   â”œâ”€â”€ track/route.ts              â†’ Proxy tracking by AWB / order ID
â”‚   â””â”€â”€ webhook/route.ts            â†’ Receive + validate Shiprocket status updates
â”œâ”€â”€ payment/
â”‚   â”œâ”€â”€ razorpay/
â”‚   â”‚   â”œâ”€â”€ create-order/route.ts   â†’ Create Razorpay order (only if enabled in settings)
â”‚   â”‚   â””â”€â”€ verify/route.ts         â†’ HMAC signature verification
â”‚   â””â”€â”€ whatsapp/
â”‚       â””â”€â”€ submit-proof/route.ts   â†’ Customer uploads payment screenshot â†’ stored in Firebase Storage
â”œâ”€â”€ order-confirm/route.ts          â†’ Sends confirmation email via Resend after payment verified
â”œâ”€â”€ pincode-check/route.ts          â†’ Shiprocket serviceability + ETA
â”œâ”€â”€ newsletter/route.ts
â”œâ”€â”€ contact/route.ts
â””â”€â”€ review/
    â””â”€â”€ flag/route.ts               â†’ Report abusive review
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
  rating: number; // denormalised average â€” updated by Server Action when admin approves a review
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
  weight: number; // grams â€” required for Shiprocket
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
// See lib/i18n.ts â†’ LocalizedString + getLocalizedValue()
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
  codFee: number; // â‚¹50 if COD
  total: number;

  // Payment
  paymentMethod: "whatsapp" | "razorpay" | "cod";
  paymentStatus:
    | "pending_whatsapp" // customer chose WhatsApp â€” awaiting proof
    | "proof_submitted" // customer sent proof, admin needs to confirm
    | "pending" // COD â€” pending delivery
    | "paid" // confirmed by admin (WhatsApp) or gateway callback
    | "failed"
    | "refunded"
    | "partially_refunded";
  paymentId?: string; // Razorpay transaction ID (if applicable)
  paymentSignature?: string; // HMAC for Razorpay verification
  whatsappProofImageUrl?: string; // Firebase Storage URL of payment screenshot (if submitted)
  whatsappConfirmedBy?: string; // admin userId who confirmed WhatsApp payment
  whatsappConfirmedAt?: Timestamp;

  // Order Status
  orderStatus:
    | "draft" // cart â†’ checkout started
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
  value: number; // percentage (0-100) or flat â‚¹ amount
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

  rating: number; // 1â€“5
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
  category: "order" | "shipping" | "product" | "return" | "payment" | "consultation" | "other";
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
     â†“
stock_in movement recorded                    (admin panel)
     â†“
Product variant stock updated                 (Firestore atomic increment)
     â†“
Customer adds to cart
     â†“
reserved movement on checkout initiation      (prevents overselling)
     â†“
Payment success â†’ sale movement
released movement removed
     â†“
Payment fail / timeout (15 min) â†’ release reservation
     â†“
Return approved â†’ return movement
stock restored
```

### Admin Inventory UI

- **Stock Overview** table: all products Ã— variants, colour-coded by stock level
  - Red = 0 (out of stock)
  - Amber = below `lowStockThreshold`
  - Green = healthy
- **Low Stock Alerts**: computed on admin dashboard load; admin can trigger a summary email from the dashboard (no Cloud Functions â€” Spark tier)
- **Stock Adjustment**: admin can add/remove manually with a note (damaged, lost, gift sample)
- **Stock Ledger**: per-variant history of all movements with timestamps + reasons
- **Bulk Import**: CSV upload to update stock across all variants at once
- **Reorder Trigger**: `reorderPoint` field â€” when stock drops below, system flags it

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
- **WhatsApp Payment Confirm button**: appears when `paymentStatus === "proof_submitted"` or `"pending_whatsapp"` â€” admin clicks â†’ sets `paymentStatus: "paid"`, records `whatsappConfirmedBy` + timestamp, triggers order confirmation email
- **Payment proof viewer**: shows submitted screenshot inline (if customer uploaded it), plus WhatsApp conversation deep-link button
- **Ship with Shiprocket**: one-click button that calls Shiprocket API â†’ gets AWB + courier
- **Manual Shipping override**: enter courier name + AWB when Shiprocket fails
- **Pincode serviceability check**: inline check before shipping
- **Refund**: enter partial/full refund amount â†’ for WhatsApp orders, records manual refund note; for Razorpay, calls gateway API
- **Timeline**: full history of status changes with source (system / shiprocket webhook / admin / whatsapp)
- **Internal notes**: admin-only notes visible only in admin panel
- **Invoice download**: auto-generated PDF
- **Resend order confirmation email**: button for support cases
- **Initiate return**: when customer requests it â†’ triggers return pickup with Shiprocket

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
| Standard               | 5-7 business days | Free above â‚¹999, else â‚¹80        |
| Express                | 2-3 business days | Additional charge by weight+zone |
| Same Day (Mumbai only) | Same day          | Additional charge                |
| COD                    | Standard SLA      | +â‚¹50 COD fee                     |

**Processing time**: 1-2 business days. Orders placed on weekends/holidays â†’ next business day.

> **Currency**: All transactions are in **INR (â‚¹)** only. International shipping is out of scope for the current launch â€” domestic India only.

### Shiprocket Integration Flow

```
1. Order placed (payment success / COD confirmed)
         â†“
2. Server Action: POST /api/shiprocket/token   (JWT cached in Redis/Firestore, valid 24h)
         â†“
3. Server Action: POST /api/shiprocket/create-order
   â†’ Payload: items (name, sku, units, price), addresses, weight, dimensions
   â†’ Response: shiprocket_order_id, shipment_id, courier recommendation
         â†“
4. (Optional) Courier assignment: if auto-assignment off, admin picks courier in admin panel
         â†“
5. AWB generated â†’ stored in order doc
         â†“
6. Shiprocket webhook (POST /api/shiprocket/webhook)
   â†’ Validates HMAC signature
   â†’ Writes to /orders/{id}/timeline
   â†’ Updates top-level orderStatus
   â†’ Sends customer notification (email + optional WhatsApp)
         â†“
7. Customer tracks via /track?awb=XXX  or  /account/orders/[id]
```

### Pincode Serviceability Check

- On checkout address entry: `POST /api/pincode-check` â†’ Shiprocket serviceability API
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
- Works entirely within Firebase Spark + Vercel Hobby â€” no paid payment gateway needed
- Admin has full control: manually confirm after viewing proof
- Common and trusted for small Indian D2C brands

### Customer Flow

```
1. Customer selects "Pay via WhatsApp / UPI" at checkout
         â†“
2. Order created in Firestore:
   paymentMethod: "whatsapp"
   paymentStatus: "pending_whatsapp"
   orderStatus: "draft"
         â†“
3. Customer sees payment instructions page:
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚  Pay â‚¹X to:                             â”‚
   â”‚  UPI ID: licoriceherbal@upi             â”‚
   â”‚  Or scan QR code                        â”‚
   â”‚                                         â”‚
   â”‚  After paying, WhatsApp us the          â”‚
   â”‚  screenshot + your Order #LH-0001       â”‚
   â”‚  â†’ [Open WhatsApp]                      â”‚
   â”‚                                         â”‚
   â”‚  (Optional) Upload screenshot here â†‘   â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â†“
4. Customer sends screenshot on WhatsApp to business number
         â†“
5. (Optional) Customer uploads screenshot via "Submit Proof" button
   â†’ stored in Firebase Storage at /payment-proofs/{orderId}.jpg
   â†’ paymentStatus updated to "proof_submitted"
         â†“
6. Admin sees alert on dashboard:
   "3 WhatsApp payments pending confirmation"
         â†“
7. Admin opens order â†’ views proof image â†’ clicks "Confirm Payment"
   â†’ paymentStatus: "paid"
   â†’ orderStatus: "confirmed"
   â†’ whatsappConfirmedBy: adminUserId
   â†’ whatsappConfirmedAt: now
   â†’ Order confirmation email sent via Resend
   â†’ Shiprocket order creation triggered
         â†“
8. Customer receives email: "Your order is confirmed!"
```

### Admin WhatsApp Payment Dashboard Widget

- **Pending WhatsApp Payments** card on admin home â€” count badge
- Filter on Orders list: `paymentMethod = whatsapp AND paymentStatus IN [pending_whatsapp, proof_submitted]`
- Bulk confirm button for verified payments
- If payment not received after 24h: admin can cancel order (stock reservation released)

### Payment Method Toggle (Admin Settings)

Stored in `/settings/paymentSettings` Firestore doc:

```ts
interface PaymentSettings {
  whatsappEnabled: boolean; // default: true
  whatsappUpiId: string; // shown to customer on payment screen
  whatsappBusinessNumber: string; // pre-filled WhatsApp message target
  whatsappQrImageUrl?: string; // optional QR code image (Firebase Storage)
  razorpayEnabled: boolean; // default: false (enable when account ready)
  codEnabled: boolean; // default: true
  codFee: number; // default: 50
  codMinOrder?: number; // minimum order for COD eligibility
  prepaidDiscountPercent?: number; // e.g. 5 â€” "Save 5% on prepaid orders"
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
| `flat`          | e.g. â‚¹500 off                            |
| `free_shipping` | waives shipping charge                   |
| `buy_x_get_y`   | e.g. Buy 2 get 1 free (specific product) |

### Validation Rules (server-side, in Server Action)

1. Coupon exists and `isActive = true`
2. Current time is between `startsAt` and `expiresAt`
3. Cart total â‰¥ `minOrderValue`
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
3. Review stored with `status: "pending"` â€” not visible on storefront until approved
4. Admin receives notification of pending review
5. Admin approves/rejects (with reason)
6. On approval: product `rating` + `reviewCount` updated by the approve-review Server Action (reads all approved reviews for the product, computes average, writes back â€” no Cloud Function needed)
7. Admin can reply to approved reviews (reply shown publicly below review)

### Storefront Review Display

- Average rating + star distribution bar (like Amazon/weherbal.in)
- Filter by: star rating, verified purchase, with photos
- Sort by: most recent, most helpful, highest rating, lowest rating
- Pagination / "Load more"
- Verified Purchase badge
- Customer photo gallery (lightbox)
- "Was this helpful?" thumbs up/down
- "Report review" link â†’ creates `reviewFlag`
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
Order Placed â†’ Payment Confirmed â†’ Processing â†’ Packed â†’ Ready to Ship
â†’ Picked Up â†’ In Transit â†’ Out for Delivery â†’ Delivered
```

Each event shows: status, timestamp, location (if available from courier scan), source.

---

## Customer Support System

### Support Ticket Features

- Customer can open a ticket from:
  - Account â†’ My Orders â†’ [order] â†’ "Get Help"
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

- Contact form â†’ creates support ticket
- WhatsApp deep link (`api.whatsapp.com/send?phone=...`)
- Support hours clearly displayed

---

## Free Consultation System

### Booking Flow

1. Customer fills form: name, email, phone, concerns (checkboxes), preferred date/time, message
2. Booking stored in `/consultations` with `status: pending`
3. Admin sees booking in admin â†’ Consultations panel
4. Admin confirms â†’ customer gets email/WhatsApp confirmation with link/time
5. After consultation: admin marks `completed`, can add internal notes
6. Post-consultation: automated email with recommended products (linkable)

### Admin Consultation Panel

- Upcoming bookings calendar / list view
- Status: Pending â†’ Confirmed â†’ Completed / Cancelled
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
- Comment section (optional phase 2 â€” Firebase Firestore backed)

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

1. **Image Gallery** â€” zoomable, multi-photo, thumbnail strip, up to 8 images
2. **Title + Brand + Rating summary** (stars + review count, links to review section)
3. **Price** â€” sale price + compare-at (strike-through) + savings badge
4. **Variant Selector** â€” size/pack options (e.g. 10ml | 20ml)
5. **Quantity Selector**
6. **Add to Cart + Buy Now buttons**
7. **Product Badges** â€” No Artificial Chemicals | Cruelty Free | Ayurvedic | Paraben Free
8. **EMI / Pay Later widget** (Snapmint or Razorpay EMI â€” optional)
9. **Active Promo banners** â€” e.g. "5% off on prepaid orders", coupon codes
10. **Buy More Save More** â€” upsell products with bundled discount
11. **Tabbed content section**:
    - Key Benefits (bullet points)
    - Ingredients (with individual ingredient benefits)
    - How To Use (numbered steps)
    - FAQs (accordion)
12. **About the product** â€” extended description
13. **Certifications row** â€” icon badges
14. **Customer Reviews** â€” full review section (see Reviews System)
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

All colours, fonts, spacing tokens live in `constants/theme.ts` â†’ referenced by `globals.css` CSS variables â†’ used in `tailwind.config.ts`. Swap theme in one file; everything updates.

```
constants/
â”œâ”€â”€ theme.ts          â†’ color tokens, font names, spacing, radius
â”œâ”€â”€ site.ts           â†’ brand name (Licorice Herbals), tagline, contact, social links, nav items
â”œâ”€â”€ policies.ts       â†’ free-shipping threshold, COD fee, return window, processing days
â””â”€â”€ categories.ts     â†’ product categories + concern definitions

messages/
â”œâ”€â”€ en.json           â†’ English UI strings (required baseline â€” 100% complete)
â”œâ”€â”€ hi.json           â†’ Hindi UI strings
â””â”€â”€ mr.json           â†’ Marathi UI strings

lib/
â”œâ”€â”€ i18n.ts           â†’ LocalizedString type, getLocalizedValue() helper, supported locales array
â”œâ”€â”€ db.ts             â†’ unified data-access layer (Firestore with automatic mock fallback)
â””â”€â”€ mocks/            â†’ in-memory seed data, identical TypeScript types as live Firestore data
    â”œâ”€â”€ index.ts      â†’ SEED_MAP: Record<collection, SeedDoc[]> â€” used by seed API and db.ts fallback
    â”œâ”€â”€ products.ts
    â”œâ”€â”€ categories.ts
    â”œâ”€â”€ concerns.ts
    â”œâ”€â”€ reviews.ts
    â”œâ”€â”€ coupons.ts
    â”œâ”€â”€ blogs.ts
    â””â”€â”€ settings.ts
```

### Component Tree

```
components/
â”œâ”€â”€ ui/               â† Design-system primitives (100% reusable)
â”‚   â”œâ”€â”€ Button.tsx
â”‚   â”œâ”€â”€ Badge.tsx
â”‚   â”œâ”€â”€ Input.tsx
â”‚   â”œâ”€â”€ Select.tsx
â”‚   â”œâ”€â”€ Textarea.tsx
â”‚   â”œâ”€â”€ Modal.tsx
â”‚   â”œâ”€â”€ Drawer.tsx
â”‚   â”œâ”€â”€ Skeleton.tsx
â”‚   â”œâ”€â”€ StarRating.tsx
â”‚   â”œâ”€â”€ CountdownTimer.tsx
â”‚   â”œâ”€â”€ SectionHeading.tsx
â”‚   â”œâ”€â”€ Pagination.tsx
â”‚   â”œâ”€â”€ ImageLightbox.tsx
â”‚   â”œâ”€â”€ Breadcrumb.tsx
â”‚   â””â”€â”€ StatusBadge.tsx           â† order/ticket/review status colours
â”‚
â”œâ”€â”€ layout/
â”‚   â”œâ”€â”€ Navbar.tsx
â”‚   â”œâ”€â”€ MobileMenu.tsx
â”‚   â”œâ”€â”€ Footer.tsx
â”‚   â”œâ”€â”€ AnnouncementBar.tsx
â”‚   â”œâ”€â”€ CartDrawer.tsx
â”‚   â””â”€â”€ LanguageSwitcher.tsx      â† EN / à¤¹à¤¿à¤‚ / à¤®à¤° dropdown, persists to cookie
â”‚
â”œâ”€â”€ home/
â”‚   â”œâ”€â”€ HeroBanner.tsx
â”‚   â”œâ”€â”€ ProductCarousel.tsx
â”‚   â”œâ”€â”€ CategoryGrid.tsx
â”‚   â”œâ”€â”€ BeforeAfterSlider.tsx
â”‚   â”œâ”€â”€ BrandValues.tsx           â† trust icons row
â”‚   â”œâ”€â”€ TestimonialsCarousel.tsx
â”‚   â”œâ”€â”€ BlogPreview.tsx
â”‚   â””â”€â”€ NewsletterBanner.tsx
â”‚
â”œâ”€â”€ product/
â”‚   â”œâ”€â”€ ProductCard.tsx
â”‚   â”œâ”€â”€ ProductGrid.tsx
â”‚   â”œâ”€â”€ ProductFilters.tsx
â”‚   â”œâ”€â”€ ProductSort.tsx
â”‚   â”œâ”€â”€ ProductImages.tsx
â”‚   â”œâ”€â”€ ProductInfo.tsx
â”‚   â”œâ”€â”€ VariantSelector.tsx
â”‚   â”œâ”€â”€ QuantitySelector.tsx
â”‚   â”œâ”€â”€ ProductBadges.tsx
â”‚   â”œâ”€â”€ BuyMoreSaveMore.tsx
â”‚   â”œâ”€â”€ ProductTabs.tsx           â† Benefits / Ingredients / How To Use / FAQs
â”‚   â”œâ”€â”€ RelatedProducts.tsx
â”‚   â”œâ”€â”€ ReviewCard.tsx
â”‚   â”œâ”€â”€ ReviewsList.tsx
â”‚   â”œâ”€â”€ ReviewFilters.tsx
â”‚   â”œâ”€â”€ ReviewPhotoGallery.tsx
â”‚   â””â”€â”€ AddReviewForm.tsx
â”‚
â”œâ”€â”€ cart/
â”‚   â”œâ”€â”€ CartItem.tsx
â”‚   â”œâ”€â”€ CartSummary.tsx
â”‚   â””â”€â”€ CouponInput.tsx
â”‚
â”œâ”€â”€ checkout/
â”‚   â”œâ”€â”€ CheckoutStepper.tsx
â”‚   â”œâ”€â”€ AddressForm.tsx
â”‚   â”œâ”€â”€ AddressList.tsx
â”‚   â”œâ”€â”€ ShippingOptions.tsx             â† standard / express / same-day
â”‚   â”œâ”€â”€ PincodeChecker.tsx
â”‚   â”œâ”€â”€ PaymentOptions.tsx              â† renders only methods enabled in /settings/paymentSettings
â”‚   â”œâ”€â”€ WhatsAppPaymentInstructions.tsx â† shown after order placed via WhatsApp method
â”‚   â”œâ”€â”€ WhatsAppProofUpload.tsx         â† optional: customer uploads screenshot
â”‚   â””â”€â”€ OrderSummary.tsx
â”‚
â”œâ”€â”€ account/
â”‚   â”œâ”€â”€ OrderCard.tsx
â”‚   â”œâ”€â”€ OrderTimeline.tsx         â† tracking timeline steps
â”‚   â”œâ”€â”€ AddressCard.tsx
â”‚   â””â”€â”€ WishlistItem.tsx
â”‚
â”œâ”€â”€ blog/
â”‚   â”œâ”€â”€ BlogCard.tsx
â”‚   â”œâ”€â”€ BlogContent.tsx
â”‚   â””â”€â”€ RelatedPosts.tsx
â”‚
â”œâ”€â”€ support/
â”‚   â”œâ”€â”€ TicketCard.tsx
â”‚   â””â”€â”€ TicketThread.tsx
â”‚
â””â”€â”€ admin/                        â† Admin-only components
    â”œâ”€â”€ StatsCard.tsx
    â”œâ”€â”€ DataTable.tsx                   â† reusable sortable/filterable table
    â”œâ”€â”€ OrderStatusSelect.tsx
    â”œâ”€â”€ WhatsAppPaymentConfirm.tsx      â† "Confirm Payment" button + proof image viewer
    â”œâ”€â”€ PaymentMethodToggle.tsx         â† enable/disable WhatsApp / Razorpay / COD
    â”œâ”€â”€ InventoryRow.tsx
    â”œâ”€â”€ StockAdjustModal.tsx
    â”œâ”€â”€ ShipOrderModal.tsx              â† Shiprocket / manual shipping
    â”œâ”€â”€ RefundModal.tsx
    â”œâ”€â”€ ReviewModerationCard.tsx
    â”œâ”€â”€ CouponForm.tsx
    â”œâ”€â”€ ProductForm.tsx                 â† full product create/edit form
    â”œâ”€â”€ VariantManager.tsx
    â”œâ”€â”€ RichTextEditor.tsx              â† Tiptap wrapper
    â”œâ”€â”€ ImageUploader.tsx               â† Firebase Storage drag-and-drop
    â”œâ”€â”€ TicketInbox.tsx
    â””â”€â”€ ConsultationCard.tsx
```

---

## Shipping Logic (constants/policies.ts)

```
Domestic Orders:
  freeShippingThreshold: â‚¹999
  standardShippingRate: â‚¹80
  codFee: â‚¹50
  expressAvailable: true (WhatsApp order for now, or Shiprocket express)
  sameDayAvailable: true (Mumbai pincodes only)
  processingDays: 1-2
  standardSLA: "5-7 business days"
  expressSLA: "2-3 business days"

// International shipping: not in scope for current launch â€” INR / domestic India only

Refund Policy:
  returnWindow: 3           (days from delivery)
  returnEligibility: "damaged_defective_wrong_expired_only"
  replacementSLA: 24        (hours after return received)
```

---

### Environment Variables Needed

```env
# Firebase (Spark â€” free tier, no Blaze required)
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

# Payments â€” Razorpay is optional (can be disabled in admin settings)
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

- [x] Brand logo â€” **provided** (LICORICÃ‰, deep indigo, botanical/butterfly motif)
- [x] Colour palette â€” **extracted from logo** (see Brand & Theme section above)
- [ ] Font confirmation â€” default plan: Cormorant Garamond (heading) + Inter (body)
- [ ] Product catalogue (names, prices, images, descriptions, variants)
- [ ] Translations â€” Hindi and Marathi for product names, descriptions, benefits, FAQs, blog posts (English is the required baseline; other locales are optional at launch and can be added progressively via the admin product form's EN | HI | MR tab strip)
- [ ] Contact details (customer support phone + email)
- [ ] WhatsApp business number for payments (+ UPI ID to show customers)
- [ ] Social media handles (Instagram, Facebook, YouTube, LinkedIn)
- [ ] Razorpay account credentials (optional â€” can launch WhatsApp + COD only)
- [ ] Firebase project credentials (create at console.firebase.google.com, Spark plan)
- [ ] Shiprocket account credentials
- [ ] Domain name
- [ ] Free shipping threshold (default: â‚¹999)
- [ ] COD preference (default: enabled, +â‚¹50 fee)
- [ ] Return/refund policy (default: 3 days, damaged/defective only)
- [ ] Support hours (default: Monâ€“Sat 9:30amâ€“6:30pm IST)
- [ ] Consultant name + bio (for free consultation page)
- [ ] Corporate gifting: launch from day 1 or phase 2?
- [ ] Translations â€” Hindi + Marathi for product names, descriptions, benefits, FAQs (English is the required baseline; other locales are optional at launch and can be added progressively)

---

## Seed Data

All seed data is branded as **Licorice Herbals** (no weherbal references anywhere). English is the baseline; Hindi/Marathi translations for seed content are added in Phase 8.

### Deterministic IDs

Every seed document uses a stable, human-readable ID so upserts are idempotent and deletes are surgical (only seed-owned IDs are ever touched):

| Collection   | Example Seed IDs                                                                 |
| ------------ | -------------------------------------------------------------------------------- |
| `products`   | `prod_kumkumadi_oil`, `prod_brightening_ubtan`, `prod_hair_repair_oil`, â€¦        |
| `categories` | `cat_face`, `cat_body`, `cat_hair`, `cat_powder`, `cat_combo`, `cat_supplements` |
| `concerns`   | `concern_acne`, `concern_pigmentation`, `concern_brightening`, â€¦                 |
| `coupons`    | `WELCOME10`, `LICORICE20`, `FREESHIP`                                            |
| `blogs`      | `blog_kumkumadi_benefits`, `blog_ubtan_guide`, `blog_ayurvedic_hair`             |
| `reviews`    | `rev_kumkumadi_1`, `rev_kumkumadi_2`, `rev_vitc_1`, â€¦                            |
| `inventory`  | same ID as product (`prod_kumkumadi_oil`, â€¦)                                     |
| `settings`   | `siteConfig`, `shippingRules`, `paymentSettings` (fixed well-known IDs)          |

### Seed Products (10 â€” 9 inspired by product range + 1 confirmed from product photo)

| ID                        | Name                                 | Category        | Concerns                               | Variants                                                  |
| ------------------------- | ------------------------------------ | --------------- | -------------------------------------- | --------------------------------------------------------- |
| `prod_kumkumadi_oil`      | Licorice Kumkumadi Face Oil          | face            | brightening, anti-ageing, pigmentation | 10 ml / 20 ml                                             |
| `prod_brightening_ubtan`  | Licorice Brightening Ubtan           | powder          | brightening, tanning, pigmentation     | 50 g / 100 g                                              |
| `prod_hair_repair_oil`    | Licorice Hair Repair & Growth Oil    | hair            | hair-care                              | 100 ml / 200 ml                                           |
| `prod_neem_face_wash`     | Licorice Neem & Tulsi Face Wash      | face            | acne                                   | 100 ml                                                    |
| `prod_vitamin_c_serum`    | Licorice 20% Vitamin C Serum         | face            | brightening, pigmentation              | 15 ml / 30 ml                                             |
| `prod_under_eye_elixir`   | Licorice Under Eye Elixir            | face            | anti-ageing, dryness                   | 10 ml                                                     |
| `prod_spf50_sunscreen`    | Licorice Daily Sunscreen SPF50       | face            | tanning                                | 50 g                                                      |
| `prod_body_butter`        | Licorice Hydrating Body Butter       | body            | dryness                                | 100 g / 200 g                                             |
| `prod_glow_bundle`        | Licorice Glow Bundle                 | combo           | brightening, anti-ageing               | fixed combo (Kumkumadi Oil 10 ml + Vitamin C Serum 15 ml) |
| **`prod_keshli_tablets`** | **Licorice Keshli Hair Care Tablet** | **supplements** | **hair-care**                          | **60 tablets / 120 tablets**                              |

> `prod_keshli_tablets` is a **confirmed real product** (photo provided). It is an oral Keehovedic (Ayurvedic) hair supplement â€” not a topical product. Seed data should reflect: formulation = tablet, weight used only for shipping (approx 150 g / 280 g), no variant images needed beyond the bottle photo.

### Seed Concerns (8)

`concern_anti_ageing` Â· `concern_pigmentation` Â· `concern_acne` Â· `concern_brightening` Â· `concern_tanning` Â· `concern_dryness` Â· `concern_hair_care` Â· `concern_blemishes`

### Seed Categories (6)

| ID                | Label       | Includes                                |
| ----------------- | ----------- | --------------------------------------- |
| `cat_face`        | Face Care   | Oils, serums, face washes, sunscreens   |
| `cat_body`        | Body Care   | Body butters, lotions                   |
| `cat_hair`        | Hair Care   | Topical hair oils                       |
| `cat_powder`      | Powder      | Ubtans, face packs                      |
| `cat_combo`       | Combo Packs | Bundled products                        |
| `cat_supplements` | Supplements | Oral tablets and capsules (e.g. Keshli) |

### Seed Coupons (3)

| Code         | Type          | Value | Min Order | Notes                       |
| ------------ | ------------- | ----- | --------- | --------------------------- |
| `WELCOME10`  | percentage    | 10%   | â‚¹500      | First-order; 1 use per user |
| `LICORICE20` | flat          | â‚¹200  | â‚¹999      | Recurring promo             |
| `FREESHIP`   | free_shipping | â€”     | â‚¹500      | Waives shipping charge      |

### Seed Blog Posts (3)

| ID                        | Title (EN)                                             | Category  |
| ------------------------- | ------------------------------------------------------ | --------- |
| `blog_kumkumadi_benefits` | 7 Reasons Kumkumadi Oil Is Ayurveda's Best-Kept Secret | skincare  |
| `blog_ubtan_guide`        | How to Use Ubtan for Glowing Skin at Home              | skincare  |
| `blog_ayurvedic_hair`     | The Ayurvedic Guide to Healthy, Strong Hair            | hair-care |

### Seed Reviews (8 â€” 2 per flagship product, all approved)

| ID                | Product                | Rating | Verified Purchase |
| ----------------- | ---------------------- | ------ | ----------------- |
| `rev_kumkumadi_1` | prod_kumkumadi_oil     | 5      | true              |
| `rev_kumkumadi_2` | prod_kumkumadi_oil     | 4      | true              |
| `rev_ubtan_1`     | prod_brightening_ubtan | 5      | true              |
| `rev_ubtan_2`     | prod_brightening_ubtan | 4      | false             |
| `rev_vitc_1`      | prod_vitamin_c_serum   | 5      | true              |
| `rev_vitc_2`      | prod_vitamin_c_serum   | 4      | true              |
| `rev_keshli_1`    | prod_keshli_tablets    | 5      | true              |
| `rev_keshli_2`    | prod_keshli_tablets    | 4      | true              |

---

## Firebase Fallback / Mock Layer

### Purpose

If Firebase env vars are absent or Firestore is unreachable (fresh clone, CI, no internet), the app falls back to the in-memory seed data instead of crashing. The fallback is transparent â€” every component gets the same TypeScript types regardless of data source.

### Unified Data-Access Layer (`lib/db.ts`)

```ts
// lib/db.ts â€” all Server Components and Server Actions import from here, never from Firestore directly
export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  if (!isFirebaseReady()) return filterMockProducts(SEED_PRODUCTS, filters);
  try {
    const snap = await getDocs(buildProductQuery(filters));
    return snap.docs.map((d) => d.data() as Product);
  } catch (err) {
    console.warn("[db] Firestore error â€” falling back to mock data", err);
    return filterMockProducts(SEED_PRODUCTS, filters);
  }
}

function isFirebaseReady(): boolean {
  // Force mock mode with env var (useful for UI-only development)
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") return false;
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  );
}
```

- `NEXT_PUBLIC_USE_MOCK_DATA=true` forces mock mode without touching Firebase config
- Mock data has identical TypeScript types â€” no drift possible
- Same pattern repeated for `getProduct()`, `getOrders()`, `getCoupons()`, `getBlogs()`, etc.

### When Mock Data Is Used

| Scenario                         | Behaviour                                       |
| -------------------------------- | ----------------------------------------------- |
| No Firebase env vars             | Silently serves mock data                       |
| `NEXT_PUBLIC_USE_MOCK_DATA=true` | Forces mock data even if Firebase is configured |
| Firestore read throws            | Catches error, falls back to mock, logs warning |
| Production with valid Firebase   | Never uses mocks                                |

---

## Dev Seed Page (`/dev/seed`)

### Purpose

Browser-based tool (development only) to populate or wipe Firestore with known seed data in one click. Useful for setting up a fresh Firebase project, resetting test state, or onboarding new developers.

### Security

- `middleware.ts` matches `/dev/*` and returns `NextResponse.next()` only in `development`; returns 404 in `production` and `test`
- No authentication required in development
- The API routes (`/api/dev/seed`, `/api/dev/unseed`) also check `process.env.NODE_ENV === 'production'` and return 404 â€” double guard

### Page UI

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸŒ± Licorice Herbals â€” Seed Database           [Dev Only]    â”‚
â”‚                                                              â”‚
â”‚  Collection         Docs    Actions                          â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                   â”‚
â”‚  Products             10     [Seed â†‘]  [Delete âœ•]            â”‚
â”‚  Categories           6     [Seed â†‘]  [Delete âœ•]            â”‚
â”‚  Concerns             8     [Seed â†‘]  [Delete âœ•]            â”‚
â”‚  Coupons              3     [Seed â†‘]  [Delete âœ•]            â”‚
â”‚  Blog Posts           3     [Seed â†‘]  [Delete âœ•]            â”‚
â”‚  Reviews              8     [Seed â†‘]  [Delete âœ•]            â”‚
â”‚  Settings             3     [Seed â†‘]  [Delete âœ•]            â”‚
â”‚  Inventory            10     [Seed â†‘]  [Delete âœ•]            â”‚
â”‚                                                              â”‚
â”‚  [Seed All Collections]    [Delete All Seed Data]            â”‚
â”‚                                                              â”‚
â”‚  âœ… Last action: Seeded 9 products â€” 2026-03-07 10:05 IST    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### API Routes

```
app/api/dev/
â”œâ”€â”€ seed/route.ts     â†’ POST { collections: string[] } â€” upserts seed docs by known ID
â””â”€â”€ unseed/route.ts   â†’ POST { collections: string[] } â€” deletes seed docs by known ID
```

### Upsert (idempotent â€” safe to run repeatedly)

```ts
// app/api/dev/seed/route.ts
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const { collections } = await req.json();
  for (const col of collections) {
    const docs = SEED_MAP[col]; // e.g. SEED_PRODUCTS from lib/mocks/products.ts
    const batch = writeBatch(db);
    docs.forEach((d) => {
      batch.set(doc(db, col, d.id), { ...d, _seeded: true }); // set (not merge) â€” clean upsert
    });
    await batch.commit();
  }
  return Response.json({ ok: true });
}
```

### Delete (surgical â€” only known seed IDs)

```ts
// app/api/dev/unseed/route.ts
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const { collections } = await req.json();
  for (const col of collections) {
    const ids = SEED_MAP[col].map((d) => d.id); // only the exact seed doc IDs
    const batch = writeBatch(db);
    ids.forEach((id) => batch.delete(doc(db, col, id))); // never deletes non-seed documents
    await batch.commit();
  }
  return Response.json({ ok: true });
}
```

> **Safety**: Delete only targets the exact IDs defined in `lib/mocks/`. Documents with any other ID â€” including real customer data â€” are never touched, even if the route is called in a shared staging environment.

---

## Development Phases

> Tick each checkbox as you complete it. Phases are sequential â€” complete all tasks in the current phase before moving to the next. Each phase ends with a working, deployable slice of the product.

---

### Phase 1 â€” Foundation âœ… COMPLETE (commit: `phase-1-foundation`)

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
- [ ] Create `.env.local` from `.env.example`; set `NEXT_PUBLIC_USE_MOCK_DATA=true` â€” working UI without Firebase
- [ ] Configure `eslint` with `@typescript-eslint` + `eslint-config-next`; add `prettier` with `prettier-plugin-tailwindcss`
- [ ] Add `@next/bundle-analyzer` as dev dependency; add `ANALYZE=true` script to `package.json`
- [ ] Confirm absolute imports `@/*` resolve to project root in `tsconfig.json`

#### 1.2 Theme & Constants

- [ ] `constants/theme.ts` â€” export typed colour tokens (`primary: "#2B1A6B"`, `accent: "#C9B99A"`, etc.), font names (`heading: "Cormorant Garamond"`, `body: "Inter"`), border radius, spacing scale
- [ ] `constants/site.ts` â€” `BRAND_NAME`, `TAGLINE`, `SUPPORT_EMAIL`, `SUPPORT_HOURS`, `WHATSAPP_NUMBER`, social handles, top-nav items array
- [ ] `constants/policies.ts` â€” `FREE_SHIPPING_THRESHOLD` (999), `COD_FEE` (50), `RETURN_WINDOW_DAYS` (3), `PROCESSING_DAYS` ("1-2"), `STANDARD_SLA`, `EXPRESS_SLA`; **INR only, domestic India**
- [ ] `constants/categories.ts` â€” `CATEGORIES` array (id, label, slug) for 6 categories; `CONCERNS` array (id, label, slug, description) for 8 concerns
- [ ] `app/globals.css` â€” declare CSS custom properties from `constants/theme.ts` on `:root`; include Tailwind directives
- [ ] `tailwind.config.ts` â€” extend `colors` with CSS-variable-backed palette (`primary: "hsl(var(--primary))"` etc.); add `Cormorant Garamond` and `Inter` to `fontFamily`; add `animate-shimmer` keyframe for skeletons

#### 1.3 Internationalisation (i18n)

- [ ] Restructure all app routes under `app/[locale]/` segment
- [ ] `middleware.ts` â€” detect locale from URL prefix using `next-intl`; redirect `/` â†’ `/en`; block `/dev/*` paths (return 404) in production; block `/api/dev/*` same way
- [ ] `lib/i18n.ts` â€” `LOCALES = ["en","hi","mr"]`, `DEFAULT_LOCALE = "en"`, `LocalizedString` type, `getLocalizedValue(field, locale)` helper with English fallback
- [ ] `messages/en.json` â€” complete baseline with all namespaces: `nav`, `home`, `product`, `cart`, `checkout`, `concerns`, `policies`, `account`, `auth`, `errors`, `admin`, `support`, `consultation`, `blog`, `footer`
- [ ] `messages/hi.json` â€” placeholder (copy EN structure, keep EN values â€” to be filled in Phase 8)
- [ ] `messages/mr.json` â€” placeholder (same as above)
- [ ] `app/[locale]/layout.tsx` root layout â€” load `Cormorant Garamond` + `Inter` via `next/font/google`; wrap with `NextIntlClientProvider`; inject `AnnouncementBar`, `Navbar`, `Footer`, `Toaster`
- [ ] `components/layout/LanguageSwitcher.tsx` â€” EN / à¤¹à¤¿à¤‚ / à¤®à¤° dropdown using Radix; writes locale to `NEXT_LOCALE` cookie; reads from `useLocale()`

#### 1.4 Mock & Seed Data Layer

- [ ] `lib/mocks/products.ts` â€” all 10 seed products (9 inspired + 1 confirmed Keshli tablet) with complete fields: `variants`, `benefits`, `ingredients`, `faqs`, `concerns`, `images` (placeholder `/images/product-{id}.jpg` paths), `rating`, `reviewCount`
- [ ] `lib/mocks/categories.ts` â€” 6 category docs matching `CATEGORIES` constant
- [ ] `lib/mocks/concerns.ts` â€” 8 concern docs matching `CONCERNS` constant
- [ ] `lib/mocks/coupons.ts` â€” 3 coupons: `WELCOME10` (10%, min â‚¹500, 1/user), `LICORICE20` (â‚¹200 flat, min â‚¹999), `FREESHIP` (free shipping, min â‚¹500)
- [ ] `lib/mocks/reviews.ts` â€” 8 approved seed reviews (2 per flagship product: kumkumadi, ubtan, vitamin-c, keshli tablets)
- [ ] `lib/mocks/blogs.ts` â€” 3 blog posts with full Tiptap-compatible HTML body (EN only at Phase 1)
- [ ] `lib/mocks/settings.ts` â€” `siteConfig` doc (announcement bar, maintenance mode, feature flags), `shippingRules` doc, `paymentSettings` doc (whatsapp enabled, razorpay disabled, COD enabled)
- [ ] `lib/mocks/inventory.ts` â€” inventory doc per product; 50 units default per variant; `lowStockThreshold: 10`, `reorderPoint: 5`
- [ ] `lib/mocks/index.ts` â€” `SEED_MAP: Record<string, SeedDoc[]>` combining all collections; exported for seed API routes and `lib/db.ts`
- [ ] `lib/db.ts` â€” `isFirebaseReady()` reads env vars + `NEXT_PUBLIC_USE_MOCK_DATA`; implement: `getProducts(filters?)`, `getProduct(slug)`, `getCategories()`, `getConcerns()`, `getBlogs(category?)`, `getBlog(slug)`, `getCoupons()`, `getSettings(key)` â€” each tries Firestore first, catches errors, falls back to mock

#### 1.5 Firebase Initialisation

- [ ] `lib/firebase/client.ts` â€” `initializeApp` with public env vars; singleton guard (`getApps().length`); export `auth`, `db` (Firestore), `storage`
- [ ] `lib/firebase/admin.ts` â€” `initializeApp` for Admin SDK using `FIREBASE_ADMIN_*` env vars; server-side only (never imported in client components); export `adminDb`, `adminAuth`
- [ ] Confirm Firestore Security Rules baseline (public read for products/blogs, no writes from client without auth)

#### 1.6 Dev Seed Page & API

- [ ] `app/[locale]/(dev)/dev/seed/page.tsx` â€” table UI with per-collection row (doc count, Seed â†‘, Delete âœ• buttons) + "Seed All" / "Delete All Seed Data" buttons; `[Dev Only]` badge in header; shows last-action status message
- [ ] `app/api/dev/seed/route.ts` â€” `POST { collections: string[] }` â†’ batch `set()` upsert using `SEED_MAP`; marks each doc with `_seeded: true`; returns 404 if `NODE_ENV === "production"`
- [ ] `app/api/dev/unseed/route.ts` â€” `POST { collections: string[] }` â†’ batch `delete()` only for known seed IDs (never touches other docs); returns 404 in production

#### 1.7 Auth

- [ ] `lib/auth.ts` â€” `getCurrentUser(request)` server helper using `adminAuth.verifyIdToken()`; `isAdmin(uid)` checks `users/{uid}.role === "admin"` in Firestore; return typed `User | null`
- [ ] `stores/useAuthStore.ts` â€” Zustand store: `user`, `loading`, `setUser`, `clearUser`; `onAuthStateChanged` listener in a client-side provider component
- [ ] `app/[locale]/(auth)/login/page.tsx` â€” email/password form + Google OAuth button; React Hook Form + Zod validation; redirects to `/account` on success
- [ ] `app/[locale]/(auth)/register/page.tsx` â€” name, email, password, confirm password; creates Firestore `/users/{uid}` doc with `role: "customer"` on first sign-in

#### 1.8 Layout Components

- [ ] `components/layout/AnnouncementBar.tsx` â€” reads `siteConfig.announcementText` + `announcementLink`; dismissible via `localStorage` key; hidden if text is empty
- [ ] `components/layout/Navbar.tsx` â€” logo (links to `/`), nav links from `constants/site.ts`, search icon, wishlist icon (with Zustand count badge), cart icon (with Zustand count badge), account icon; hamburger for mobile; `LanguageSwitcher` dropdown; sticky with blur backdrop
- [ ] `components/layout/MobileMenu.tsx` â€” slide-out Radix Sheet drawer; full nav + concern links organised by section; close on nav
- [ ] `components/layout/Footer.tsx` â€” 4-column layout: brand blurb + certifications, shop links, account links, contact + social icons; newsletter input (inline, calls `POST /api/newsletter`); policy links row at bottom; copyright
- [ ] `components/layout/CartDrawer.tsx` â€” Radix Sheet from right; lists cart items (image thumbnail, name, variant, qty controls, remove); shows subtotal; "Continue Shopping" + "Checkout â†’" CTAs; empty state with Browse CTA

#### 1.9 Home Page Skeleton

- [ ] `app/[locale]/page.tsx` â€” assembles all home sections in order; server component at root fetching products + reviews from `lib/db.ts`
- [ ] `components/home/HeroBanner.tsx` â€” full-width split-layout hero: headline (`home.heroTitle`), subhead, "Shop Now" + "Free Consultation" CTA buttons; background uses brand `primary` colour + botanical SVG overlay; Framer Motion `fadeInUp` on mount
- [ ] `components/home/CategoryGrid.tsx` â€” responsive grid of 6 category cards; each card has category image, label, hover scale; links to `/shop/[category]`
- [ ] `components/home/ProductCarousel.tsx` â€” section heading + Embla Carousel of `ProductCard` components; prev/next arrow buttons; accepts `title` + `products[]` props; used for "Featured" and "New Arrivals" sections
- [ ] `components/home/BrandValues.tsx` â€” 4 trust-signal cards (Ayurvedic Formula, Cruelty Free, No Parabens, Natural Ingredients) with SVG icons and one-line descriptions
- [ ] `components/home/TestimonialsCarousel.tsx` â€” Embla Carousel of quote cards; each shows star rating, review excerpt, customer name + city, verified badge; auto-plays every 4s
- [ ] `components/home/BeforeAfterSlider.tsx` â€” drag-handle image comparison component; two overlaid images with a vertical divider the user can slide; mobile touch-enabled
- [ ] `components/home/BlogPreview.tsx` â€” "From the Blog" section; 3 `BlogCard` components in a row; "View All" link to `/blog`
- [ ] `components/home/NewsletterBanner.tsx` â€” full-width accent-coloured stripe: headline, subhead, email input + Subscribe button; calls `POST /api/newsletter` on submit; shows success toast
- [ ] `app/api/newsletter/route.ts` â€” validates email; saves to Firestore `/newsletter/{subscriberId}` with `email`, `subscribedAt`, deduplicates by email; returns 200

---

### Phase 2 â€” Product Catalogue âœ… COMPLETE

**Goal**: Complete browsable storefront â€” shop, concern pages, product detail â€” fully wired to mock data (and seamlessly to Firestore when credentials are added).

**Exit criteria**: Visitor can browse all products, filter by category/concern, view a full product detail page, and see reviews. Admin can create, edit, and manage products and inventory.

#### 2.1 UI Primitive Components

- [x] `components/ui/Button.tsx` â€” `variant`: `primary | secondary | outline | ghost | destructive`; `size`: `sm | md | lg`; `loading` prop shows spinner; `asChild` passthrough via Radix `Slot`
- [x] `components/ui/Badge.tsx` â€” `variant` maps to theme tokens; used for product tags, order status, stock level
- [x] `components/ui/Input.tsx` â€” controlled input with `label`, `error` message slot, optional leading/trailing icon; forwards ref
- [x] `components/ui/Textarea.tsx` â€” same API as Input; auto-resize option
- [x] `components/ui/Select.tsx` â€” Radix Select wrapper; accepts `options: {value, label}[]`; controlled + uncontrolled modes
- [x] `components/ui/Modal.tsx` â€” Radix Dialog wrapper with overlay, animated entrance, close button, title + description slots
- [x] `components/ui/Drawer.tsx` â€” Radix Sheet wrapper; `side`: `left | right | bottom`; used for mobile menus, cart, modals on mobile
- [x] `components/ui/Skeleton.tsx` â€” shimmer placeholder; accepts `className` for sizing; used in all loading states
- [x] `components/ui/StarRating.tsx` â€” read-only (renders filled/half/empty stars from `value: number`) + interactive mode (click to select, hover preview); accessible with `aria-label`
- [x] `components/ui/Pagination.tsx` â€” prev/next buttons + numbered page pills; `currentPage`, `totalPages`, `onPageChange` props
- [x] `components/ui/Breadcrumb.tsx` â€” accepts `items: {label, href?}[]`; last item is non-linked current page; structured `<nav aria-label="breadcrumb">`
- [x] `components/ui/StatusBadge.tsx` â€” maps order status, review status, and ticket status strings to colour variants (green/amber/red/purple)
- [x] `components/ui/ImageLightbox.tsx` â€” full-screen overlay; keyboard arrow navigation; touch swipe on mobile; ESC to close; zoom on click
- [x] `components/ui/SectionHeading.tsx` â€” `heading` (Cormorant Garamond), optional `subheading`, optional decorative rule; `align`: `left | center`

#### 2.2 Product Components

- [x] `components/product/ProductCard.tsx` â€” product image (`next/image`), name, price + compare-at (strike-through), star rating, "Add to Cart" button; on hover: quick-add overlay with variant selector; wishlist heart icon; links to product detail page
- [x] `components/product/ProductGrid.tsx` â€” CSS grid with responsive columns (2 mobile, 3 tablet, 4 desktop); renders `ProductCard` list; shows `Skeleton` grid when `loading={true}`
- [x] `components/product/ProductFilters.tsx` â€” sidebar/drawer: category checkboxes, concern checkboxes, price range slider, certification checkboxes; syncs state to URL search params (`?category=face&concern=acne`); "Clear All" button
- [x] `components/product/ProductSort.tsx` â€” dropdown: "Newest", "Price: Low â†’ High", "Price: High â†’ Low", "Top Rated", "Best Selling"; syncs to `?sort=` URL param
- [x] `components/product/ProductImages.tsx` â€” main large image with zoom-on-hover (CSS `transform: scale`); thumbnail filmstrip below; clicking thumbnail swaps main image; clicking main image opens `ImageLightbox`
- [x] `components/product/ProductInfo.tsx` â€” product name (h1), brand, star rating + review count (anchor jumps to reviews section), price display, compare-at price, savings percentage badge, variant selector, quantity selector, "Add to Cart" primary button, "Buy Now" secondary button (skips to checkout), certifications icon row
- [x] `components/product/VariantSelector.tsx` â€” pill button group for variant options (e.g. "10ml", "20ml"); selected state highlighted; updating selection updates displayed price
- [x] `components/product/QuantitySelector.tsx` â€” `âˆ’` / number input / `+` buttons; min=1, max=`availableStock`; shows "Only X left" warning below threshold (5)
- [x] `components/product/ProductBadges.tsx` â€” horizontal scrolling icon row: Cruelty Free, Ayurvedic, No Parabens, Vegan etc.; icons from `/public/badges/` or inline SVG
- [x] `components/product/ProductTabs.tsx` â€” Radix Tabs: "Benefits" (bulleted list), "Ingredients" (cards with name + benefit), "How To Use" (numbered steps), "FAQs" (Radix Accordion)
- [x] `components/product/BuyMoreSaveMore.tsx` â€” 2-up and 3-up bundle upsell cards; shows per-item savings compared to buying individually; "Add Bundle to Cart" button
- [x] `components/product/RelatedProducts.tsx` â€” "You May Also Like" Embla Carousel of `ProductCard` components; data from `product.relatedProducts` IDs

#### 2.3 Shop & Browse Pages

- [x] `app/[locale]/shop/page.tsx` â€” server component; calls `getProducts(filters)` from `lib/db.ts`; renders `ProductFilters` (sidebar on desktop, drawer on mobile) + `ProductSort` + `ProductGrid`; total product count display; Suspense boundary with skeleton grid
- [x] `app/[locale]/shop/[category]/page.tsx` â€” pre-filters by category; `generateStaticParams` from `CATEGORIES`; `generateMetadata` with category name; same layout as shop
- [x] `app/[locale]/concern/[concern]/page.tsx` â€” concern hero header (name, description, illustration); concern-filtered product grid; `generateStaticParams` from `CONCERNS`; `generateMetadata` with concern name
- [x] `app/[locale]/combos/page.tsx` â€” combo-filtered grid; "Bundle & Save" themed header
- [x] `app/[locale]/search/page.tsx` â€” reads `?q=` param; searches product `name`, `tags`, `shortDescription` in Firestore (or mock); shows result count; "No results" state with suggestions

#### 2.4 Product Detail Page

- [x] `app/[locale]/products/[slug]/page.tsx` â€” `getProduct(slug)` from `lib/db.ts`; `generateStaticParams` for all slugs; `generateMetadata` with locale-aware `metaTitle` + `metaDescription` + OG image
- [x] Assemble page: `Breadcrumb` â†’ `ProductImages` + `ProductInfo` (side-by-side on desktop, stacked on mobile) â†’ `ProductBadges` â†’ `BuyMoreSaveMore` â†’ `ProductTabs` â†’ Reviews section â†’ `RelatedProducts`
- [x] Inject `Product` JSON-LD structured data in `<head>` using `next/head` (name, image, description, rating, offers)
- [ ] "Back in stock" notify form: if `inStock === false`, show email capture â†’ saves to Firestore `/stockAlerts/{productId}/subscribers`

#### 2.5 Static / Policy Pages

- [x] `app/[locale]/about/page.tsx` â€” brand story, founder note, mission statement, certifications; uses Cormorant Garamond headings, product lifestyle imagery
- [x] `app/[locale]/contact/page.tsx` â€” contact form (name, email, subject, message); WhatsApp deep-link button; support hours from `constants/site.ts`; Google Maps embed (optional)
- [x] `app/api/contact/route.ts` â€” Zod validation; creates `/supportTickets/{ticketId}` with `status: "open"`; sends Resend acknowledgement email to customer; returns ticket number
- [x] `app/[locale]/(policies)/shipping-policy/page.tsx` â€” content from `constants/policies.ts`; renders domestic SLA table, free shipping threshold, COD rules
- [x] `app/[locale]/(policies)/refund-policy/page.tsx` â€” 3-day window, damaged/defective eligibility, return process steps
- [x] `app/[locale]/(policies)/terms/page.tsx` â€” terms of service (standard e-commerce template, Licorice Herbals branded)

#### 2.6 Admin â€” Product Management

- [x] `app/[locale]/admin/products/page.tsx` â€” `DataTable` of all products; columns: image, name, category, price, stock badge, active toggle, actions; search by name/SKU; bulk activate/deactivate; "New Product" CTA
- [x] `app/[locale]/admin/products/new/page.tsx` â€” renders `ProductForm` in create mode
- [x] `app/[locale]/admin/products/[id]/page.tsx` â€” loads product by ID; renders `ProductForm` in edit mode with pre-filled values
- [x] `components/admin/ProductForm.tsx` â€” all product fields grouped in sections; localizable fields (`name`, `tagline`, `description`, `benefits`, `howToUse`, `faqs`, `ingredients.benefit`) show EN | HI | MR tab strip; `RichTextEditor` for `description`; `ImageUploader` for product images; `VariantManager` sub-section; `concerns` multi-select (checkboxes); `relatedProducts` + `upsellProducts` product pickers; "Save Draft" + "Publish" buttons
- [x] `components/admin/VariantManager.tsx` â€” add/edit/delete variant rows (label, price, compareAt, SKU, weight, dimensions, `isDefault` radio); minimum 1 variant enforced
- [x] `components/admin/RichTextEditor.tsx` â€” Tiptap editor; toolbar: bold, italic, underline, h2/h3, ordered/unordered list, blockquote, link insert, image insert (triggers `ImageUploader`); outputs HTML string
- [x] `components/admin/ImageUploader.tsx` â€” drag-and-drop zone + file picker; preview grid with drag-to-reorder; upload progress per image; deletes from Firebase Storage on remove; returns ordered URL array

#### 2.7 Admin â€” Inventory

- [x] `app/[locale]/admin/inventory/page.tsx` â€” full product Ã— variant table; stock values colour-coded (red = 0, amber = below threshold, green = healthy); "Low Stock" filter tab; "Bulk CSV Import" button
- [x] `app/[locale]/admin/inventory/[productId]/page.tsx` â€” per-product variant rows; per-variant stock ledger (all `StockMovement` docs); "Adjust Stock" button per variant
- [x] `components/admin/InventoryRow.tsx` â€” shows variant label, current stock, reserved, available (= stock âˆ’ reserved), threshold, reorder point; inline "Adjust" link
- [x] `components/admin/StockAdjustModal.tsx` â€” `type`: stock_in / adjustment / damaged; `quantity` input; `note` required; writes `StockMovement` doc + atomically updates `inventory/{productId}.variants.{variantId}.stock`
- [x] `lib/db.ts` additions: `getInventory(productId)`, `getStockMovements(productId, variantId)`, `adjustStock(productId, variantId, delta, movement)` â€” uses Firestore transaction for atomicity

---

### Phase 3 — Commerce & Payments ✅ COMPLETE

**Goal**: Complete end-to-end purchase flow â€” cart â†’ checkout â†’ payment (WhatsApp, COD, Razorpay) â†’ order confirmed â†’ admin can process.

**Exit criteria**: A customer can place an order via WhatsApp payment method from start to finish. Admin receives the order, views proof, confirms payment. Customer receives confirmation email.

#### 3.1 Cart State

- [x] `stores/useCartStore.ts` â€” Zustand store: `items: CartItem[]`, `add(product, variant, qty)`, `remove(itemId)`, `updateQty(itemId, qty)`, `clear()`, `total`, `itemCount`; persisted to `localStorage` with `zustand/middleware/persist`
- [x] Firestore cart sync: `useCartSync` hook â€” on `onAuthStateChanged` login, merge `localStorage` cart into `/users/{uid}/cart`; on sign-out, clear local store
- [x] Wire `CartDrawer` to live `useCartStore`: live item list, remove buttons, qty controls, subtotal

#### 3.2 Cart UI

- [x] `components/cart/CartItem.tsx` â€” product thumbnail, name, variant label, unit price, qty controller (`QuantitySelector`), line total, remove button
- [x] `components/cart/CartSummary.tsx` â€” itemised subtotal, coupon discount line, shipping estimate ("Free" or "â‚¹80"), COD fee line (if applicable), total in bold; "Savings" highlighted if coupon active
- [x] `components/cart/CouponInput.tsx` â€” text input + "Apply" button â†’ client calls `POST /api/coupon/validate`; shows discount applied or error message; "Remove" link clears coupon
- [x] `app/api/coupon/validate/route.ts` â€” server-side: all 7 validation rules (exists, active, dates, minOrder, globalUsage, perUserUsage, applicable IDs); returns `{ valid: true, discountAmount, type }` or `{ valid: false, error }`

#### 3.3 Wishlist

- [x] `stores/useWishlistStore.ts` â€” similar to cart; `toggle(productId)`, `isWished(productId)`; persisted to localStorage; synced to `/users/{uid}/wishlist` when logged in
- [x] Wishlist heart icon in `ProductCard` and `ProductInfo` connected to store
- [x] Navbar wishlist icon shows `itemCount` badge
- [x] `app/[locale]/account/wishlist/page.tsx` â€” `ProductGrid` of wishlisted products; "Move to Cart" button per item; empty state with "Browse Products" CTA

#### 3.4 Checkout Flow

- [x] `app/[locale]/checkout/page.tsx` â€” 5-step flow: **Cart Review â†’ Address â†’ Shipping â†’ Payment â†’ Confirmation**; step state persisted in Zustand `useCheckoutStore`; each step validates before advancing
- [x] `components/checkout/CheckoutStepper.tsx` â€” horizontal step indicator; completed steps have checkmark; active step highlighted; past steps are clickable (go back)
- [x] `components/checkout/AddressList.tsx` â€” lists `/users/{uid}/addresses`; "Use this address" radio selection; "Add New Address" card at the bottom; guest checkout shows inline form only
- [x] `components/checkout/AddressForm.tsx` â€” React Hook Form + Zod: name, phone (10-digit Indian), line1, line2, city, state (dropdown from Indian states list), pincode (6-digit), country (locked to India); saves to Firestore on submit
- [x] `components/checkout/PincodeChecker.tsx` â€” triggers `POST /api/pincode-check` on pincode blur; shows "âœ“ Delivery available â€” ETA 5-7 days" or error; "COD not available at this pincode" warning; blocks advance if unserviceable
- [x] `app/api/pincode-check/route.ts` â€” calls Shiprocket serviceability API with JWT from `/api/shiprocket/token`; in mock mode (`NEXT_PUBLIC_USE_MOCK_DATA=true`) returns always-serviceable with standard SLA
- [x] `components/checkout/ShippingOptions.tsx` â€” radio options: Standard (free above â‚¹999 / â‚¹80), Express (+â‚¹X, 2-3 days), Same Day (Mumbai pincodes only); shows SLA and price; reads availability from pincode check result
- [x] `components/checkout/PaymentOptions.tsx` â€” SSR fetches `/settings/paymentSettings` (60s cache); renders only enabled methods as radio options; if only 1 method, auto-selects it
- [x] `components/checkout/OrderSummary.tsx` â€” final breakdown: items Ã— qty, subtotal, discount (coupon), shipping, COD fee, **Total**; product thumbnails; not editable â€” "â† Edit Cart" link

#### 3.5 WhatsApp Payment

- [x] `components/checkout/WhatsAppPaymentInstructions.tsx` â€” post-order page: UPI ID in copy-able field, QR code image (from `paymentSettings.whatsappQrImageUrl` if set), "Open WhatsApp" deep-link button with pre-filled message (`"Hi, I've paid â‚¹X for Order #LH-0001. Please find screenshot attached."`); instructions numbered list; order number prominently shown
- [x] `components/checkout/WhatsAppProofUpload.tsx` â€” optional file input (image only, max 5 MB); "Upload Screenshot" button triggers `POST /api/payment/whatsapp/submit-proof`; progress indicator; success state shows "Proof received â€” we'll confirm shortly"
- [x] `app/api/payment/whatsapp/submit-proof/route.ts` â€” verifies auth token; validates file: MIME type must be `image/*`, max 5 MB; uploads to Firebase Storage `/payment-proofs/{orderId}.{ext}`; updates order `paymentStatus: "proof_submitted"`, `whatsappProofImageUrl`; sends Resend email to admin

#### 3.6 Razorpay Payment (optional â€” only rendered when `razorpayEnabled: true`)

- [x] `app/api/payment/razorpay/create-order/route.ts` â€” verifies auth; reads `razorpayEnabled` from Firestore settings; if disabled returns 403; creates Razorpay order via API key; returns `{ orderId, amount, currency: "INR", keyId }`
- [x] `app/api/payment/razorpay/verify/route.ts` â€” receives `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`; computes HMAC-SHA256(`orderId|paymentId`, `RAZORPAY_KEY_SECRET`); rejects if mismatch; sets `paymentStatus: "paid"`, `paymentId` on order; triggers confirmation email
- [x] Razorpay SDK (`<script src="...">`) loaded client-side only via `next/script strategy="lazyOnload"` and only when payment method is active

#### 3.7 COD Payment

- [x] "Cash on Delivery" option rendered when `codEnabled: true` in settings
- [x] Selecting COD adds visible `+â‚¹50 COD fee` line to `OrderSummary`
- [x] Order creation sets `paymentMethod: "cod"`, `paymentStatus: "pending"`, `orderStatus: "pending"`; stock reserved immediately
- [x] COD min-order check: if `codMinOrder` is set and cart is below it, COD option is greyed out with tooltip

#### 3.8 Order Creation

- [x] `lib/actions/createOrder.ts` â€” Server Action: 1) Zod-validate inputs; 2) re-validate coupon server-side; 3) check stock per variant with Firestore `runTransaction`; 4) atomically: decrement stock + write `reserved` + write order doc + increment `orderCounter` in `siteConfig`; 5) returns `{ orderId, orderNumber }`
- [x] `orderNumber` generation: `LH-${year}-${String(counter).padStart(5, "0")}` â€” counter stored in `siteConfig.orderCounter`, incremented atomically in the same transaction as order creation
- [x] Guest checkout: requires `guestEmail`; `userId` is null; address stored inline on order
- [x] 15-minute reservation timeout: on order creation write `reservationExpiresAt: now + 15min`; `getInventory` query filters out expired reservations (lazy expiry â€” no background job)

#### 3.9 Post-Order & Emails

- [x] `app/api/order-confirm/route.ts` â€” called after payment confirmed (WhatsApp admin action or Razorpay verify); builds order summary HTML; sends Resend email to customer (`orders@licoriceherbal.in` as from); writes first `OrderEvent` to `/orders/{id}/timeline`; idempotent (checks `confirmationEmailSentAt` before sending)
- [x] Confirmation email template: order number, items table, delivery address, expected delivery date, contact support link

#### 3.10 Admin â€” Order Management

- [x] `app/[locale]/admin/orders/page.tsx` â€” `DataTable` with filters: status tabs (All / Awaiting Payment / Processing / Shipped / Delivered / Cancelled), payment method filter, date range picker, search (order number / name / email / AWB); sortable by date, total; bulk mark-as-confirmed action; Export CSV
- [x] `app/[locale]/admin/orders/[id]/page.tsx` â€” full order detail: items breakdown, pricing, customer + address, payment details, shipping info, timeline; action buttons depend on `orderStatus`
- [x] `components/admin/DataTable.tsx` â€” generic reusable table component: column config array, sortable headers, client-side filter, Skeleton loading rows, empty state, pagination
- [x] `components/admin/OrderStatusSelect.tsx` â€” dropdown of valid next statuses given current status; shows confirmation dialog for destructive moves (cancel, refund); writes status change + optional admin note to Firestore; appends timeline event
- [x] `components/admin/WhatsAppPaymentConfirm.tsx` â€” shows proof screenshot inline (`<img src={proofUrl}>`); "Confirm Payment" button â†’ Server Action sets `paymentStatus: "paid"`, `orderStatus: "confirmed"`, `whatsappConfirmedBy`, `whatsappConfirmedAt`; triggers `POST /api/order-confirm`; WhatsApp conversation deep-link for reference
- [x] `components/admin/RefundModal.tsx` â€” `amount` input (pre-filled with order total), `note` textarea; for Razorpay: calls Razorpay refund API + records `refundId`; for WhatsApp/COD: records manual refund note only; sets `paymentStatus: "refunded"` and `refundedAt`

#### 3.11 Admin â€” Payment Settings

- [x] `app/[locale]/admin/settings/payments/page.tsx` â€” toggle switches for WhatsApp, Razorpay, COD; WhatsApp section: UPI ID text field, business phone number, QR image upload; Razorpay section: shows key ID (masked), test mode toggle; COD section: fee amount, min order; all changes write instantly to `/settings/paymentSettings` via Server Action
- [x] `components/admin/PaymentMethodToggle.tsx` â€” labelled toggle switch; optimistic UI update; on error reverts

#### 3.12 Customer Account

- [x] `app/[locale]/account/page.tsx` â€” dashboard: greeting (`"Welcome back, {name}"`), last 3 orders as `OrderCard`, quick links (All Orders, Wishlist, Addresses, Profile)
- [x] `app/[locale]/account/orders/page.tsx` â€” paginated order history; `OrderCard` list; filter by status
- [x] `app/[locale]/account/orders/[id]/page.tsx` â€” full order detail: items, pricing breakdown, delivery address, `OrderTimeline` (live tracking events), return request button (visible if within 3-day window); invoice PDF download link
- [x] `components/account/OrderCard.tsx` â€” order number, date, items count, total, status `StatusBadge`, "View Details" link
- [x] `components/account/OrderTimeline.tsx` â€” vertical timeline of `OrderEvent` docs from `/orders/{id}/timeline`; icons per status; timestamps; location if available; most-recent event at top
- [x] `app/[locale]/account/addresses/page.tsx` â€” address cards grid; "Add New" opens `AddressForm` modal; edit/delete per card
- [x] `components/account/AddressCard.tsx` â€” formatted address display; "Edit", "Delete", "Set as Default" actions
- [x] `app/[locale]/account/profile/page.tsx` â€” edit display name + phone; change password (requires current password); danger zone: delete account link (disabledâ€”contact support)

---

### Phase 4 â€” Shipping & Tracking

**Goal**: Shiprocket integration provides automatic shipment creation, live webhook tracking, and customer-facing order tracking. Return flow and admin shipping tools complete.

**Exit criteria**: Admin ships an order via Shiprocket, AWB is stored, customer sees live tracking timeline updated by webhook. Manual shipping fallback works.

#### 4.1 Shiprocket Token Management

- [ ] `app/api/shiprocket/token/route.ts` â€” on `GET`: checks Firestore `/settings/shiprocketToken` for cached JWT + `expiresAt`; if valid returns cached; else POSTs to Shiprocket auth endpoint with `SHIPROCKET_EMAIL` + `SHIPROCKET_PASSWORD`; stores token + `expiresAt = now + 24h` in Firestore; returns token â€” all within 10s Vercel timeout
- [ ] `lib/shiprocket.ts` â€” `getToken(): Promise<string>` calls `/api/shiprocket/token`; expose helpers: `createShipment(order)`, `cancelShipment(shipmentId)`, `trackByAwb(awb)`, `checkServiceability(pincode, weight)`

#### 4.2 Shipment Creation

- [ ] `app/api/shiprocket/create-order/route.ts` â€” verifies admin auth; fetches order from Firestore; builds Shiprocket API payload (items as `order_items[]`, pickup address from `siteConfig`, delivery address from order, weight from variant); POST to Shiprocket; stores `shiprocketOrderId`, `shiprocketShipmentId`, `awbCode`, `courierName` on order; appends timeline event `"Shipment created"`
- [ ] `app/api/shiprocket/cancel-order/route.ts` â€” verifies admin auth; calls Shiprocket cancel API; releases stock reservation (write `StockMovement` of type `released`); updates `orderStatus: "cancelled"`
- [ ] `app/api/shiprocket/track/route.ts` â€” proxy: GET with `?awb=` param; calls Shiprocket tracking API; returns normalised timeline events array; used by customer track page

#### 4.3 Shiprocket Webhook

- [ ] `app/api/shiprocket/webhook/route.ts` â€” validates `X-Shiprocket-Hmac-Sha256` header against `SHIPROCKET_WEBHOOK_SECRET`; rejects non-matching with 401; maps Shiprocket event status to internal `orderStatus`; appends event to `/orders/{id}/timeline`; updates top-level `orderStatus`; for `delivered` status sets `deliveredAt = now`; triggers Resend email to customer for key status milestones (shipped, out-for-delivery, delivered)
- [ ] Document expected webhook payload shape in code comment; fail silently on unknown event types

#### 4.4 Admin Shipping Tools

- [ ] `components/admin/ShipOrderModal.tsx` â€” two tabs: **Shiprocket** (calls `/api/shiprocket/create-order`; shows courier recommendation; AWB auto-populated after success) and **Manual** (courier name text field + AWB text field + tracking URL; sets `manualShipping: true`); shows Pincode serviceability inline check before submitting
- [ ] Admin order detail: show AWB code, courier name, tracking link, estimated delivery date after shipping; "Re-ship" option if shipment failed

#### 4.5 Customer Order Tracking

- [ ] `app/[locale]/track/page.tsx` â€” public page; `?orderId=` or `?awb=` + `?email=` params; fetches order (verifies email matches `guestEmail` or account email as auth alternative); renders `OrderTimeline`; shows current status hero card; courier name + external tracking link; "Order not found" error state
- [ ] Customer `account/orders/[id]` â€” `OrderTimeline` already shows webhook-updated events in real time (Firestore `onSnapshot` listener on the timeline sub-collection)
- [ ] Courier tracking link (`courierTrackingUrl`) opens in new tab; shows courier name

#### 4.6 Returns & Refunds

- [ ] Return request button on `account/orders/[id]` â€” visible only: `orderStatus === "delivered"` AND `deliveredAt` is within `RETURN_WINDOW_DAYS` (3 days); not visible for digital or non-returnable items
- [ ] Return request form: reason dropdown (damaged, wrong item, defective, expired) + image uploads (up to 3) + optional note; writes `status: "return_requested"`, `returnReason`, `returnImages` on order
- [ ] Admin: "Initiate Return Pickup" button on order detail â†’ calls Shiprocket return shipment API; updates `orderStatus: "return_picked_up"`
- [ ] On return received (admin manual action): trigger refund via `RefundModal`; write `StockMovement` of type `return`

#### 4.7 Admin Dashboard â€” Baseline

- [ ] `app/[locale]/admin/page.tsx` â€” stats grid + ordered alert cards; server-rendered; refreshes on page load
- [ ] `components/admin/StatsCard.tsx` â€” icon, label, primary value, optional secondary (e.g. "vs yesterday"), optional trend arrow
- [ ] Stats widgets: Revenue today / this week / this month (sum of `paymentStatus: "paid"` orders), Orders today (count), Pending confirmation count, Low-stock count, Open tickets count, Pending reviews count, Upcoming consultations count
- [ ] Charts (server-computed, no Cloud Functions): Revenue last 30 days (line chart via CSS/SVG â€” no chart library dependency unless already installed), Orders by status today (donut), Top 5 products last 30 days (bar)
- [ ] **WhatsApp pending payments** alert card: count of `paymentStatus IN ["pending_whatsapp","proof_submitted"]`; "Review All" link to filtered orders list
- [ ] Recent orders: last 10 rows with `OrderStatusSelect` inline for quick processing

---

### Phase 5 â€” Reviews & Trust

**Goal**: Verified purchase review system with photo uploads, admin moderation, helpful votes, and public display integrated into product pages.

**Exit criteria**: Customer with a delivered order can submit a review with photos. Admin can approve/reject in a moderation queue. Approved reviews appear on the product page. Product rating is updated automatically.

#### 5.1 Review Submission

- [ ] `components/product/AddReviewForm.tsx` â€” shown only if current user has a `delivered` order containing this product (checked server-side via `lib/actions/checkReviewEligibility.ts`); fields: star rating (mandatory, 1â€“5), title (optional), body (min 20 chars, max 1000), up to 5 photo uploads; React Hook Form + Zod; Submit creates review with `status: "pending"`
- [ ] `lib/actions/checkReviewEligibility.ts` â€” Server Action: queries `/orders` where `userId = currentUser AND orderStatus = "delivered"` and one of `items.productId` matches; returns `{ eligible: boolean, orderId? }`
- [ ] `lib/actions/submitReview.ts` â€” Server Action: re-checks eligibility; validates inputs; uploads images to `/reviews/{reviewId}/` in Firebase Storage (sequential, fail gracefully if one fails); writes Firestore review doc; returns `reviewId`
- [ ] "Review submitted â€” pending approval" success toast

#### 5.2 Admin Review Moderation

- [ ] `app/[locale]/admin/reviews/page.tsx` â€” **Pending** tab (default) + **All Reviews** tab; `DataTable` with columns: product, rating, excerpt, author, date, verified badge, actions; filter by product, star rating, date
- [ ] `app/[locale]/admin/reviews/[id]/page.tsx` â€” full review body, all images (grid with lightbox), customer name + verified purchase status, product link; Approve / Reject (requires reason text) / Add Reply buttons
- [ ] `components/admin/ReviewModerationCard.tsx` â€” composable card used in both list and detail views; approve/reject buttons; reply textarea (shown only after approval)
- [ ] `lib/actions/moderateReview.ts` â€” Server Action: on approve â†’ sets `status: "approved"`, `moderatedBy`, `moderatedAt`; then reads all approved reviews for the product â†’ computes average rating â†’ updates `product.rating` + `product.reviewCount` in Firestore transaction; on reject â†’ sets `status: "rejected"`, `rejectionReason`
- [ ] Admin reply: sets `adminReply` + `adminRepliedAt` on review doc; reply shown publicly on product page below customer review

#### 5.3 Storefront Review Display

- [ ] `components/product/ReviewsList.tsx` â€” top section: average star rating (large), rating distribution bar chart (5â†’1 stars with fill percentage); filter row and sort dropdown; paginated `ReviewCard` list (10 per page); "Load more" button or pagination; total count display
- [ ] `components/product/ReviewCard.tsx` â€” star rating, title, body, `Verified Purchase` badge (if `isVerifiedPurchase`), date, customer first name + city, review photos row (click opens lightbox), `adminReply` section (indented, labelled "Response from Licorice Herbals"), helpful vote thumbs-up (`helpfulCount`), "Report" link
- [ ] `components/product/ReviewFilters.tsx` â€” pill filters: "All", "5 Stars", "4 Stars" â€¦ "1 Star", "Verified Only", "With Photos"; updates URL param `?reviewFilter=`
- [ ] `components/product/ReviewPhotoGallery.tsx` â€” all customer photos from approved reviews in a masonry/grid; clicking opens `ImageLightbox` with customer name + rating overlay
- [ ] Helpful vote: `POST /api/review/helpful` â†’ Firestore `increment(1)` on `helpfulCount`; debounced, one vote per session (stored in `sessionStorage`)
- [ ] Flag review: "Report" opens compact form (reason dropdown); `POST /api/review/flag` â†’ writes `reviewFlag` doc
- [ ] `app/api/review/flag/route.ts` â€” verifies auth; writes `/reviewFlags/{flagId}`; checks user hasn't flagged same review already

---

### Phase 6 â€” Support & Consultation

**Goal**: Support ticket inbox (threaded), free consultation booking, and corporate gifting inquiry form â€” all with admin management panels.

**Exit criteria**: Customer can open a ticket from an order. Admin sees tickets in an inbox, replies, and closes them. Customer can book a consultation. Corporate inquiry form works.

#### 6.1 Support Tickets â€” Customer Side

- [ ] "Get Help" button on `account/orders/[id]` â€” opens ticket create modal pre-filled with order number; category auto-set to "order"
- [ ] `app/[locale]/contact/page.tsx` form â†’ `POST /api/contact` â†’ creates ticket; shows ticket number in success state
- [ ] Customer can view their tickets at `app/[locale]/account/` (add "Support" quick link); view thread at a dedicated page
- [ ] `components/support/TicketCard.tsx` â€” ticket number, subject, category badge, status `StatusBadge`, last message timestamp, unread indicator
- [ ] `components/support/TicketThread.tsx` â€” chronological message bubbles (customer: right-aligned, admin: left-aligned); shows `attachments` as image thumbnails; timestamps; closed ticket shows "This ticket is resolved" banner with re-open link

#### 6.2 Support Tickets â€” Admin Side

- [ ] `app/[locale]/admin/support/page.tsx` â€” `TicketInbox` component; tabs: Open / In Progress / Waiting Customer / Resolved; unread count badge per tab; sort by: Last updated, Priority, Oldest first; SLA highlight: tickets open > 24h shown with amber border
- [ ] `app/[locale]/admin/support/[ticketId]/page.tsx` â€” `TicketThread` + reply form (Textarea + file attachment + Send); internal notes section (admin-only, grey background, padlock icon); status change dropdown; close/reopen button; assigns ticket to admin user
- [ ] `components/admin/TicketInbox.tsx` â€” wraps the ticket list with composable filter/sort controls; row click navigates to detail
- [ ] On every admin reply: write `TicketMessage` to `/supportTickets/{id}/messages/`; send Resend email to customer; update ticket `updatedAt` and `status: "waiting_customer"`

#### 6.3 Free Consultation

- [ ] `app/[locale]/consultation/page.tsx` â€” two-column layout: consultant bio (photo, credentials, specialties) on left; booking form on right; form fields: name, email, phone, concern checkboxes (multi-select from `CONCERNS`), preferred date (date picker, future dates only), preferred time slot (dropdown), message (optional)
- [ ] `lib/actions/bookConsultation.ts` â€” Zod validation; writes `/consultations/{bookingId}` with `status: "pending"`; sends Resend confirmation email to customer ("Booking received, we'll confirm shortly"); sends admin alert email with booking details
- [ ] `app/[locale]/admin/consultations/page.tsx` â€” two tabs: Upcoming (sorted by date) and Completed; `ConsultationCard` list; date range filter
- [ ] `components/admin/ConsultationCard.tsx` â€” name, concerns, preferred slot, status badge; inline action buttons: Confirm (sends customer confirmation email), Complete, Cancel; internal notes field
- [ ] On confirmation: sends Resend email to customer with confirmed date/time, meeting link placeholder (`[Online link or phone number]`), prep instructions

#### 6.4 Corporate Gifting

- [ ] `app/[locale]/corporate-gifting/page.tsx` â€” hero section with corporate gifting visual; value propositions; inquiry form with all required fields (company, contact, email, phone, units, budget, delivery date, custom branding, message); "Request Quote" CTA
- [ ] `lib/actions/submitCorporateInquiry.ts` â€” validation; writes `/corporateInquiries/{id}`; admin alert email via Resend; customer acknowledgement email
- [ ] `app/[locale]/admin/corporate/page.tsx` â€” `DataTable` of inquiries; columns: company, units, budget, date; status filter (New / In Progress / Won / Lost); click opens inquiry detail modal

---

### Phase 7 â€” Content

**Goal**: Blog with rich text, diet section, newsletter subscription management, and before/after gallery â€” all with admin CRUD.

**Exit criteria**: Admin can publish a blog post via Tiptap editor. Visitors can browse and read posts. Newsletter captures subscribers. Before/after slider shows real content.

#### 7.1 Blog â€” Storefront

- [ ] `lib/db.ts` additions: `getBlogs(category?, limit?)`, `getBlog(slug)`, `getBlogsByTag(tag)` â€” with mock fallback to `lib/mocks/blogs.ts`
- [ ] `app/[locale]/blog/page.tsx` â€” blog list: category filter tabs (Skincare & Ayurveda / Diet & Lifestyle); grid of `BlogCard` components; load-more pagination; `generateMetadata` with blog listing meta
- [ ] `app/[locale]/blog/[slug]/page.tsx` â€” article with: cover image, category tag, title (Cormorant Garamond), author avatar + name, publish date, read time estimate, `BlogContent` body, tags row, related products widget (from `blog.relatedProducts`), social share buttons, `RelatedPosts` section; `generateStaticParams` + `generateMetadata`; `Article` JSON-LD
- [ ] `app/[locale]/blog/diet/page.tsx` â€” same as blog list but pre-filtered to `category: "diet-lifestyle"`
- [ ] `components/blog/BlogCard.tsx` â€” cover image, category pill, title, excerpt (first 150 chars), author, date, read time, "Read more â†’" link
- [ ] `components/blog/BlogContent.tsx` â€” renders Tiptap HTML via `dangerouslySetInnerHTML` (safe: Tiptap output is controlled, admin-only); applies prose typography styles; syntax-highlighted `<pre>` blocks; image figures with captions
- [ ] `components/blog/RelatedPosts.tsx` â€” "More Posts" sidebar section; 3 `BlogCard` components; shown below article

#### 7.2 Blog â€” Admin

- [ ] `app/[locale]/admin/blogs/page.tsx` â€” `DataTable` of all posts; status tabs: Draft / Published / Archived; columns: title, category, author, published date, views (optional); "New Post" CTA
- [ ] `app/[locale]/admin/blogs/new/page.tsx` â€” new blog form
- [ ] `app/[locale]/admin/blogs/[id]/page.tsx` â€” edit blog form (same component)
- [ ] Blog form fields: `title` (EN | HI | MR tabs), `slug` (auto-generated from EN title, editable), category dropdown, cover image (`ImageUploader`), `body` (`RichTextEditor`, EN | HI | MR tabs), author name, tags (comma-separated), `relatedProducts` multi-select, `metaTitle` + `metaDescription` + OG image, `publishedAt` date picker (future date = scheduled), status toggle (Draft / Published); Save + Publish buttons

#### 7.3 Newsletter

- [ ] `POST /api/newsletter` â€” Zod: valid email; writes to `/newsletter/{id}` with `email`, `subscribedAt`; reads existing doc first to deduplicate; returns `{ alreadySubscribed: boolean }`
- [ ] `components/home/NewsletterBanner.tsx` â€” inline form already built in Phase 1; now fully wired to API; shows "You're subscribed!" if `alreadySubscribed`
- [ ] `app/[locale]/admin/newsletter/page.tsx` â€” subscriber `DataTable`: email, subscribed date, source; total count badge; "Export CSV" button (builds `text/csv` response from all subscriber docs)

#### 7.4 Before/After Gallery

- [ ] Admin: `/admin/settings` (or a dedicated `/admin/before-after`) â€” upload before/after image pairs; `product` tag (links to a product); `caption` text; stored in Firestore `/beforeAfterGallery/{id}` with two Firebase Storage URLs
- [ ] `components/home/BeforeAfterSlider.tsx` â€” already scaffolded in Phase 1; now feeds from `lib/db.ts` `getBeforeAfterItems()`; renders the real uploaded pairs

---

### Phase 8 â€” Polish & Launch

**Goal**: Production-ready: SEO complete, performance optimised, i18n fully translated, security hardened, PWA configured, deployed to Vercel with custom domain.

**Exit criteria**: Lighthouse scores â‰¥ 90 on mobile for home and product pages. All three locales working. Firestore security rules deployed. Site live at custom domain.

#### 8.1 i18n â€” Translation Completion

- [ ] `messages/hi.json` â€” replace all EN placeholder values with correct Hindi translations (all namespaces)
- [ ] `messages/mr.json` â€” replace all EN placeholder values with correct Marathi translations (all namespaces)
- [ ] `lib/mocks/products.ts` â€” add `hi` + `mr` values to every `LocalizedString` field in all seed products
- [ ] Smoke-test all 3 locales: navigation, product pages, checkout flow, account pages
- [ ] `LanguageSwitcher` â€” confirm locale persists in `NEXT_LOCALE` cookie across navigation + page reload

#### 8.2 SEO

- [ ] `generateMetadata()` on every page â€” locale-specific `title`, `description`, `openGraph.image`, `twitter.card`; falls back to `constants/site.ts` defaults
- [ ] Root `app/[locale]/layout.tsx` â€” inject `<link rel="alternate" hreflang="en|hi|mr|x-default">` for all pages
- [ ] `app/sitemap.ts` â€” dynamic sitemap: all product slugs (`/en/products/â€¦`, `/hi/products/â€¦`, `/mr/products/â€¦`), all blog slugs, all concern pages, static pages; exclude admin + auth + account
- [ ] `app/robots.ts` â€” `Disallow: /admin`, `Disallow: /api`, `Disallow: /dev`, `Disallow: /account`; `Sitemap:` header
- [ ] Product pages: `Product` JSON-LD (name, image, description, offers with price + currency, aggregateRating)
- [ ] Blog pages: `Article` JSON-LD (headline, author, datePublished, image)
- [ ] OG images: use Next.js `ImageResponse` in `/opengraph-image.tsx` files for home + product + blog pages

#### 8.3 Performance

- [ ] All `<img>` tags replaced with `next/image`; set `priority` on LCP images (hero, product main image)
- [ ] Dynamic imports (`next/dynamic`) for: `RichTextEditor`, `ImageLightbox`, `BeforeAfterSlider`, Razorpay SDK
- [ ] Run `ANALYZE=true npm run build`; verify no chunk exceeds 200 kB gzipped; remove unused Radix primitives
- [ ] Server Components cache: `{ next: { revalidate: 60 } }` on Firestore reads for products, blogs, categories
- [ ] Lighthouse audit on mobile (Chrome DevTools); target â‰¥ 90 for Performance, Accessibility, SEO
- [ ] Fix any Accessibility issues found: alt text, focus rings, colour contrast (minimum 4.5:1), ARIA labels

#### 8.4 Analytics & Monitoring

- [ ] Add GA4 via `@next/third-parties/google` (tree-shake friendly); track: `page_view`, `add_to_cart`, `begin_checkout`, `purchase`
- [ ] Admin dashboard charts now use real Firestore data (already server-rendered â€” confirm Spark quota not exceeded by projecting query volume)
- [ ] Error monitoring: add `console.error` â†’ Vercel Log Drains (Vercel Hobby supports this); OR integrate Sentry free tier (`@sentry/nextjs`)

#### 8.5 Security Hardening

- [ ] Deploy Firestore Security Rules:
  - `/products`, `/blogs`, `/concerns`, `/categories`: `read = true`, `write = isAdmin()`
  - `/orders/{orderId}`: `read = isOwner() || isAdmin()`, `write = isAuthenticated()`
  - `/users/{uid}/*`: `read = isOwner()`, `write = isOwner()`
  - `/reviews`: `read = true` (approved only â€” filtered in queries), `write = isAuthenticated()`
  - `/coupons`: `read = false` (server-side only), `write = isAdmin()`
  - `/settings/*`: `read = false`, `write = isAdmin()`
- [ ] All admin API routes: call `verifyIdToken()` + `isAdmin()` at start; return 403 with generic error if either fails
- [ ] All mutation API routes: Zod schema validation at entry point; `stripUnknown: true` (or equivalent) to reject extra fields
- [ ] Shiprocket webhook: reject requests without valid `X-Shiprocket-Hmac-Sha256` header (HMAC-SHA256 of body with `SHIPROCKET_WEBHOOK_SECRET`)
- [ ] Razorpay verify: always re-compute HMAC server-side; never trust a client-provided payment amount â€” always fetch order amount from Firestore
- [ ] WhatsApp proof upload: validate MIME type (allow only `image/jpeg`, `image/png`, `image/webp`); enforce 5 MB max size; require authenticated session
- [ ] Review flag API: check user hasn't already flagged the same review (query existing flags); max 10 flags per user per hour (Firestore counter)
- [ ] `/dev/seed` + `/dev/unseed`: double-guarded â€” `middleware.ts` blocks in production AND inside route handler checks `NODE_ENV`
- [ ] Content Security Policy headers: add `next.config.js` `headers()` with strict CSP; allow Razorpay, Firebase, Google Fonts, GA4

#### 8.6 PWA

- [ ] `public/manifest.json` â€” `name: "Licorice Herbals"`, `short_name: "Licorice"`, icons at 192Ã—192 and 512Ã—512 (brand indigo background, white logo), `theme_color: "#2B1A6B"`, `background_color: "#FAFAF7"`, `display: "standalone"`, `start_url: "/en"`
- [ ] `app/[locale]/layout.tsx` â€” add `<link rel="manifest">`, `<meta name="theme-color">`, `<link rel="apple-touch-icon">`
- [ ] Service Worker via `next-pwa`: cache static assets + Next.js build output; offline fallback page (`/offline`) with brand styling
- [ ] Generate favicon set: 16Ã—16, 32Ã—32, 48Ã—48 `favicon.ico`; 180Ã—180 Apple touch icon; place in `/public`

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
  - [ ] Admin: seed page returns 404 âœ“, order status update âœ“, inventory adjust âœ“
  - [ ] Shiprocket webhook (send test payload) â€” timeline updates âœ“
  - [ ] `/en`, `/hi`, `/mr` all load without error
- [ ] Set up Vercel deployment notifications (Slack / email) for failed deployments
