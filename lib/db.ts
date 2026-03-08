// lib/db.ts
// Unified data-access layer.
// All Server Components and Server Actions import from here — never from Firestore directly.
// All data is read from / written to Firebase Firestore. No seed fallbacks.

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

// ── Product filters ───────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: string;
  concern?: string;
  isFeatured?: boolean;
  isCombo?: boolean;
  isActive?: boolean;
  limit?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Recursively convert all Firestore Timestamp-like values in an object to ISO
 * strings so the result is safe to pass from Server Components to Client
 * Components (RSC serialisation boundary).
 */
function stripTimestamps<T>(obj: T): T {
  if (obj == null || typeof obj !== "object") return obj;
  // Firestore admin Timestamp instance (has .toDate())
  if (typeof (obj as Record<string, unknown>).toDate === "function") {
    return (obj as unknown as { toDate: () => Date }).toDate().toISOString() as unknown as T;
  }
  // Serialised Timestamp — { _seconds, _nanoseconds } or { seconds, nanoseconds }
  const secs =
    (obj as Record<string, unknown>)._seconds ?? (obj as Record<string, unknown>).seconds;
  const nanos =
    (obj as Record<string, unknown>)._nanoseconds ?? (obj as Record<string, unknown>).nanoseconds;
  if (typeof secs === "number" && typeof nanos === "number") {
    return new Date(secs * 1000 + nanos / 1e6).toISOString() as unknown as T;
  }
  if (Array.isArray(obj)) return obj.map(stripTimestamps) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = stripTimestamps(v);
  }
  return out as T;
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  let query: FirebaseFirestore.Query = adminDb.collection("products").where("isActive", "==", true);
  if (filters?.category) query = query.where("category", "==", filters.category);
  if (filters?.isFeatured !== undefined)
    query = query.where("isFeatured", "==", filters.isFeatured);
  if (filters?.isCombo !== undefined) query = query.where("isCombo", "==", filters.isCombo);
  // When combining concern (client-side filter) with limit, fetch more to compensate
  if (filters?.limit && filters?.concern) {
    query = query.limit(filters.limit * 3);
  } else if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  const snap = await query.get();
  if (snap.empty) return [];
  let results = snap.docs.map((d) => stripTimestamps(d.data() as Product));
  if (filters?.concern) results = results.filter((p) => p.concerns.includes(filters.concern!));
  if (filters?.limit) results = results.slice(0, filters.limit);
  return results.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb
    .collection("products")
    .where("slug", "==", slug)
    .where("isActive", "==", true)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return stripTimestamps(snap.docs[0].data() as Product);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("products").doc(id).get();
  if (!doc.exists) return null;
  return stripTimestamps(doc.data() as Product);
}

// ── Categories & Concerns ─────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb.collection("categories").get();
  return snap.docs.map((d) => d.data() as Category);
}

export async function getConcerns(): Promise<Concern[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb.collection("concerns").get();
  return snap.docs.map((d) => d.data() as Concern);
}

// ── Blogs ─────────────────────────────────────────────────────────────────────

export async function getBlogs(category?: BlogCategory, limit?: number): Promise<Blog[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  let query: FirebaseFirestore.Query = adminDb
    .collection("blogs")
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc");
  if (category) query = query.where("category", "==", category);
  if (limit) query = query.limit(limit);
  const snap = await query.get();
  return snap.docs.map((d) => stripTimestamps(d.data() as Blog));
}

export async function getBlog(slug: string): Promise<Blog | null> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb
    .collection("blogs")
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();
  if (snap.empty) return null;
  return stripTimestamps(snap.docs[0].data() as Blog);
}

// ── Coupons ───────────────────────────────────────────────────────────────────

export async function getCoupons(): Promise<Coupon[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb.collection("coupons").orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => stripTimestamps({ ...d.data(), code: d.id } as Coupon));
}

export async function createCoupon(
  data: Omit<Coupon, "code" | "createdAt" | "updatedAt" | "usedCount"> & { code: string },
): Promise<void> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const { Timestamp } = await import("firebase-admin/firestore");
  const now = Timestamp.now();
  const { code, ...rest } = data;
  await adminDb
    .collection("coupons")
    .doc(code.toUpperCase())
    .set({
      ...rest,
      usedCount: 0,
      createdAt: now,
      updatedAt: now,
    });
}

export async function getCoupon(code: string): Promise<Coupon | null> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("coupons").doc(code.toUpperCase()).get();
  if (!doc.exists) return null;
  return stripTimestamps({ ...doc.data(), code: doc.id } as Coupon);
}

// ── Reviews ───────────────────────────────────────────────────────────────────



export async function getApprovedReviews(limit?: number): Promise<Review[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  let query: FirebaseFirestore.Query = adminDb
    .collection("reviews")
    .where("status", "==", "approved")
    .orderBy("createdAt", "desc");
  if (limit) query = query.limit(limit);
  const snap = await query.get();
  return snap.docs.map((d) => stripTimestamps(d.data() as Review));
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb
    .collection("reviews")
    .where("productId", "==", productId)
    .where("status", "==", "approved")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => stripTimestamps(d.data() as Review));
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfig> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("settings").doc("siteConfig").get();
  return stripTimestamps(
    (doc.data() as SiteConfig | undefined) ?? {
      announcementText: "",
      maintenanceMode: false,
      orderCounter: 0,
      logoUrl: "",
    },
  );
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("settings").doc("paymentSettings").get();
  return stripTimestamps(
    (doc.data() as PaymentSettings | undefined) ?? {
      whatsappEnabled: false,
      whatsappUpiId: "",
      whatsappBusinessNumber: "",
      razorpayEnabled: false,
      codEnabled: false,
      codFee: 0,
    },
  );
}

export async function getShippingRules(): Promise<ShippingRules> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("settings").doc("shippingRules").get();
  return stripTimestamps(
    (doc.data() as ShippingRules | undefined) ?? {
      freeShippingThreshold: 0,
      standardRate: 0,
      codFee: 0,
      codEnabled: false,
      expressEnabled: false,
      sameDayEnabled: false,
      gstPercent: 0,
      gstIncluded: false,
      useShiprocketRates: false,
    },
  );
}

export async function getInventorySettings(): Promise<InventorySettings> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("settings").doc("inventorySettings").get();
  return stripTimestamps(
    (doc.data() as InventorySettings | undefined) ?? {
      defaultLowStockThreshold: 10,
      defaultReorderPoint: 5,
      defaultStockPerVariant: 0,
      reservationTimeoutMinutes: 30,
    },
  );
}

// ── Settings write functions ──────────────────────────────────────────────────

export async function updateSiteConfig(
  data: Partial<Omit<SiteConfig, "createdAt" | "updatedAt" | "orderCounter">>,
): Promise<void> {
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
  const { adminDb } = await import("@/lib/firebase/admin");
  const { FieldValue } = await import("firebase-admin/firestore");
  await adminDb
    .collection("settings")
    .doc("inventorySettings")
    .set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export async function getInventory(productId: string): Promise<InventoryDoc | null> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("inventory").doc(productId).get();
  if (!doc.exists) return null;
  return stripTimestamps(doc.data() as InventoryDoc);
}

export async function getStockMovements(
  productId: string,
  variantId?: string,
  limit = 50,
): Promise<StockMovement[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  let query: FirebaseFirestore.Query = adminDb
    .collection("inventory")
    .doc(productId)
    .collection("movements")
    .orderBy("createdAt", "desc")
    .limit(limit);
  if (variantId) query = query.where("variantId", "==", variantId);
  const snap = await query.get();
  return snap.docs.map((d) => stripTimestamps(d.data() as StockMovement));
}

export async function adjustStock(
  productId: string,
  variantId: string,
  delta: number,
  movement: Omit<StockMovement, "id" | "createdAt">,
): Promise<void> {
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
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("orders").doc(orderId).get();
  if (!doc.exists) return null;
  return stripTimestamps(doc.data() as Order);
}

export async function getOrders(filters?: {
  userId?: string;
  orderStatus?: string;
  paymentStatus?: string;
  limit?: number;
}): Promise<Order[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  let query: FirebaseFirestore.Query = adminDb.collection("orders").orderBy("createdAt", "desc");
  if (filters?.userId) query = query.where("userId", "==", filters.userId);
  if (filters?.orderStatus) query = query.where("orderStatus", "==", filters.orderStatus);
  if (filters?.paymentStatus) query = query.where("paymentStatus", "==", filters.paymentStatus);
  if (filters?.limit) query = query.limit(filters.limit);
  const snap = await query.get();
  return snap.docs.map((d) => stripTimestamps(d.data() as Order));
}

export async function getOrderTimeline(orderId: string): Promise<OrderEvent[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb
    .collection("orders")
    .doc(orderId)
    .collection("timeline")
    .orderBy("createdAt", "asc")
    .get();
  return snap.docs.map((d) => stripTimestamps(d.data() as OrderEvent));
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
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb.collection("users").doc(userId).collection("addresses").get();
  return snap.docs.map((d) => d.data() as Address);
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
  const { adminDb } = await import("@/lib/firebase/admin");
  let query: FirebaseFirestore.Query = adminDb.collection("reviews").orderBy("createdAt", "desc");
  if (status) query = query.where("status", "==", status);
  const snap = await query.get();
  return snap.docs.map((d) => stripTimestamps(d.data() as Review));
}

export async function getReviewById(reviewId: string): Promise<Review | null> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("reviews").doc(reviewId).get();
  if (!doc.exists) return null;
  return stripTimestamps(doc.data() as Review);
}

export async function getPendingReviewCount(): Promise<number> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb.collection("reviews").where("status", "==", "pending").count().get();
  return snap.data().count;
}

// ── Blogs (admin) ─────────────────────────────────────────────────────────────

export async function getAllBlogs(status?: Blog["status"]): Promise<Blog[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  let query: FirebaseFirestore.Query = adminDb.collection("blogs").orderBy("createdAt", "desc");
  if (status) query = query.where("status", "==", status);
  const snap = await query.get();
  return snap.docs.map((d) => stripTimestamps({ id: d.id, ...(d.data() as Omit<Blog, "id">) }));
}

export async function getBlogById(id: string): Promise<Blog | null> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("blogs").doc(id).get();
  if (!doc.exists) return null;
  return stripTimestamps({ id: doc.id, ...(doc.data() as Omit<Blog, "id">) });
}

export async function saveBlog(
  blog: Omit<Blog, "id" | "createdAt" | "updatedAt"> & { id?: string },
): Promise<string> {
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
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("blogs").doc(id).delete();
}

// ── Newsletter (admin) ────────────────────────────────────────────────────────

export async function getNewsletterSubscribers(): Promise<{ email: string; subscribedAt: Date }[]> {
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
}

// ── Navigation ────────────────────────────────────────────────────────────────

export async function getNavigation(): Promise<NavigationConfig> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("navigation").doc("navigation").get();
  return (
    (doc.data() as NavigationConfig | undefined) ?? {
      mainNav: [],
      footerNav: { shop: [], account: [], policies: [] },
    }
  );
}

export async function updateNavigation(data: Partial<NavigationConfig>): Promise<void> {
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("navigation").doc("navigation").set(data, { merge: true });
}

// ── Homepage Sections ─────────────────────────────────────────────────────────

export async function getHomepageSections(): Promise<HomepageSections> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("settings").doc("homepageSections").get();
  return (
    (doc.data() as HomepageSections | undefined) ?? {
      heroBanner: {
        headline: "",
        subheadline: "",
        primaryCtaText: "",
        primaryCtaHref: "/shop",
        secondaryCtaText: "",
        secondaryCtaHref: "",
      },
      featuredProductIds: [],
      newArrivalIds: [],
      brandValues: [],
      instagramReels: [],
      trustBadges: [],
      brandStory: { tag: "", headline: "", body: "" },
      sectionVisibility: {
        showBeforeAfter: false,
        showTestimonials: false,
        showBlog: false,
        showNewsletter: false,
        showBrandValues: false,
        showInstagramReels: false,
        showTrustBadges: false,
        showBrandStory: false,
        showConcernGrid: false,
      },
    }
  );
}

export async function updateHomepageSections(data: Partial<HomepageSections>): Promise<void> {
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("settings").doc("homepageSections").set(data, { merge: true });
}

// ── Testimonials ──────────────────────────────────────────────────────────────

export async function getTestimonials(limit?: number): Promise<Testimonial[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  let query: FirebaseFirestore.Query = adminDb
    .collection("testimonials")
    .where("isActive", "==", true)
    .orderBy("sortOrder", "asc");
  if (limit) query = query.limit(limit);
  const snap = await query.get();
  return snap.docs.map((d) =>
    stripTimestamps({ id: d.id, ...(d.data() as Omit<Testimonial, "id">) }),
  );
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb.collection("testimonials").orderBy("sortOrder", "asc").get();
  return snap.docs.map((d) =>
    stripTimestamps({ id: d.id, ...(d.data() as Omit<Testimonial, "id">) }),
  );
}

export async function saveTestimonial(
  testimonial: Omit<Testimonial, "id" | "createdAt"> & { id?: string },
): Promise<string> {
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
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("testimonials").doc(id).delete();
}

// ── Pages ─────────────────────────────────────────────────────────────────────

export async function getPage(pageId: string): Promise<PageDoc | null> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("pages").doc(pageId).get();
  if (!doc.exists) return null;
  return stripTimestamps({ id: doc.id, ...(doc.data() as Omit<PageDoc, "id">) });
}

export async function getAllPages(): Promise<PageDoc[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb.collection("pages").get();
  return snap.docs.map((d) => stripTimestamps({ id: d.id, ...(d.data() as Omit<PageDoc, "id">) }));
}

export async function savePage(page: PageDoc): Promise<void> {
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
  const { adminDb } = await import("@/lib/firebase/admin");
  const doc = await adminDb.collection("settings").doc("consultationConfig").get();
  return (
    (doc.data() as ConsultationConfig | undefined) ?? {
      consultantName: "",
      consultantTitle: "",
      consultantBio: "",
      consultationDurationMinutes: 30,
      availableTimeSlots: [],
      blockedDates: [],
      isEnabled: false,
      clinicName: "",
      clinicAddress: "",
    }
  );
}

export async function updateConsultationConfig(data: Partial<ConsultationConfig>): Promise<void> {
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("settings").doc("consultationConfig").set(data, { merge: true });
}

// ── Promo Banners ─────────────────────────────────────────────────────────────

export async function getActivePromoBanners(): Promise<PromoBanner[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb
    .collection("promoBanners")
    .where("isActive", "==", true)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs.map((d) =>
    stripTimestamps({ id: d.id, ...(d.data() as Omit<PromoBanner, "id">) }),
  );
}

export async function getAllPromoBanners(): Promise<PromoBanner[]> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb.collection("promoBanners").orderBy("sortOrder", "asc").get();
  return snap.docs.map((d) =>
    stripTimestamps({ id: d.id, ...(d.data() as Omit<PromoBanner, "id">) }),
  );
}

export async function savePromoBanner(
  banner: Omit<PromoBanner, "id" | "createdAt"> & { id?: string },
): Promise<string> {
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
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("promoBanners").doc(id).delete();
}

// ── Category / Concern CRUD ───────────────────────────────────────────────────

export async function saveCategory(
  category: Omit<Category, "id"> & { id?: string },
): Promise<string> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const ref = category.id
    ? adminDb.collection("categories").doc(category.id)
    : adminDb.collection("categories").doc();
  const { id: _, ...data } = category as Record<string, unknown>;
  await ref.set(data, { merge: true });
  return ref.id;
}

export async function deleteCategory(id: string): Promise<void> {
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("categories").doc(id).delete();
}

export async function saveConcern(concern: Omit<Concern, "id"> & { id?: string }): Promise<string> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const ref = concern.id
    ? adminDb.collection("concerns").doc(concern.id)
    : adminDb.collection("concerns").doc();
  const { id: _, ...data } = concern as Record<string, unknown>;
  await ref.set(data, { merge: true });
  return ref.id;
}

export async function deleteConcern(id: string): Promise<void> {
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("concerns").doc(id).delete();
}
