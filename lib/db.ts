// lib/db.ts
// Unified data-access layer.
// All Server Components and Server Actions import from here — never from Firestore directly.
// Strategy: Firebase-first. Falls back to seed data when:
//   1. Firebase is unconfigured (NEXT_PUBLIC_USE_MOCK_DATA=true or no credentials)
//   2. Firestore returns no data for a given query (empty collection / missing doc)
//   3. Firestore throws an error (network, permissions, etc.)
// Users/auth are exempt — no seed fallback for authentication.

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
  Order,
  OrderEvent,
  Address,
  NavigationConfig,
  HomepageSections,
  Testimonial,
  PageDoc,
  ConsultationConfig,
  PromoBanner,
} from "@/lib/types";
import { isFirebaseReady, toSafeDate } from "@/lib/utils";
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
  SEED_HOMEPAGE_SECTIONS,
  SEED_CONSULTATION_CONFIG,
  SEED_TESTIMONIALS,
  SEED_PAGES,
  SEED_NAVIGATION,
} from "@/lib/seeds";

// ── Firebase readiness ────────────────────────────────────────────────────────

export { isFirebaseReady } from "@/lib/utils";

// ── Product filters ───────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: string;
  concern?: string;
  isFeatured?: boolean;
  isCombo?: boolean;
  isActive?: boolean;
  limit?: number;
}

function filterSeedProducts(products: Product[], filters?: ProductFilters): Product[] {
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
  if (!isFirebaseReady()) return filterSeedProducts(SEED_PRODUCTS, filters);
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
    if (snap.empty) return filterSeedProducts(SEED_PRODUCTS, filters);
    let results = snap.docs.map((d) => d.data() as Product);
    if (filters?.concern) results = results.filter((p) => p.concerns.includes(filters.concern!));
    return results.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (err) {
    console.warn("[db] Firestore getProducts failed \u2014 falling back to seed data", err);
    return filterSeedProducts(SEED_PRODUCTS, filters);
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
    if (snap.empty) return SEED_PRODUCTS.find((p) => p.slug === slug && p.isActive) ?? null;
    return snap.docs[0].data() as Product;
  } catch (err) {
    console.warn("[db] Firestore getProduct failed \u2014 falling back to seed data", err);
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
    if (!doc.exists) return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
    return doc.data() as Product;
  } catch (err) {
    console.warn("[db] Firestore getProductById failed \u2014 falling back to seed data", err);
    return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
  }
}

// ── Categories & Concerns ─────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  if (!isFirebaseReady()) return SEED_CATEGORIES;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb.collection("categories").get();
    if (snap.empty) return SEED_CATEGORIES;
    return snap.docs.map((d) => d.data() as Category);
  } catch (err) {
    console.warn("[db] Firestore getCategories failed — falling back to seed data", err);
    return SEED_CATEGORIES;
  }
}

export async function getConcerns(): Promise<Concern[]> {
  if (!isFirebaseReady()) return SEED_CONCERNS;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb.collection("concerns").get();
    if (snap.empty) return SEED_CONCERNS;
    return snap.docs.map((d) => d.data() as Concern);
  } catch (err) {
    console.warn("[db] Firestore getConcerns failed — falling back to seed data", err);
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
      const aDate = toSafeDate(a.publishedAt) ?? new Date(0);
      const bDate = toSafeDate(b.publishedAt) ?? new Date(0);
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
    if (snap.empty) {
      let blogs = SEED_BLOGS.filter((b) => b.status === "published");
      if (category) blogs = blogs.filter((b) => b.category === category);
      if (limit) blogs = blogs.slice(0, limit);
      return blogs;
    }
    return snap.docs.map((d) => d.data() as Blog);
  } catch (err) {
    console.warn("[db] Firestore getBlogs failed — falling back to seed data", err);
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
    if (snap.empty)
      return SEED_BLOGS.find((b) => b.slug === slug && b.status === "published") ?? null;
    return snap.docs[0].data() as Blog;
  } catch (err) {
    console.warn("[db] Firestore getBlog failed — falling back to seed data", err);
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
    if (!doc.exists) return SEED_COUPONS.find((c) => c.code === code.toUpperCase()) ?? null;
    return doc.data() as Coupon;
  } catch (err) {
    console.warn("[db] Firestore getCoupon failed — falling back to seed data", err);
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
    if (snap.empty) {
      let results = SEED_REVIEWS.filter((r) => r.status === "approved");
      if (limit) results = results.slice(0, limit);
      return results;
    }
    return snap.docs.map((d) => d.data() as Review);
  } catch (err) {
    console.warn("[db] Firestore getApprovedReviews failed — falling back to seed data", err);
    let results = SEED_REVIEWS.filter((r) => r.status === "approved");
    if (limit) results = results.slice(0, limit);
    return results;
  }
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  if (!isFirebaseReady()) {
    return SEED_REVIEWS.filter((r) => r.productId === productId && r.status === "approved").sort(
      (a, b) =>
        (toSafeDate(b.createdAt) ?? new Date(0)).getTime() -
        (toSafeDate(a.createdAt) ?? new Date(0)).getTime(),
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
    if (snap.empty) {
      return SEED_REVIEWS.filter((r) => r.productId === productId && r.status === "approved");
    }
    return snap.docs.map((d) => d.data() as Review);
  } catch (err) {
    console.warn("[db] Firestore getProductReviews failed — falling back to seed data", err);
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
    console.warn("[db] Firestore getSiteConfig failed — falling back to seed data", err);
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
    console.warn("[db] Firestore getPaymentSettings failed — falling back to seed data", err);
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
    console.warn("[db] Firestore getShippingRules failed — falling back to seed data", err);
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
    console.warn("[db] Firestore getInventorySettings failed — falling back to seed data", err);
    return SEED_INVENTORY_SETTINGS;
  }
}

// ── Settings write functions ──────────────────────────────────────────────────

export async function updateSiteConfig(
  data: Partial<Omit<SiteConfig, "createdAt" | "updatedAt" | "orderCounter">>,
): Promise<void> {
  if (!isFirebaseReady()) return; // seed mode — no persistence between requests
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
    if (!doc.exists) return SEED_INVENTORY.find((inv) => inv.productId === productId) ?? null;
    return doc.data() as InventoryDoc;
  } catch (err) {
    console.warn("[db] Firestore getInventory failed — falling back to seed data", err);
    return SEED_INVENTORY.find((inv) => inv.productId === productId) ?? null;
  }
}

export async function getStockMovements(
  productId: string,
  variantId?: string,
  limit = 50,
): Promise<StockMovement[]> {
  if (!isFirebaseReady()) {
    // No seed movements — return empty array in seed mode
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
  if (!isFirebaseReady()) return; // no persistence in seed mode
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

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrder(orderId: string): Promise<Order | null> {
  if (!isFirebaseReady()) return null;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("orders").doc(orderId).get();
    if (!doc.exists) return null;
    return doc.data() as Order;
  } catch (err) {
    console.warn("[db] Firestore getOrder failed", err);
    return null;
  }
}

export async function getOrders(filters?: {
  userId?: string;
  orderStatus?: string;
  paymentStatus?: string;
  limit?: number;
}): Promise<Order[]> {
  if (!isFirebaseReady()) return [];
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    let query: FirebaseFirestore.Query = adminDb.collection("orders").orderBy("createdAt", "desc");
    if (filters?.userId) query = query.where("userId", "==", filters.userId);
    if (filters?.orderStatus) query = query.where("orderStatus", "==", filters.orderStatus);
    if (filters?.paymentStatus) query = query.where("paymentStatus", "==", filters.paymentStatus);
    if (filters?.limit) query = query.limit(filters.limit);
    const snap = await query.get();
    return snap.docs.map((d) => d.data() as Order);
  } catch (err) {
    console.warn("[db] Firestore getOrders failed", err);
    return [];
  }
}

export async function getOrderTimeline(orderId: string): Promise<OrderEvent[]> {
  if (!isFirebaseReady()) return [];
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("orders")
      .doc(orderId)
      .collection("timeline")
      .orderBy("createdAt", "asc")
      .get();
    return snap.docs.map((d) => d.data() as OrderEvent);
  } catch (err) {
    console.warn("[db] Firestore getOrderTimeline failed", err);
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  updates: Partial<
    Pick<
      Order,
      | "orderStatus"
      | "paymentStatus"
      | "adminNote"
      | "whatsappConfirmedBy"
      | "whatsappConfirmedAt"
      | "awbCode"
      | "courierName"
      | "shiprocketOrderId"
      | "shiprocketShipmentId"
      | "estimatedDeliveryDate"
      | "deliveredAt"
      | "refundAmount"
      | "refundId"
      | "refundNote"
      | "returnReason"
      | "returnImages"
      | "courierTrackingUrl"
      | "manualShipping"
      | "manualCourierName"
      | "manualAwbCode"
    >
  >,
  timelineEvent?: Omit<OrderEvent, "createdAt">,
): Promise<void> {
  if (!isFirebaseReady()) return;
  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");

  const orderRef = adminDb.collection("orders").doc(orderId);
  const batch = adminDb.batch();

  batch.update(orderRef, { ...updates, updatedAt: FieldValue.serverTimestamp() });

  if (timelineEvent) {
    const eventRef = orderRef.collection("timeline").doc();
    batch.set(eventRef, { ...timelineEvent, createdAt: FieldValue.serverTimestamp() });
  }

  await batch.commit();
}

export async function getUserAddresses(userId: string): Promise<Address[]> {
  if (!isFirebaseReady()) return [];
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb.collection("users").doc(userId).collection("addresses").get();
    return snap.docs.map((d) => d.data() as Address);
  } catch (err) {
    console.warn("[db] Firestore getUserAddresses failed", err);
    return [];
  }
}

export async function saveUserAddress(userId: string, address: Address): Promise<string> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");
  const ref = adminDb.collection("users").doc(userId).collection("addresses").doc();
  await ref.set({ ...address, createdAt: FieldValue.serverTimestamp() });
  return ref.id;
}

// ── Reviews (admin) ───────────────────────────────────────────────────────────

export async function getAllReviews(status?: Review["status"]): Promise<Review[]> {
  if (!isFirebaseReady()) {
    return status ? SEED_REVIEWS.filter((r) => r.status === status) : SEED_REVIEWS;
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    let query: FirebaseFirestore.Query = adminDb.collection("reviews").orderBy("createdAt", "desc");
    if (status) query = query.where("status", "==", status);
    const snap = await query.get();
    if (snap.empty) return status ? SEED_REVIEWS.filter((r) => r.status === status) : SEED_REVIEWS;
    return snap.docs.map((d) => d.data() as Review);
  } catch (err) {
    console.warn("[db] Firestore getAllReviews failed — falling back to seed data", err);
    return status ? SEED_REVIEWS.filter((r) => r.status === status) : SEED_REVIEWS;
  }
}

export async function getReviewById(reviewId: string): Promise<Review | null> {
  if (!isFirebaseReady()) {
    return SEED_REVIEWS.find((r) => r.id === reviewId) ?? null;
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("reviews").doc(reviewId).get();
    if (!doc.exists) return SEED_REVIEWS.find((r) => r.id === reviewId) ?? null;
    return doc.data() as Review;
  } catch (err) {
    console.warn("[db] Firestore getReviewById failed — falling back to seed data", err);
    return SEED_REVIEWS.find((r) => r.id === reviewId) ?? null;
  }
}

export async function getPendingReviewCount(): Promise<number> {
  if (!isFirebaseReady()) {
    return SEED_REVIEWS.filter((r) => r.status === "pending").length;
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb.collection("reviews").where("status", "==", "pending").count().get();
    return snap.data().count;
  } catch (err) {
    console.warn("[db] Firestore getPendingReviewCount failed", err);
    return 0;
  }
}

// ── Blogs (admin) ─────────────────────────────────────────────────────────────

export async function getAllBlogs(status?: Blog["status"]): Promise<Blog[]> {
  if (!isFirebaseReady()) {
    return status ? SEED_BLOGS.filter((b) => b.status === status) : SEED_BLOGS;
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    let query: FirebaseFirestore.Query = adminDb.collection("blogs").orderBy("createdAt", "desc");
    if (status) query = query.where("status", "==", status);
    const snap = await query.get();
    if (snap.empty) return status ? SEED_BLOGS.filter((b) => b.status === status) : SEED_BLOGS;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Blog, "id">) }));
  } catch (err) {
    console.warn("[db] Firestore getAllBlogs failed — falling back to seed data", err);
    return status ? SEED_BLOGS.filter((b) => b.status === status) : SEED_BLOGS;
  }
}

export async function getBlogById(id: string): Promise<Blog | null> {
  if (!isFirebaseReady()) {
    return SEED_BLOGS.find((b) => b.id === id) ?? null;
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("blogs").doc(id).get();
    if (!doc.exists) return SEED_BLOGS.find((b) => b.id === id) ?? null;
    return { id: doc.id, ...(doc.data() as Omit<Blog, "id">) };
  } catch (err) {
    console.warn("[db] Firestore getBlogById failed — falling back to seed data", err);
    return SEED_BLOGS.find((b) => b.id === id) ?? null;
  }
}

export async function saveBlog(
  blog: Omit<Blog, "id" | "createdAt" | "updatedAt"> & { id?: string },
): Promise<string> {
  if (!isFirebaseReady()) return blog.id ?? "seed-blog-id";
  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");

  const ref = blog.id
    ? adminDb.collection("blogs").doc(blog.id)
    : adminDb.collection("blogs").doc();

  const { id: _, ...data } = blog as Record<string, unknown>;
  await ref.set(
    {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
      ...(blog.id ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true },
  );
  return ref.id;
}

export async function deleteBlog(id: string): Promise<void> {
  if (!isFirebaseReady()) return;
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("blogs").doc(id).delete();
}

// ── Newsletter (admin) ────────────────────────────────────────────────────────

export async function getNewsletterSubscribers(): Promise<{ email: string; subscribedAt: Date }[]> {
  if (!isFirebaseReady()) return [];
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("newsletter")
      .orderBy("subscribedAt", "desc")
      .limit(500)
      .get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        email: data.email ?? "",
        subscribedAt: data.subscribedAt?.toDate?.() ?? new Date(),
      };
    });
  } catch (err) {
    console.warn("[db] Firestore getNewsletterSubscribers failed", err);
    return [];
  }
}

// ── Before/After Gallery ──────────────────────────────────────────────────────

export interface BeforeAfterItem {
  id: string;
  beforeImage: string;
  afterImage: string;
  productId?: string;
  caption: string;
  sortOrder: number;
}

export async function getBeforeAfterItems(): Promise<BeforeAfterItem[]> {
  if (!isFirebaseReady()) {
    return [
      {
        id: "ba_1",
        beforeImage: "/images/before-after/before-1.jpg",
        afterImage: "/images/before-after/after-1.jpg",
        productId: "prod_kumkumadi_oil",
        caption: "4 weeks of Kumkumadi Oil — visible brightening",
        sortOrder: 1,
      },
      {
        id: "ba_2",
        beforeImage: "/images/before-after/before-2.jpg",
        afterImage: "/images/before-after/after-2.jpg",
        productId: "prod_vitamin_c_serum",
        caption: "6 weeks of Vitamin C Serum — reduced dark spots",
        sortOrder: 2,
      },
    ];
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("beforeAfterGallery")
      .orderBy("sortOrder", "asc")
      .limit(10)
      .get();
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<BeforeAfterItem, "id">),
    }));
  } catch (err) {
    console.warn("[db] Firestore getBeforeAfterItems failed", err);
    return [];
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────

export async function getNavigation(): Promise<NavigationConfig> {
  if (!isFirebaseReady()) return SEED_NAVIGATION;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("navigation").doc("navigation").get();
    if (!doc.exists) return SEED_NAVIGATION;
    return doc.data() as NavigationConfig;
  } catch (err) {
    console.warn("[db] Firestore getNavigation failed", err);
    return SEED_NAVIGATION;
  }
}

export async function updateNavigation(data: Partial<NavigationConfig>): Promise<void> {
  if (!isFirebaseReady()) return;
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("navigation").doc("navigation").set(data, { merge: true });
}

// ── Homepage Sections ─────────────────────────────────────────────────────────

export async function getHomepageSections(): Promise<HomepageSections> {
  if (!isFirebaseReady()) return SEED_HOMEPAGE_SECTIONS;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("settings").doc("homepageSections").get();
    if (!doc.exists) return SEED_HOMEPAGE_SECTIONS;
    return doc.data() as HomepageSections;
  } catch (err) {
    console.warn("[db] Firestore getHomepageSections failed", err);
    return SEED_HOMEPAGE_SECTIONS;
  }
}

export async function updateHomepageSections(data: Partial<HomepageSections>): Promise<void> {
  if (!isFirebaseReady()) return;
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("settings").doc("homepageSections").set(data, { merge: true });
}

// ── Testimonials ──────────────────────────────────────────────────────────────

export async function getTestimonials(limit?: number): Promise<Testimonial[]> {
  if (!isFirebaseReady()) {
    const active = SEED_TESTIMONIALS.filter((t) => t.isActive);
    return limit ? active.slice(0, limit) : active;
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    let query: FirebaseFirestore.Query = adminDb
      .collection("testimonials")
      .where("isActive", "==", true)
      .orderBy("sortOrder", "asc");
    if (limit) query = query.limit(limit);
    const snap = await query.get();
    if (snap.empty) {
      const active = SEED_TESTIMONIALS.filter((t) => t.isActive);
      return limit ? active.slice(0, limit) : active;
    }
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Testimonial, "id">) }));
  } catch (err) {
    console.warn("[db] Firestore getTestimonials failed", err);
    const active = SEED_TESTIMONIALS.filter((t) => t.isActive);
    return limit ? active.slice(0, limit) : active;
  }
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  if (!isFirebaseReady()) return [...SEED_TESTIMONIALS];
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb.collection("testimonials").orderBy("sortOrder", "asc").get();
    if (snap.empty) return [...SEED_TESTIMONIALS];
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Testimonial, "id">) }));
  } catch (err) {
    console.warn("[db] Firestore getAllTestimonials failed", err);
    return [...SEED_TESTIMONIALS];
  }
}

export async function saveTestimonial(
  testimonial: Omit<Testimonial, "id" | "createdAt"> & { id?: string },
): Promise<string> {
  if (!isFirebaseReady()) return testimonial.id ?? "mock-testimonial-id";
  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");
  const ref = testimonial.id
    ? adminDb.collection("testimonials").doc(testimonial.id)
    : adminDb.collection("testimonials").doc();
  const { id: _, ...data } = testimonial as Record<string, unknown>;
  await ref.set(
    {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
      ...(testimonial.id ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true },
  );
  return ref.id;
}

export async function deleteTestimonial(id: string): Promise<void> {
  if (!isFirebaseReady()) return;
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("testimonials").doc(id).delete();
}

// ── Static Pages ──────────────────────────────────────────────────────────────

export async function getPage(pageId: string): Promise<PageDoc | null> {
  if (!isFirebaseReady()) return SEED_PAGES.find((p) => p.id === pageId) ?? null;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("pages").doc(pageId).get();
    if (!doc.exists) return SEED_PAGES.find((p) => p.id === pageId) ?? null;
    return { id: doc.id, ...(doc.data() as Omit<PageDoc, "id">) };
  } catch (err) {
    console.warn("[db] Firestore getPage failed", err);
    return SEED_PAGES.find((p) => p.id === pageId) ?? null;
  }
}

export async function getAllPages(): Promise<PageDoc[]> {
  if (!isFirebaseReady()) return [...SEED_PAGES];
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb.collection("pages").get();
    if (snap.empty) return [...SEED_PAGES];
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PageDoc, "id">) }));
  } catch (err) {
    console.warn("[db] Firestore getAllPages failed", err);
    return [...SEED_PAGES];
  }
}

export async function savePage(page: PageDoc): Promise<void> {
  if (!isFirebaseReady()) return;
  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");
  const { id, ...data } = page;
  await adminDb
    .collection("pages")
    .doc(id)
    .set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

// ── Consultation Config ───────────────────────────────────────────────────────

export async function getConsultationConfig(): Promise<ConsultationConfig> {
  if (!isFirebaseReady()) return SEED_CONSULTATION_CONFIG;
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("settings").doc("consultationConfig").get();
    if (!doc.exists) return SEED_CONSULTATION_CONFIG;
    return doc.data() as ConsultationConfig;
  } catch (err) {
    console.warn("[db] Firestore getConsultationConfig failed", err);
    return SEED_CONSULTATION_CONFIG;
  }
}

export async function updateConsultationConfig(data: Partial<ConsultationConfig>): Promise<void> {
  if (!isFirebaseReady()) return;
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("settings").doc("consultationConfig").set(data, { merge: true });
}

// ── Promo Banners ─────────────────────────────────────────────────────────────

export async function getActivePromoBanners(): Promise<PromoBanner[]> {
  if (!isFirebaseReady()) return [];
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("promoBanners")
      .where("isActive", "==", true)
      .orderBy("sortOrder", "asc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PromoBanner, "id">) }));
  } catch (err) {
    console.warn("[db] Firestore getActivePromoBanners failed", err);
    return [];
  }
}

export async function getAllPromoBanners(): Promise<PromoBanner[]> {
  if (!isFirebaseReady()) return [];
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb.collection("promoBanners").orderBy("sortOrder", "asc").get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PromoBanner, "id">) }));
  } catch (err) {
    console.warn("[db] Firestore getAllPromoBanners failed", err);
    return [];
  }
}

export async function savePromoBanner(
  banner: Omit<PromoBanner, "id" | "createdAt"> & { id?: string },
): Promise<string> {
  if (!isFirebaseReady()) return banner.id ?? "mock-promo-id";
  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");
  const ref = banner.id
    ? adminDb.collection("promoBanners").doc(banner.id)
    : adminDb.collection("promoBanners").doc();
  const { id: _, ...data } = banner as Record<string, unknown>;
  await ref.set(
    {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
      ...(banner.id ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true },
  );
  return ref.id;
}

export async function deletePromoBanner(id: string): Promise<void> {
  if (!isFirebaseReady()) return;
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("promoBanners").doc(id).delete();
}

// ── Category / Concern CRUD ───────────────────────────────────────────────────

export async function saveCategory(
  category: Omit<Category, "id"> & { id?: string },
): Promise<string> {
  if (!isFirebaseReady()) return category.id ?? "mock-cat-id";
  const { adminDb } = await import("@/lib/firebase/admin");
  const ref = category.id
    ? adminDb.collection("categories").doc(category.id)
    : adminDb.collection("categories").doc();
  const { id: _, ...data } = category as Record<string, unknown>;
  await ref.set(data, { merge: true });
  return ref.id;
}

export async function deleteCategory(id: string): Promise<void> {
  if (!isFirebaseReady()) return;
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("categories").doc(id).delete();
}

export async function saveConcern(concern: Omit<Concern, "id"> & { id?: string }): Promise<string> {
  if (!isFirebaseReady()) return concern.id ?? "mock-concern-id";
  const { adminDb } = await import("@/lib/firebase/admin");
  const ref = concern.id
    ? adminDb.collection("concerns").doc(concern.id)
    : adminDb.collection("concerns").doc();
  const { id: _, ...data } = concern as Record<string, unknown>;
  await ref.set(data, { merge: true });
  return ref.id;
}

export async function deleteConcern(id: string): Promise<void> {
  if (!isFirebaseReady()) return;
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("concerns").doc(id).delete();
}
