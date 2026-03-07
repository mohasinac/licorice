# Changelog

All notable changes to **Licorice Herbals** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [Phase 2] — Product Catalogue · Branch: `phase-2-product-catalogue`

### Summary

Full product catalogue, shop browsing, admin product management, and admin inventory system. 30+ new components and pages. Build: 132 static pages, TypeScript clean (exit 0).

### Added

#### UI Primitives
- `components/ui/Textarea.tsx` — auto-grow textarea with label + error state
- `components/ui/Select.tsx` — native `<select>` wrapper with Tailwind styling
- `components/ui/Modal.tsx` — Radix Dialog wrapper with slide-in animation
- `components/ui/Drawer.tsx` — bottom/side sheet via Radix Dialog
- `components/ui/Pagination.tsx` — page number + prev/next; accepts `total`, `page`, `perPage`
- `components/ui/Breadcrumb.tsx` — `<nav aria-label="breadcrumb">` from array of `{label, href}`
- `components/ui/StatusBadge.tsx` — semantic colour badge (active/draft/archived/low/out)
- `components/ui/ImageLightbox.tsx` — full-screen image zoom via Radix Dialog

#### Product Components
- `components/product/ProductGrid.tsx` — responsive grid of `ProductCard` with Skeleton fallback
- `components/product/ProductFilters.tsx` — category + concern + price range filters; mobile drawer mode
- `components/product/ProductSort.tsx` — sort select (newest / price asc/desc / rating)
- `components/product/ProductImages.tsx` — thumbnail strip + main image with zoom cursor
- `components/product/ProductInfo.tsx` — title, price/compareAt, short description, variant selector, quantity+cart row, wishlist
- `components/product/VariantSelector.tsx` — pill buttons for variant selection
- `components/product/QuantitySelector.tsx` — −/+ stepper with min=1 guard
- `components/product/ProductBadges.tsx` — "Bestseller", "Organic", "New" label strip
- `components/product/ProductTabs.tsx` — Description / Benefits / How To Use / Ingredients / FAQs accordion tabs
- `components/product/BuyMoreSaveMore.tsx` — 1× / 2× / 3× bundle pricing table
- `components/product/RelatedProducts.tsx` — horizontal scroll carousel of related `ProductCard`

#### Shop & Browse Pages
- `app/[locale]/shop/page.tsx` — server component with ProductFilters + ProductSort + ProductGrid
- `app/[locale]/shop/[category]/page.tsx` — category-filtered shop with `generateStaticParams`
- `app/[locale]/concern/[concern]/page.tsx` — concern-filtered shop with hero header
- `app/[locale]/combos/page.tsx` — combo product listing
- `app/[locale]/search/page.tsx` — `?q=` full-text search across product name/tags/description

#### Product Detail Page
- `app/[locale]/products/[slug]/page.tsx` — full product detail; `generateStaticParams`; Product JSON-LD structured data; all product component sections assembled

#### Static & Policy Pages
- `app/[locale]/about/page.tsx` — brand story, founder note, mission, certifications
- `app/[locale]/contact/page.tsx` + `ContactPageClient.tsx` — contact form (RHF + Zod), WhatsApp link, support hours; split server/client to support both `export const metadata` and `"use client"`
- `app/[locale]/(policies)/shipping-policy/page.tsx` — domestic SLA table, free shipping threshold, COD rules
- `app/[locale]/(policies)/refund-policy/page.tsx` — 3-day return window, eligibility, process steps
- `app/[locale]/(policies)/terms/page.tsx` — terms of service

#### Admin — Product Management
- `app/[locale]/(admin)/admin/products/page.tsx` — product list with DataTable (image, name, category, price, stock badge, status)
- `app/[locale]/(admin)/admin/products/new/page.tsx` — create product page
- `app/[locale]/(admin)/admin/products/[id]/page.tsx` — edit product page
- `components/admin/ProductForm.tsx` — full product form (RHF + Zod v4); sections: basic info, taxonomy, variants, benefits, how-to-use, publishing
- `components/admin/VariantManager.tsx` — dynamic variant add/edit/delete with default-star control
- `components/admin/RichTextEditor.tsx` — Tiptap placeholder (stub; full editor planned Phase 7)
- `components/admin/ImageUploader.tsx` — drag-drop uploader with FileReader preview grid

#### Admin — Inventory
- `app/[locale]/(admin)/admin/inventory/page.tsx` — full product × variant inventory table with colour-coded stock levels
- `app/[locale]/(admin)/admin/inventory/[productId]/page.tsx` — per-product inventory with stock movement ledger
- `components/admin/InventoryRow.tsx` — colour-coded row (red=OOS, amber=low, green=healthy)
- `components/admin/StockAdjustModal.tsx` — Radix Dialog modal for stock_in / adjustment / return movements
- `lib/db.ts` additions: `getInventory()`, `getStockMovements()`, `adjustStock()` with Firestore transaction + mock fallback

#### Utilities & Infrastructure
- `lib/utils.ts` — `cn()` class-name merge utility
- `components/layout/Footer.tsx` — added visible "Built by mohasinac" GitHub link with `Github` icon (lucide-react)

### Fixed
- `SectionHeading` prop names corrected across 5 files: `heading` → `title`, `subheading` → `subtitle`
- `app/[locale]/contact/page.tsx` conflict between `"use client"` and `export const metadata` resolved by server/client split
- `Product.name` type guard errors — `name` is always `string`, never `LocalizedString`; removed all `.en` access patterns
- Zod v4 + `@hookform/resolvers` v5 compatibility: removed `.default()` from all schema fields; defaults handled in `useForm({ defaultValues })`; resolver cast as `Resolver<FormData>`

---

## [Phase 1] — 2026-03-07 · Branch: `phase-1-foundation`

### Summary

Foundation phase — full project scaffold, brand theming, i18n routing, Firebase init, mock data layer, layout shell, home page, auth, and API routes. Builds and type-checks cleanly with zero Firebase credentials required (`NEXT_PUBLIC_USE_MOCK_DATA=true`).

### Added

#### Project Bootstrap

- Next.js 16 App Router project with TypeScript, Tailwind CSS v4, ESLint, Prettier
- `prettier-plugin-tailwindcss` for class-order enforcement
- `@next/bundle-analyzer` with `ANALYZE=true` script
- `proxy.ts` (Next.js 16 middleware convention) for locale routing + dev-path blocking

#### Theme & Constants

- `constants/theme.ts` — typed colour tokens (`primary #2B1A6B`, `accent #C9B99A`, etc.) and font names
- `constants/site.ts` — `BRAND_NAME`, `TAGLINE`, `SUPPORT_EMAIL`, `WHATSAPP_NUMBER`, social links, nav items
- `constants/policies.ts` — `FREE_SHIPPING_THRESHOLD` (₹999), `COD_FEE` (₹50), return window, SLA strings
- `constants/categories.ts` — 6 product categories + 8 skin/hair concerns with slugs
- `app/globals.css` — CSS custom properties from theme tokens; Tailwind directives; `font-heading` / `font-body` utility classes; `animate-shimmer` keyframe

#### Internationalisation

- `i18n/routing.ts` + `i18n/request.ts` — next-intl App Router config; locales `en | hi | mr`, default `en`
- `lib/i18n.ts` — `LOCALES`, `DEFAULT_LOCALE`, `LocalizedString` type, `getLocalizedValue()` fallback helper
- `messages/en.json` — complete baseline; namespaces: `nav`, `home`, `product`, `cart`, `checkout`, `concerns`, `policies`, `account`, `auth`, `errors`, `admin`, `support`, `consultation`, `blog`, `footer`
- `messages/hi.json` + `messages/mr.json` — placeholder stubs (Phase 8 target)

#### Data Layer

- `lib/types.ts` — full TypeScript interfaces: `Product`, `Variant`, `Ingredient`, `FAQ`, `Category`, `Concern`, `Order`, `OrderItem`, `Review`, `Blog`, `Coupon`, `CartItem`, `AppUser`, `SiteConfig`, `ShippingRules`, `PaymentSettings`, `InventoryDoc`, `StockMovement`, and more
- `lib/db.ts` — unified data-access layer; `isFirebaseReady()` guard; functions: `getProducts`, `getProduct`, `getProductById`, `getCategories`, `getConcerns`, `getBlogs`, `getBlog`, `getCoupon`, `getApprovedReviews`, `getProductReviews`, `getSiteConfig`, `getPaymentSettings`, `getShippingRules` — each tries Firestore first, falls back to mock data
- `lib/mocks/products.ts` — 8 seed products (Kumkumadi Face Oil, Brightening Ubtan, Vitamin C Serum, Keshli Hair Tablets, Neem Face Wash, Saffron Cream, Hair Growth Oil, Combo Pack) with full variants/benefits/ingredients/FAQs
- `lib/mocks/categories.ts` — 6 category seed docs
- `lib/mocks/concerns.ts` — 8 concern seed docs
- `lib/mocks/coupons.ts` — 3 coupons: `WELCOME10`, `LICORICE20`, `FREESHIP`
- `lib/mocks/reviews.ts` — 8 approved reviews across flagship products (with `authorName` for display)
- `lib/mocks/blogs.ts` — 3 published blog posts with Tiptap-compatible HTML bodies
- `lib/mocks/settings.ts` — `siteConfig`, `shippingRules`, `paymentSettings` seed docs
- `lib/mocks/inventory.ts` — inventory docs (50 units/variant, `lowStockThreshold: 10`)
- `lib/mocks/index.ts` — `SEED_MAP` registry combining all collections

#### Firebase

- `lib/firebase/client.ts` — singleton client SDK init; exports `getClientAuth()`, `getClientDb()`, `getClientStorage()`
- `lib/firebase/admin.ts` — singleton Admin SDK init from env vars; exports `adminDb`, `adminAuth`
- `lib/auth.ts` — server-side `getCurrentUser(request)` + `isAdmin(uid)` helpers

#### State Management

- `stores/useAuthStore.ts` — Zustand store: `user`, `loading`, `setUser`, `setLoading`, `clearUser`
- `stores/useCartStore.ts` — Zustand + `persist`: `items`, `add`, `remove`, `updateQty`, `clear`, `openCart`, `closeCart`, `itemCount()`, `subtotal()`; persisted to `localStorage`
- `stores/useWishlistStore.ts` — Zustand + `persist`: `productIds`, `toggle`, `isWished`; persisted to `localStorage`
- `components/AuthProvider.tsx` — client component; `onAuthStateChanged` listener populating `useAuthStore`

#### UI Primitives

- `components/ui/Button.tsx` — variants: `primary | secondary | outline | ghost | destructive`; sizes: `sm | md | lg`; `loading` spinner state
- `components/ui/Input.tsx` — controlled input with `label`, `error` slot, ref-forwarding
- `components/ui/Badge.tsx` — colour variants mapping to theme tokens
- `components/ui/StarRating.tsx` — read-only + interactive modes; half-star support; ARIA label
- `components/ui/SectionHeading.tsx` — Cormorant Garamond heading + optional subtitle; `align` prop
- `components/ui/Skeleton.tsx` — shimmer placeholder with `animate-shimmer` keyframe

#### Layout Components

- `components/layout/AnnouncementBar.tsx` — client component; dismissible; reads `text` + `link` props from server layout
- `components/layout/Navbar.tsx` — sticky, blur backdrop; logo, nav links, search, wishlist badge, cart badge, account icon, language switcher, hamburger
- `components/layout/MobileMenu.tsx` — slide-out drawer; full nav + concerns organised by section
- `components/layout/LanguageSwitcher.tsx` — EN / हिं / मर Radix dropdown; writes `NEXT_LOCALE` cookie
- `components/layout/Footer.tsx` — 4-column server component; brand blurb, shop links, policy links, contact + social icons
- `components/layout/CartDrawer.tsx` — Radix Dialog from right; item list with qty controls + remove; free-shipping progress bar; subtotal + checkout CTA

#### Home Page

- `app/[locale]/page.tsx` — server component assembling all home sections; parallel data fetching
- `components/home/HeroBanner.tsx` — full-width hero; Framer Motion fade-in; "Shop Now" + "Free Consultation" CTAs
- `components/home/CategoryGrid.tsx` — responsive 2→3→6 col grid of category cards
- `components/home/ProductCarousel.tsx` — Embla Carousel of `ProductCard` with prev/next arrows
- `components/home/BrandValues.tsx` — 4 trust-signal cards (Ayurvedic, Cruelty Free, No Parabens, Natural)
- `components/home/TestimonialsCarousel.tsx` — Embla Carousel with autoplay; star rating, review excerpt, author name + verified badge
- `components/home/BeforeAfterSlider.tsx` — drag-handle image comparison slider; touch-enabled
- `components/home/BlogPreview.tsx` — 3-column async server component; "View all" link
- `components/home/NewsletterBanner.tsx` — email capture; calls `POST /api/newsletter`
- `components/product/ProductCard.tsx` — image, name, price + compare-at, star rating, wishlist heart, add-to-cart overlay
- `components/blog/BlogCard.tsx` — cover image, category badge, title, excerpt, publish date

#### Auth Pages

- `app/[locale]/(auth)/login/page.tsx` — email/password + Google OAuth; toast feedback; redirect on success
- `app/[locale]/(auth)/register/page.tsx` — display name, email, password; `updateProfile` on creation; Google OAuth

#### API Routes

- `app/api/newsletter/route.ts` — `POST`; email validation + sanitisation; idempotent Firestore upsert (base64url doc ID); mock-mode passthrough
- `app/api/contact/route.ts` — `POST`; Zod-like validation; creates `supportTickets` doc; mock-mode passthrough
- `app/api/dev/seed/route.ts` — `POST`; batch upserts all `SEED_MAP` docs; returns 404 in production
- `app/api/dev/unseed/route.ts` — `POST`; batch deletes seed docs by known ID; returns 404 in production

#### Dev Seed Page

- `app/[locale]/dev/seed/page.tsx` — "Seed Firestore" + "Unseed Firestore" buttons; JSON result display; production-blocked by proxy middleware

#### Admin Settings (stub)

- `app/[locale]/(admin)/admin/settings/page.tsx` — settings UI stub (inventory, payment, shipping, site config)
- `app/api/admin/settings/{inventory,payment,shipping,site}/route.ts` — CRUD stubs for admin settings

### Changed

- `app/[locale]/layout.tsx` — fetches `siteConfig` server-side; passes `announcementText/link` to `AnnouncementBar`; uses named imports for all layout components; parallel `getMessages` + `getSiteConfig`
- `app/page.tsx` — root redirect to `/en` (next-intl middleware handles most cases)
- `proxy.ts` — renamed from `middleware.ts` per Next.js 16 convention; blocks `/dev/*` + `/api/dev/*` in production

### Fixed

- `Review.authorName` — added optional field; mock data populated with display names
- `AppUser.email` / `AppUser.displayName` — corrected to `string | null` matching Firebase SDK
- `CartItem` — removed non-existent `mrp` field; added `compareAtPrice` + optional `maxQuantity`
- `Variant.compareAtPrice` — used throughout instead of non-existent `discountedPrice`
- `Product.rating` — used instead of non-existent `avgRating`
- `Blog.coverImage` — used instead of non-existent `thumbnailUrl`
- `SiteConfig.announcementText/Link` — used instead of non-existent `announcementBar` sub-object
- `CartDrawer` item name — `item.name` (plain string) instead of `item.name.en`
- `CategoryGrid` — `cat.label` instead of non-existent `cat.name` / `cat.icon`
- `TestimonialsCarousel` — `isVerifiedPurchase` instead of non-existent `isVerified`
- `Footer` — removed unused `useTranslations` import (Server Component)

### Dependencies Added

- `lucide-react` — icon library used across layout and product components
- `embla-carousel-autoplay` — autoplay plugin for testimonials carousel

---

## Pre-Phase Planning — 2026-03-07

### Added

- Initial `plan.md` — full project plan: tech stack, brand guide, colour palette, typography, Firestore collections, complete site structure, data models, 8-phase delivery roadmap
- Scope refinements: INR-only / domestic India; Firebase Spark free tier + Vercel Hobby (no Blaze/Cloud Functions); confirmed brand theme from Keshli product packaging photo; added Keshli Hair Care Tablet as confirmed product; added `supplements` product category
