// lib/db.ts
// Unified data-access layer.
// All Server Components and Server Actions import from here — never from Firestore directly.
// Automatically falls back to in-memory mock data when Firebase is unconfigured
// or when NEXT_PUBLIC_USE_MOCK_DATA=true.

import type {
  Product,
  Category,
  Concern,
  Blog,
  BlogCategory,
  Coupon,
  Review,
  SiteConfig,
  PaymentSettings,
  ShippingRules,
  InventorySettings,
  InventoryDoc,
  StockMovement,
  StockMovementType,
} from "@/lib/types";
import {
  SEED_PRODUCTS,
  SEED_CATEGORIES,
  SEED_CONCERNS,
  SEED_BLOGS,
  SEED_COUPONS,
  SEED_REVIEWS,
  SEED_SITE_CONFIG,
  SEED_PAYMENT_SETTINGS,
  SEED_SHIPPING_RULES,
  SEED_INVENTORY_SETTINGS,
  SEED_INVENTORY,
} from "@/lib/mocks";

// ── Firebase readiness ────────────────────────────────────────────────────────

export function isFirebaseReady(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") return false;
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  );
}

// ── Product filters ───────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: string;
  concern?: string;
  isFeatured?: boolean;
  isCombo?: boolean;
  isActive?: boolean;
  limit?: number;
}

function filterMockProducts(products: Product[], filters?: ProductFilters): Product[] {
  let results = products.filter((p) => p.isActive);
  if (filters?.category) results = results.filter((p) => p.category === filters.category);
  if (filters?.concern) results = results.filter((p) => p.concerns.includes(filters.concern!));
  if (filters?.isFeatured !== undefined)
    results = results.filter((p) => p.isFeatured === filters.isFeatured);
  if (filters?.isCombo !== undefined)
    results = results.filter((p) => p.isCombo === filters.isCombo);
  if (filters?.limit) results = results.slice(0, filters.limit);
  return results.sort((a, b) => a.sortOrder - b.sortOrder);
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  if (!isFirebaseReady()) return filterMockProducts(SEED_PRODUCTS, filters);
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldPath } = await import("firebase-admin/firestore");
    let query: FirebaseFirestore.Query = adminDb
      .collection("products")
      .where("isActive", "==", true);
    if (filters?.category) query = query.where("category", "==", filters.category);
    if (filters?.isFeatured !== undefined)
      query = query.where("isFeatured", "==", filters.isFeatured);
    if (filters?.isCombo !== undefined) query = query.where("isCombo", "==", filters.isCombo);
    if (filters?.limit) query = query.limit(filters.limit);
    const snap = await query.get();
    let results = snap.docs.map((d) => d.data() as Product);
    if (filters?.concern) results = results.filter((p) => p.concerns.includes(filters.concern!));
    return results.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (err) {
    console.warn("[db] Firestore getProducts failed — falling back to mock data", err);
    return filterMockProducts(SEED_PRODUCTS, filters);
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (!isFirebaseReady()) {
    return SEED_PRODUCTS.find((p) => p.slug === slug && p.isActive) ?? null;
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("products")
      .where("slug", "==", slug)
      .where("isActive", "==", true)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return snap.docs[0].data() as Product;
  } catch (err) {
    console.warn("[db] Firestore getProduct failed — falling back to mock data", err);
    return SEED_PRODUCTS.find((p) => p.slug === slug && p.isActive) ?? null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isFirebaseReady()) {
    return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("products").doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Product;
  } catch (err) {
    console.warn("[db] Firestore getProductById failed — falling back to mock data", err);
    return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
  }
}

// ── Categories & Concerns ─────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  if (!isFirebaseReady()) return SEED_CATEGORIES;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb.collection("categories").get();
    return snap.docs.map((d) => d.data() as Category);
  } catch (err) {
    console.warn("[db] Firestore getCategories failed — falling back to mock data", err);
    return SEED_CATEGORIES;
  }
}

export async function getConcerns(): Promise<Concern[]> {
  if (!isFirebaseReady()) return SEED_CONCERNS;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb.collection("concerns").get();
    return snap.docs.map((d) => d.data() as Concern);
  } catch (err) {
    console.warn("[db] Firestore getConcerns failed — falling back to mock data", err);
    return SEED_CONCERNS;
  }
}

// ── Blogs ─────────────────────────────────────────────────────────────────────

export async function getBlogs(category?: BlogCategory, limit?: number): Promise<Blog[]> {
  if (!isFirebaseReady()) {
    let blogs = SEED_BLOGS.filter((b) => b.status === "published");
    if (category) blogs = blogs.filter((b) => b.category === category);
    if (limit) blogs = blogs.slice(0, limit);
    return blogs.sort((a, b) => {
      const aDate = a.publishedAt instanceof Date ? a.publishedAt : new Date();
      const bDate = b.publishedAt instanceof Date ? b.publishedAt : new Date();
      return bDate.getTime() - aDate.getTime();
    });
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    let query: FirebaseFirestore.Query = adminDb
      .collection("blogs")
      .where("status", "==", "published")
      .orderBy("publishedAt", "desc");
    if (category) query = query.where("category", "==", category);
    if (limit) query = query.limit(limit);
    const snap = await query.get();
    return snap.docs.map((d) => d.data() as Blog);
  } catch (err) {
    console.warn("[db] Firestore getBlogs failed — falling back to mock data", err);
    let blogs = SEED_BLOGS.filter((b) => b.status === "published");
    if (category) blogs = blogs.filter((b) => b.category === category);
    if (limit) blogs = blogs.slice(0, limit);
    return blogs;
  }
}

export async function getBlog(slug: string): Promise<Blog | null> {
  if (!isFirebaseReady()) {
    return SEED_BLOGS.find((b) => b.slug === slug && b.status === "published") ?? null;
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("blogs")
      .where("slug", "==", slug)
      .where("status", "==", "published")
      .limit(1)
      .get();
    if (snap.empty) return null;
    return snap.docs[0].data() as Blog;
  } catch (err) {
    console.warn("[db] Firestore getBlog failed — falling back to mock data", err);
    return SEED_BLOGS.find((b) => b.slug === slug && b.status === "published") ?? null;
  }
}

// ── Coupons ───────────────────────────────────────────────────────────────────

export async function getCoupon(code: string): Promise<Coupon | null> {
  if (!isFirebaseReady()) {
    return SEED_COUPONS.find((c) => c.code === code.toUpperCase()) ?? null;
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("coupons").doc(code.toUpperCase()).get();
    if (!doc.exists) return null;
    return doc.data() as Coupon;
  } catch (err) {
    console.warn("[db] Firestore getCoupon failed — falling back to mock data", err);
    return SEED_COUPONS.find((c) => c.code === code.toUpperCase()) ?? null;
  }
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getApprovedReviews(limit?: number): Promise<Review[]> {
  if (!isFirebaseReady()) {
    let results = SEED_REVIEWS.filter((r) => r.status === "approved");
    if (limit) results = results.slice(0, limit);
    return results;
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    let query: FirebaseFirestore.Query = adminDb
      .collection("reviews")
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc");
    if (limit) query = query.limit(limit);
    const snap = await query.get();
    return snap.docs.map((d) => d.data() as Review);
  } catch (err) {
    console.warn("[db] Firestore getApprovedReviews failed — falling back to mock data", err);
    let results = SEED_REVIEWS.filter((r) => r.status === "approved");
    if (limit) results = results.slice(0, limit);
    return results;
  }
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  if (!isFirebaseReady()) {
    return SEED_REVIEWS.filter((r) => r.productId === productId && r.status === "approved").sort(
      (a, b) =>
        (b.createdAt instanceof Date ? b.createdAt : new Date()).getTime() -
        (a.createdAt instanceof Date ? a.createdAt : new Date()).getTime(),
    );
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("reviews")
      .where("productId", "==", productId)
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => d.data() as Review);
  } catch (err) {
    console.warn("[db] Firestore getProductReviews failed — falling back to mock data", err);
    return SEED_REVIEWS.filter((r) => r.productId === productId && r.status === "approved");
  }
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfig> {
  if (!isFirebaseReady()) return SEED_SITE_CONFIG;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("settings").doc("siteConfig").get();
    if (!doc.exists) return SEED_SITE_CONFIG;
    return doc.data() as SiteConfig;
  } catch (err) {
    console.warn("[db] Firestore getSiteConfig failed — falling back to mock data", err);
    return SEED_SITE_CONFIG;
  }
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  if (!isFirebaseReady()) return SEED_PAYMENT_SETTINGS;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("settings").doc("paymentSettings").get();
    if (!doc.exists) return SEED_PAYMENT_SETTINGS;
    return doc.data() as PaymentSettings;
  } catch (err) {
    console.warn("[db] Firestore getPaymentSettings failed — falling back to mock data", err);
    return SEED_PAYMENT_SETTINGS;
  }
}

export async function getShippingRules(): Promise<ShippingRules> {
  if (!isFirebaseReady()) return SEED_SHIPPING_RULES;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("settings").doc("shippingRules").get();
    if (!doc.exists) return SEED_SHIPPING_RULES;
    return doc.data() as ShippingRules;
  } catch (err) {
    console.warn("[db] Firestore getShippingRules failed — falling back to mock data", err);
    return SEED_SHIPPING_RULES;
  }
}

export async function getInventorySettings(): Promise<InventorySettings> {
  if (!isFirebaseReady()) return SEED_INVENTORY_SETTINGS;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("settings").doc("inventorySettings").get();
    if (!doc.exists) return SEED_INVENTORY_SETTINGS;
    return doc.data() as InventorySettings;
  } catch (err) {
    console.warn("[db] Firestore getInventorySettings failed — falling back to mock data", err);
    return SEED_INVENTORY_SETTINGS;
  }
}

// ── Settings write functions ──────────────────────────────────────────────────

export async function updateSiteConfig(
  data: Partial<Omit<SiteConfig, "createdAt" | "updatedAt" | "orderCounter">>,
): Promise<void> {
  if (!isFirebaseReady()) return; // mock mode — no persistence between requests
  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");
  await adminDb
    .collection("settings")
    .doc("siteConfig")
    .set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function updateShippingRules(
  data: Partial<Omit<ShippingRules, "createdAt" | "updatedAt">>,
): Promise<void> {
  if (!isFirebaseReady()) return;
  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");
  await adminDb
    .collection("settings")
    .doc("shippingRules")
    .set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function updatePaymentSettings(
  data: Partial<Omit<PaymentSettings, "createdAt" | "updatedAt">>,
): Promise<void> {
  if (!isFirebaseReady()) return;
  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");
  await adminDb
    .collection("settings")
    .doc("paymentSettings")
    .set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function updateInventorySettings(
  data: Partial<Omit<InventorySettings, "createdAt" | "updatedAt">>,
): Promise<void> {
  if (!isFirebaseReady()) return;
  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");
  await adminDb
    .collection("settings")
    .doc("inventorySettings")
    .set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export async function getInventory(productId: string): Promise<InventoryDoc | null> {
  if (!isFirebaseReady()) {
    return SEED_INVENTORY.find((inv) => inv.productId === productId) ?? null;
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("inventory").doc(productId).get();
    if (!doc.exists) return null;
    return doc.data() as InventoryDoc;
  } catch (err) {
    console.warn("[db] Firestore getInventory failed — falling back to mock data", err);
    return SEED_INVENTORY.find((inv) => inv.productId === productId) ?? null;
  }
}

export async function getStockMovements(
  productId: string,
  variantId?: string,
  limit = 50,
): Promise<StockMovement[]> {
  if (!isFirebaseReady()) {
    // No seed movements — return empty array in mock mode
    return [];
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    let query: FirebaseFirestore.Query = adminDb
      .collection("inventory")
      .doc(productId)
      .collection("movements")
      .orderBy("createdAt", "desc")
      .limit(limit);
    if (variantId) query = query.where("variantId", "==", variantId);
    const snap = await query.get();
    return snap.docs.map((d) => d.data() as StockMovement);
  } catch (err) {
    console.warn("[db] Firestore getStockMovements failed", err);
    return [];
  }
}

export async function adjustStock(
  productId: string,
  variantId: string,
  delta: number,
  movement: Omit<StockMovement, "id" | "createdAt">,
): Promise<void> {
  if (!isFirebaseReady()) return; // no persistence in mock mode
  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");
  const inventoryRef = adminDb.collection("inventory").doc(productId);
  const movementRef = inventoryRef.collection("movements").doc();

  await adminDb.runTransaction(async (tx) => {
    const invSnap = await tx.get(inventoryRef);
    const inv = invSnap.exists ? (invSnap.data() as InventoryDoc) : null;
    const currentStock = inv?.variants?.[variantId]?.stock ?? 0;
    const newStock = Math.max(0, currentStock + delta);

    tx.set(
      inventoryRef,
      {
        productId,
        [`variants.${variantId}.stock`]: newStock,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    tx.set(movementRef, {
      id: movementRef.id,
      ...movement,
      variantId,
      quantity: Math.abs(delta),
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}
