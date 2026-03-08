# Licorice Herbals — GitHub Copilot Instructions

## Project Overview

Licorice Herbals is a Next.js e-commerce storefront for an Ayurvedic skincare brand, built with:

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4 with CSS custom properties for theming
- **Database**: Firebase Firestore (Admin SDK on server, Client SDK in browser)
- **Auth**: Firebase Auth via custom `AuthProvider` + Zustand `useAuthStore`
- **Email**: Resend API
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand (`useCartStore`, `useCheckoutStore`, `useWishlistStore`, `useAuthStore`)
- **i18n**: next-intl with locales `en`, `hi`, `mr`
- **Payments**: WhatsApp/UPI-first, Razorpay optional, COD
- **Shipping**: Shiprocket integration
- **Deployment**: Vercel + Firebase

---

## Repo Layout

```
app/[locale]/               # All user-facing pages under locale
app/[locale]/(admin)/       # Admin panel (protected)
app/[locale]/(auth)/        # Auth pages
app/api/                    # API route handlers
components/                 # Shared React components
  admin/                    # Admin-only components
  account/                  # Customer account components
  blog/                     # Blog components
  cart/, checkout/, home/,
  layout/, product/, support/, ui/
constants/                  # site.ts, categories.ts, policies.ts, theme.ts
lib/
  db.ts                     # Server-side Firestore data access layer
  types.ts                  # All TypeScript interfaces
  actions/                  # Server Actions (Next.js)
  firebase/                 # Firebase admin + client init
  mocks/                    # Seed/mock data for dev without Firebase
messages/                   # i18n JSON (en.json, hi.json, mr.json)
stores/                     # Zustand stores
```

---

## Key Conventions

### Page Architecture (Server/Client Split)
- **Server Component** (`page.tsx`): metadata, data fetching, passes props to client component
- **Client Component** (`{Page}Client.tsx`): interactivity, forms, state
- Example: `contact/page.tsx` → `ContactPageClient.tsx`

### Admin Pages (`app/[locale]/(admin)/admin/{section}/`)
- Protected by `AdminLayout` which wraps with `AdminSidebar`
- **List page**: `page.tsx` → DataTable with action links
- **Create page**: `new/page.tsx` → form
- **Edit page**: `[id]/page.tsx` → form pre-filled

### Data Access (`lib/db.ts`)
- **Server-only** — uses Firebase Admin SDK
- Always call `isFirebaseReady()` before any Firestore operation
- Always wrap reads with `stripTimestamps()` before returning to RSC (serialization)
- Falls back to `SEED_*` mock data if Firebase is not configured
- Naming: `getProducts()`, `getProduct(slug)`, `saveProduct(data)`, `deleteProduct(id)`

### API Routes (`app/api/{route}/route.ts`)
- Export named `GET` / `POST` / `PATCH` / `DELETE` async functions
- Validate user input with Zod at the boundary
- Admin routes read the auth token and verify `user.role === "admin"`

### Server Actions (`lib/actions/`)
- Zod validation at entry
- Firestore write via Admin SDK
- Send emails with Resend (non-blocking, in try-catch)
- Return `{ success: true, data? }` or throw/return error

### Forms
- Always use `react-hook-form` + `zodResolver`
- Toast feedback with `react-hot-toast`
- Show loading state on submit button during async calls

### Styling
- Tailwind utility classes only — no custom CSS unless adding a new CSS variable
- Theme tokens live in `constants/theme.ts` and `app/globals.css`
- Never hard-code brand colors; use CSS variables (`var(--color-primary)`, etc.)
- Never hard-code brand strings; use `constants/site.ts`

### i18n
- All routes are under `app/[locale]/`
- Server components: `const t = await getTranslations('namespace')`
- Client components: `const t = useTranslations('namespace')`
- Add new strings to all three files: `messages/en.json`, `hi.json`, `mr.json`
- Namespaces: `nav`, `home`, `product`, `cart`, `checkout`, `account`, `support`, etc.

---

## Firestore Collections

| Collection | Description |
|---|---|
| `products` | Product documents with variants |
| `categories` | Product categories |
| `concerns` | Skin/hair concerns |
| `blogs` | Blog posts (HTML body from Tiptap) |
| `orders` | Customer orders + sub-collection `timeline` |
| `reviews` | Product reviews (moderated) |
| `coupons` | Discount codes |
| `supportTickets` | Support tickets + sub-collection `messages` |
| `consultations` | Consultation bookings |
| `corporateInquiries` | Corporate gifting inquiries |
| `newsletter` | Newsletter subscribers |
| `settings/siteConfig` | Global site config (singleton) |
| `settings/shippingRules` | Shipping rules (singleton) |
| `settings/paymentSettings` | Payment configuration (singleton) |
| `settings/inventorySettings` | Inventory thresholds (singleton) |

---

## Core Types (lib/types.ts)

Key interfaces (add new types here, never inline in components):

- `Product`, `Variant`, `Ingredient`, `FAQ`
- `Category`, `Concern`
- `Blog`, `BlogCategory`, `BlogStatus`
- `Order`, `OrderItem`, `OrderEvent`, `OrderStatus`, `PaymentStatus`
- `Coupon`, `Review`, `ReviewStatus`
- `SupportTicket`, `TicketMessage`, `ConsultationBooking`, `CorporateInquiry`
- `AppUser`, `CartItem`
- `SiteConfig`, `ShippingRules`, `PaymentSettings`, `InventorySettings`
- `LocalizedString` — `{ en: string; hi?: string; mr?: string }`

---

## Reusable UI Components (`components/ui/`)

Prefer existing UI components over custom HTML. Common ones:

- `Button` — variants: primary, secondary, ghost, destructive
- `Input`, `Textarea`, `Select`
- `Modal` — controlled open/close
- `StatusBadge` — for order/ticket/payment statuses
- `DataTable` — generic sortable + paginated table (columns: `{ key, header, sortable?, render }`)
- `ImageUploader` — drag-drop multi-image uploader

---

## Admin Components (`components/admin/`)

- `AdminSidebar` — navigation groups: Overview, Commerce, Content, Support, Settings
- `DataTable` — list views
- `ProductForm` — create/edit products
- `RichTextEditor` — Tiptap editor for blog content
- `ImageUploader` — product/blog image management
- `StockAdjustModal`, `ShipOrderModal`, `RefundModal`
- `OrderStatusSelect`, `ReviewModerationCard`, `ConsultationCard`

---

## Security Rules

1. **Never expose Firebase Admin credentials** to the client bundle
2. **Always validate admin role** before admin API routes/actions: `user.role !== "admin"` → 403
3. **Sanitize HTML** before rendering blog body content (`dangerouslySetInnerHTML`)
4. **Validate all user input** with Zod in API routes and Server Actions
5. **No raw SQL / NoSQL injection**: use typed Firestore document references only
6. **Environment variables**: secrets in `.env.local`, never committed; public vars must be prefixed `NEXT_PUBLIC_`

---

## Do Not

- Hard-code brand strings — use `constants/site.ts`
- Hard-code colors — use Tailwind theme tokens or CSS variables
- Import Firebase Admin SDK in client components (`"use client"`)
- Skip `isFirebaseReady()` check before Firestore operations
- Return Firestore `Timestamp` objects to RSC (use `stripTimestamps()`)
- Add comments or docstrings to code you didn't change
- Create abstractions for one-time operations
- Add features beyond what is explicitly requested
