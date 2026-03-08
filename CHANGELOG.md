# Changelog

All notable changes to **Licorice Herbals** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added

#### Admin Analytics Page

- `app/[locale]/(admin)/admin/analytics/page.tsx` — server-rendered analytics page with economic and website growth charts; queries Firestore for paid orders, all orders, users, products, and reviews over a configurable rolling window
- `components/admin/AnalyticsCharts.tsx` — SVG chart components (no chart library): line/area charts for revenue, orders, AOV, customers, products, reviews; donut chart for payment method breakdown; horizontal bars for category revenue; **Most Popular Products** bar chart (top 10 by units sold); **Low Inventory Alert** table (up to 15 items, color-coded status badges)
- `components/admin/AnalyticsRangePicker.tsx` — client-side time range selector (3m / 6m / 12m / 24m) using URL search params; all charts and stats re-fetch server-side on range change
- Added "Analytics" link with `BarChart3` icon to `AdminSidebar.tsx` under Overview group

#### Admin Product CRUD

- `app/api/admin/products/route.ts` — POST create product API
- `app/api/admin/products/[id]/route.ts` — PATCH update, DELETE product APIs
- `lib/db.ts` — added `getAllProducts()`, `saveProduct()`, `deleteProduct()` functions
- `components/admin/ProductForm.tsx` — dynamic category/concern fetching, auto-slug generation, Firebase auth token for API calls, router navigation on save

#### Admin Categories & Concerns Client Refactor

- `app/[locale]/(admin)/admin/categories/CategoriesClient.tsx` — extracted client-side CRUD into separate component
- `app/[locale]/(admin)/admin/concerns/ConcernsClient.tsx` — extracted client-side CRUD into separate component

#### Dark Theme

- `next-themes` dependency added for theme persistence
- `components/ThemeProvider.tsx` — next-themes provider wrapper
- `components/layout/ThemeToggle.tsx` — Sun/Moon toggle button in Navbar
- `app/globals.css` — full dark theme colour palette (`.dark` class CSS variables)
- `@custom-variant dark` directive for Tailwind dark mode support

#### Promo Banners (Public)

- `components/product/PromoBannerStrip.tsx` — product-page promotional banner strip
- `app/api/promo-banners/route.ts` — public GET API for active promo banners
- `lib/db.ts` — `getActivePromoBanners()` now supports scoped filtering (global / product-specific) with expiry date checking

#### Navbar & Layout Enhancements

- Admin shield icon link in Navbar for admin users
- Logout button in Navbar for authenticated users
- `ThemeToggle` integrated into Navbar and MobileMenu
- `app/layout.tsx` — wrapped with `ThemeProvider`
- `components/layout/Navbar.tsx` — `bg-white/95` → `bg-background/95` for dark mode support
- `components/layout/MobileMenu.tsx` — added theme toggle, admin link, logout to mobile menu

#### PWA Assets

- `public/favicon.ico`, `public/apple-icon.png`, `public/icon0.svg`, `public/icon1.png`
- `public/web-app-manifest-192x192.png`, `public/web-app-manifest-512x512.png`
- `public/manifest.json` — updated with new icon paths

### Changed

- `constants/theme.ts` — `mutedForeground` → `#574A85`, `border` → `#C4B5DE` (higher contrast)
- `components/ui/StatusBadge.tsx` — updated status colour mappings
- Multiple admin settings pages — minor form field and layout refinements
- `app/[locale]/products/[slug]/page.tsx`, `shop/page.tsx`, `shop/[category]/page.tsx` — promo banner integration
- `app/[locale]/concern/page.tsx`, `concern/[concern]/page.tsx`, `consultation/page.tsx` — layout adjustments
- `messages/en.json`, `messages/hi.json`, `messages/mr.json` — updated translation keys
- `components/AuthProvider.tsx` — minor auth state handling update

---

## [Phase 8+9] — Dynamic CMS, i18n, SEO, Security, PWA & Polish

### Summary

Full dynamic CMS for all homepage sections, navigation, testimonials, promo banners, and static pages. Complete Hindi & Marathi translations. SEO with sitemap + robots. Security headers & Firestore rules. PWA manifest. UI polish with error pages, account deletion, and API fetch utility.

### Added

#### Dynamic CMS (Phase 8)

- 20+ db functions in `lib/db.ts` for navigation, homepage sections, testimonials, pages, consultation config, promo banners, categories, concerns
- 8 admin API routes: categories, concerns, pages, promo banners, consultation, homepage, navigation, testimonials CRUD
- 6 admin pages: homepage settings, navigation editor, testimonials manager, promo banners, static pages, consultation config
- `lib/seeds/` system — seed data for products, blogs, reviews, categories, concerns, testimonials, pages, navigation, settings, inventory, coupons, users
- `components/admin/AdminSidebar.tsx` — full sidebar navigation with grouped menu items (Overview, Commerce, Content, Support, Settings)
- Updated `HeroBanner` and `BrandValues` to accept dynamic CMS config
- Homepage and consultation page fetch from CMS

#### Admin CRUD Additions (Phase 8 cont.)

- Admin categories page with inline create/delete CRUD
- Admin concerns page with inline create/delete CRUD
- Admin coupons: create coupon page with full Zod validation form + coupon list page
- Admin settings: general, pages, payments, shipping — full form pages with save to Firestore
- Privacy policy page
- Forgot password page
- Cart page (`/cart`)
- Concerns browse page (`/concern`)

#### i18n Translations (Phase 9)

- `messages/hi.json` — complete Hindi translations for all 12+ namespaces
- `messages/mr.json` — complete Marathi translations for all 12+ namespaces
- `scripts/write-translations.mjs` — translation generation helper

#### SEO (Phase 9)

- `app/robots.ts` — dynamic robots.txt
- `app/sitemap.ts` — dynamic sitemap with product, blog, category, concern pages × 3 locales
- `metadataBase` configuration in root layout

#### Security (Phase 9)

- `firestore.rules` — updated with testimonials, promoBanners, pages collection rules
- `next.config.ts` — CSP and security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

#### PWA (Phase 9)

- `public/manifest.json` — web app manifest with theme colour and icons
- Apple-touch-icon and theme-color meta tags

#### UI Polish & Error Handling (Phase 8 cont.)

- `app/error.tsx` + `app/not-found.tsx` — root-level error and 404 pages with brand styling
- `app/[locale]/error.tsx` + `app/[locale]/not-found.tsx` — locale-scoped error and 404 pages
- `lib/api-fetch.ts` — typed API fetch utility with error handling, used across all client components
- `app/api/account/delete/route.ts` — account deletion endpoint (deletes Firebase Auth user + Firestore doc)
- Account profile page — added account deletion with confirmation
- Checkout flow polish — improved field validation and error states
- Seed page UI — enhanced with better status feedback

### Changed

- `lib/types.ts` — added `NavigationConfig`, `HomepageSections`, `Testimonial`, `PageDoc`, `ConsultationConfig`, `PromoBanner` types
- Mock data files simplified to minimal stubs (seed data moved to `lib/seeds/`)
- `i18n/routing.ts` — added `localePrefix` config
- Multiple component fetch calls migrated from inline `fetch` to `apiFetch` utility

---

## [Phase 7] — Content (Blog, Newsletter, Before/After Gallery)

### Summary

Full blog system with admin CRUD, newsletter subscriber management, and interactive before/after image comparison gallery. 21 files, 2,036 insertions.

### Added

#### Blog Storefront

- `app/[locale]/blog/page.tsx` — blog listing with category tabs
- `app/[locale]/blog/[slug]/page.tsx` — blog detail page with JSON-LD structured data
- `app/[locale]/blog/diet/page.tsx` — diet & lifestyle blog category page
- `components/blog/BlogContent.tsx` — renders rich HTML blog body
- `components/blog/RelatedPosts.tsx` — related blog posts grid

#### Blog Admin

- `app/[locale]/(admin)/admin/blogs/page.tsx` — blog list with status tabs (draft/published/archived)
- `app/[locale]/(admin)/admin/blogs/new/page.tsx` — create new blog post
- `app/[locale]/(admin)/admin/blogs/[id]/page.tsx` — edit existing blog post
- `app/[locale]/(admin)/admin/blogs/BlogForm.tsx` — full blog form with Zod validation
- `app/api/admin/blogs/route.ts` — POST (create), PATCH (update), DELETE blog API with admin auth

#### Newsletter Admin

- `app/[locale]/(admin)/admin/newsletter/page.tsx` — subscriber table with stats and CSV export

#### Before/After Gallery

- `components/home/BeforeAfterCard.tsx` — interactive drag slider (touch-enabled, keyboard accessible) with before/after image comparison
- Updated `BeforeAfterSlider.tsx` to feed from Firestore/mock data

#### Database

- `lib/db.ts` — added `getAllBlogs()`, `saveBlog()`, `deleteBlog()`, `getBlogsByCategory()` functions

#### Scripts

- `scripts/debug-firebase.mjs` — Firebase connection debugging helper
- `scripts/deploy-firebase-rules.mjs` — Firestore rules deployment script
- `scripts/write-indexes-json.mjs` — composite index generator

### Changed

- `firestore.indexes.json` — updated with blog composite query indexes
- `saveBlog` type signature updated to support optional id for creation

---

## [Phase 6] — Support & Consultation

### Summary

Complete support ticket system, consultation booking, and corporate gifting inquiry pipeline. Customer self-service support portal. 41 files, 3,996 insertions.

### Added

#### Support Ticket System

- `app/[locale]/(admin)/admin/support/page.tsx` — admin ticket inbox
- `app/[locale]/(admin)/admin/support/[ticketId]/page.tsx` — admin ticket detail
- `app/[locale]/(admin)/admin/support/[ticketId]/AdminTicketActions.tsx` — reply, internal notes, status transitions
- `app/api/admin/support/tickets/[id]/reply/route.ts` — admin reply API
- `app/api/admin/support/tickets/[id]/status/route.ts` — admin status update API
- `app/[locale]/account/support/page.tsx` — customer support ticket list
- `app/[locale]/account/support/[id]/page.tsx` — customer ticket thread view
- `app/api/support/tickets/route.ts` — GET (list) + POST (create) customer tickets
- `app/api/support/tickets/[id]/route.ts` — GET ticket detail
- `app/api/support/tickets/[id]/reply/route.ts` — customer reply API
- `components/admin/TicketInbox.tsx` — admin inbox with status tabs and overdue highlighting
- `components/support/TicketCard.tsx` — compact ticket row component
- `components/support/TicketThread.tsx` — threaded message display

#### Consultation Booking

- `app/[locale]/consultation/page.tsx` — consultation booking landing page
- `app/[locale]/consultation/ConsultationForm.tsx` — form with concern selection, date/time preference, Zod validation
- `lib/actions/bookConsultation.ts` — Server Action: creates booking doc, sends Resend email notification
- `app/[locale]/(admin)/admin/consultations/page.tsx` — admin consultations with upcoming/past tabs, confirm/complete actions
- `app/api/admin/consultations/[id]/status/route.ts` — consultation status transition API
- `components/admin/ConsultationCard.tsx` — consultation detail card with status actions

#### Corporate Gifting

- `app/[locale]/corporate-gifting/page.tsx` — corporate gifting inquiry page
- `app/[locale]/corporate-gifting/CorporateGiftingForm.tsx` — inquiry form with Zod validation
- `lib/actions/submitCorporateInquiry.ts` — Server Action: creates inquiry doc
- `app/[locale]/(admin)/admin/corporate/page.tsx` — admin corporate inquiries with inline status management
- `app/api/admin/corporate/[id]/status/route.ts` — status transition API

#### Customer Account

- `components/account/GetHelpButton.tsx` — "Get Help" button on order detail, opens support ticket
- Updated account dashboard with Support quick-link tile

### Changed

- `app/api/contact/route.ts` — upgraded to generate ticket numbers and use Firestore subcollections
- `components/ui/StatusBadge.tsx` — extended with ticket status variants (open, in_progress, waiting_customer, resolved, closed)
- `lib/types.ts` — added `CorporateInquiry`, `CorporateInquiryStatus` types

#### Firebase Config

- `.firebaserc` — Firebase project configuration
- `firebase.json` — Firestore and storage hosting rules
- `firestore.indexes.json` — composite indexes for support ticket queries
- `firestore.rules` — security rules for all collections
- `storage.rules` — Firebase Storage security rules (images: max 5 MB, allowed MIME types)

#### Scripts

- `scripts/sync-env-vercel.mjs` — Vercel environment variable sync utility

---

## [Phase 5] — Reviews & Trust System

### Summary

Full product review system with customer submission, rating distribution, photo gallery, admin moderation queue, and helpful/flag voting. 21 files, 1,658 insertions.

### Added

#### Customer Reviews

- `components/product/AddReviewForm.tsx` — star rating, title, body, image upload with Zod validation
- `components/product/ReviewsList.tsx` — rating distribution chart, sort (newest/highest/lowest/most helpful), filter by star, pagination
- `components/product/ReviewCard.tsx` — review display with helpful vote and report/flag buttons
- `components/product/ReviewPhotoGallery.tsx` — review image grid with lightbox zoom
- `components/product/ReviewFilters.tsx` — star filter bar (5★ / 4★ / 3★ etc.)
- Updated `app/[locale]/products/[slug]/page.tsx` — real review section with ReviewsList

#### Admin Review Moderation

- `app/[locale]/(admin)/admin/reviews/page.tsx` — review moderation queue with status tabs
- `app/[locale]/(admin)/admin/reviews/[id]/page.tsx` — individual review detail with approve/reject/reply
- `components/admin/ReviewModerationCard.tsx` — card with verified purchase badge, admin reply system, rejection with reason

#### Server Actions & API

- `lib/actions/reviews.ts` — `submitReview`, `approveReview`, `rejectReview`, `addAdminReply`, `flagReview`, `markReviewHelpful`
- `app/api/review/flag/route.ts` — POST review flag/report API
- `lib/db.ts` — added review query functions (by product, by status, by ID)

### Changed

- `lib/types.ts` — added `ReviewFlag`, `ReviewFlagReason` types
- `components/admin/DashboardCharts.tsx` — enhanced chart rendering
- `lib/shiprocket.ts` — minor reliability improvements

---

## [Phase 4] — Shipping & Tracking · Branch: `phase-4-shipping-tracking`

### Summary

Full Shiprocket integration for automatic shipment creation, live webhook-driven tracking, manual shipping fallback, customer-facing public tracking page, return request flow, and the admin dashboard stats grid. TypeScript clean (exit 0), build clean.

### Added

#### Shiprocket Integration

- `lib/shiprocket.ts` — server-only helper: `getToken()`, `checkServiceability()`, `createShipment()`, `cancelShipment()`, `trackByAwb()`, `validateWebhookSignature()`, `mapShiprocketStatus()`; all calls use `AbortSignal.timeout(8000)`; mock fallback when `SHIPROCKET_EMAIL` env var absent
- `app/api/shiprocket/token/route.ts` — GET; caches Shiprocket JWT in Firestore `/settings/shiprocketToken` with 24 h TTL; returns `{ token }` within Vercel 10 s limit
- `app/api/shiprocket/create-order/route.ts` — POST (admin); fetches order, builds Shiprocket payload, stores `awbCode / courierName / shiprocketOrderId / shiprocketShipmentId` on order, appends timeline event
- `app/api/shiprocket/cancel-order/route.ts` — POST (admin); calls Shiprocket cancel, releases stock via `adjustStock`, sets `orderStatus: "cancelled"`
- `app/api/shiprocket/track/route.ts` — GET `?awb=` or `?orderId=`; proxies Shiprocket tracking API; resolves AWB from orderId if needed
- `app/api/shiprocket/webhook/route.ts` — POST; HMAC-SHA256 validation of `X-Shiprocket-Hmac-Sha256` header; maps Shiprocket statuses to internal `OrderStatus`; batch-updates order + timeline; sends Resend milestone emails (shipped / out_for_delivery / delivered); returns 200 even on Firestore errors to prevent retries

#### Admin Shipping Tools

- `components/admin/ShipOrderModal.tsx` — two-tab modal: **Shiprocket** tab (auto-creates shipment, stores AWB) and **Manual** tab (courier name + AWB text field + optional tracking URL, sets `manualShipping: true`); loading states, toasts, `router.refresh()`
- `app/api/admin/orders/[orderId]/ship-manual/route.ts` — POST (admin); stores manual courier details, updates `orderStatus: "shipped"`, appends timeline event
- Updated `AdminOrderActions.tsx` — "Ship Order" button visible for `confirmed / processing / ready_to_ship` statuses; opens `ShipOrderModal`
- Updated admin order `[id]/page.tsx` — displays AWB, courier, tracking URL (clickable), manual shipping badge

#### Customer Tracking

- `app/[locale]/track/page.tsx` — public server-rendered tracking page; fetches order + timeline + live Shiprocket tracking; shows status hero, timeline, courier details
- `app/[locale]/track/TrackForm.tsx` — client search form; Order ID or AWB toggle + optional email verification

#### Returns

- `components/account/ReturnRequestButton.tsx` — client component; visible only within `RETURN_WINDOW_DAYS` of delivery; modal with reason select (damaged / wrong_item / defective / expired), note textarea, up to 3 image uploads (5 MB each); submits to `/api/account/return-request`
- `app/api/account/return-request/route.ts` — POST multipart (authenticated customer); validates MIME/size; uploads images to Firebase Storage `return-proofs/{orderId}/`; updates order to `return_requested`
- Updated `account/orders/[id]/page.tsx` — return request section (shown when delivered + within window); return status section (shown when `return_requested` or `return_picked_up`)

#### Admin Dashboard

- `components/admin/StatsCard.tsx` — reusable stat card; props: `label, value, icon, subtext?, trend?, href?, accentColor?`; wraps in `<a>` if `href` provided
- `app/[locale]/admin/page.tsx` — server-rendered dashboard; revenue today / this month, orders today, low-stock count, open tickets, pending reviews, pending WhatsApp payments stats grid; amber alert banner for pending WhatsApp payments with "Review All" link; recent 10 orders table with inline `OrderStatusSelect`

### Changed

- `lib/db.ts` — extended `updateOrderStatus` Pick type to include `returnReason`, `returnImages`, `courierTrackingUrl`, `manualShipping`, `manualCourierName`, `manualAwbCode`

---

## [Phase 3] — Commerce & Payments · Branch: `phase-3-commerce`

### Summary

Full end-to-end purchase flow: cart → checkout (5-step) → WhatsApp / COD / Razorpay payment → order confirmation → admin order management → customer account pages. 40+ new components, pages, and API routes. Build: 159 static pages, TypeScript clean (exit 0).

### Added

#### Cart

- `stores/useCartStore.ts` — Zustand cart with add / remove / updateQty / clear; persisted to localStorage
- `stores/useWishlistStore.ts` — toggle + isWished; persisted to localStorage
- `stores/useCheckoutStore.ts` — 5-step checkout state; `ShippingMode` type shared with server via `constants/policies.ts`
- `components/cart/CartItem.tsx` — thumbnail, name, variant, qty stepper, line total, remove
- `components/cart/CartSummary.tsx` — subtotal, coupon discount, shipping, COD fee, total
- `components/cart/CouponInput.tsx` — apply / remove coupon via `POST /api/coupon/validate`
- `app/api/coupon/validate/route.ts` — 7-rule server-side coupon validation

#### Checkout Flow

- `app/[locale]/checkout/page.tsx` + `CheckoutClient.tsx` — 5-step flow
- `components/checkout/CheckoutStepper.tsx` — horizontal step indicator with completed / active states
- `components/checkout/AddressList.tsx` — saved address radio list + "Add New" card
- `components/checkout/AddressForm.tsx` — React Hook Form + Zod; Indian states dropdown; saves via API
- `components/checkout/ShippingOptions.tsx` — Standard / Express / Same Day options with prices
- `components/checkout/PaymentOptions.tsx` — renders only enabled payment methods from settings
- `components/checkout/OrderSummary.tsx` — final read-only breakdown: items, subtotal, discount, shipping, COD fee, total

#### WhatsApp Payment

- `components/checkout/WhatsAppPaymentInstructions.tsx` — UPI ID copy field, QR image, WhatsApp deep-link
- `components/checkout/WhatsAppProofUpload.tsx` — image upload (max 5 MB) → `POST /api/payment/whatsapp/submit-proof`
- `app/api/payment/whatsapp/submit-proof/route.ts` — validates MIME/size, uploads to Firebase Storage, updates order `paymentStatus: "proof_submitted"`

#### Order Creation

- `lib/actions/createOrder.ts` — Server Action: Zod validation → coupon re-validation → Firestore transaction (stock reserve + order write + counter increment); returns `{ orderId, orderNumber }`
- `app/api/order-confirm/route.ts` — idempotent post-payment confirmation; sends Resend email; writes timeline event

#### API Routes

- `app/api/pincode-check/route.ts` — Shiprocket serviceability proxy; mock fallback
- `app/api/products/route.ts` — `GET /api/products?ids=...` for client-side wishlist page
- `app/api/account/addresses/route.ts` — GET (list) + POST (save) user addresses
- `app/api/account/addresses/[addressId]/route.ts` — DELETE a saved address
- `app/api/admin/orders/[orderId]/status/route.ts` — PATCH admin order status + timeline event
- `app/api/admin/orders/[orderId]/refund/route.ts` — POST refund via Razorpay API or manual record

#### Admin Order Management

- `app/[locale]/admin/orders/page.tsx` + `AdminOrdersTable.tsx` — DataTable with status / payment filter
- `app/[locale]/admin/orders/[id]/page.tsx` + `AdminOrderActions.tsx` — full order detail, WhatsApp proof, status select, timeline, refund modal
- `components/admin/OrderStatusSelect.tsx` — valid next-status dropdown with confirmation dialog
- `components/admin/WhatsAppPaymentConfirm.tsx` — inline proof image + Confirm Payment button
- `components/admin/RefundModal.tsx` — amount + note; Razorpay API refund or manual record

#### Customer Account

- `app/[locale]/account/page.tsx` — dashboard: greeting, last 3 orders, quick links
- `app/[locale]/account/orders/page.tsx` — paginated order history
- `app/[locale]/account/orders/[id]/page.tsx` — order detail with items, pricing, address, timeline
- `app/[locale]/account/wishlist/page.tsx` — wishlisted product grid with remove toggle
- `app/[locale]/account/addresses/page.tsx` — saved address cards; add / edit / delete
- `app/[locale]/account/profile/page.tsx` — edit display name, phone; change password
- `components/account/OrderCard.tsx` — compact order row with status badge and "View" link
- `components/account/OrderTimeline.tsx` — vertical timeline of `OrderEvent` docs
- `components/account/AddressCard.tsx` — formatted address with edit / delete / set-default actions

### Fixed

- `serverExternalPackages: ["firebase-admin"]` in `next.config.ts` — prevents Turbopack from bundling firebase-admin into client chunks
- `isFirebaseReady()` moved from `lib/db.ts` → `lib/utils.ts` so `AuthProvider.tsx` can import it without pulling the server SDK into the client bundle
- `getShippingCharge()` + `ShippingMode` type consolidated in `constants/policies.ts` to be safely imported by both server actions and client components
- `getServerUser()` helper added to `lib/auth.ts` for server component auth (uses `next/headers` instead of `NextRequest`)

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
