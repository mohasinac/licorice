"use server";

import { z } from "zod";
import { isFirebaseReady } from "@/lib/utils";
import { SEED_REVIEWS } from "@/lib/seeds";
import type { Timestamp } from "firebase-admin/firestore";
import type { Review, ReviewFlagReason } from "@/lib/types";

// ── Eligibility check ─────────────────────────────────────────────────────────

export async function checkReviewEligibility(
  userId: string,
  productId: string,
): Promise<{ eligible: boolean; orderId?: string; alreadyReviewed: boolean }> {
  if (!isFirebaseReady()) {
    // In seed mode always allow review submission (dev / demo)
    return { eligible: true, alreadyReviewed: false };
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    // Check for an existing review by this user for this product
    const existingSnap = await adminDb
      .collection("reviews")
      .where("userId", "==", userId)
      .where("productId", "==", productId)
      .limit(1)
      .get();
    if (!existingSnap.empty) {
      return { eligible: false, alreadyReviewed: true };
    }
    // Check for a delivered order containing this product
    const ordersSnap = await adminDb
      .collection("orders")
      .where("userId", "==", userId)
      .where("orderStatus", "==", "delivered")
      .get();
    for (const doc of ordersSnap.docs) {
      const order = doc.data();
      const hasProduct = (order.items ?? []).some(
        (item: { productId: string }) => item.productId === productId,
      );
      if (hasProduct) {
        return { eligible: true, orderId: doc.id, alreadyReviewed: false };
      }
    }
    return { eligible: false, alreadyReviewed: false };
  } catch (err) {
    console.warn("[reviews] checkReviewEligibility failed", err);
    return { eligible: false, alreadyReviewed: false };
  }
}

// ── Submit review ─────────────────────────────────────────────────────────────

const submitReviewSchema = z.object({
  userId: z.string().min(1),
  authorName: z.string().min(1).max(100),
  productId: z.string().min(1),
  orderId: z.string().optional(),
  isVerifiedPurchase: z.boolean(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(20).max(2000),
  images: z.array(z.string().url()).max(5).default([]),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
export type SubmitReviewResult =
  | { success: true; reviewId: string }
  | { success: false; error: string };

export async function submitReview(input: unknown): Promise<SubmitReviewResult> {
  const parsed = submitReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid review data." };
  }
  const data = parsed.data;

  if (!isFirebaseReady()) {
    // Mock mode — return a fake success
    return { success: true, reviewId: `rev_mock_${Date.now()}` };
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    // Re-check eligibility (prevents double-submission)
    const { eligible, alreadyReviewed } = await checkReviewEligibility(data.userId, data.productId);
    if (alreadyReviewed) {
      return { success: false, error: "You have already reviewed this product." };
    }
    if (!eligible) {
      return {
        success: false,
        error: "Only customers with a delivered order can review this product.",
      };
    }

    const reviewRef = adminDb.collection("reviews").doc();
    await reviewRef.set({
      id: reviewRef.id,
      productId: data.productId,
      userId: data.userId,
      authorName: data.authorName,
      orderId: data.orderId ?? undefined,
      isVerifiedPurchase: data.isVerifiedPurchase,
      rating: data.rating,
      title: data.title ?? undefined,
      body: data.body,
      images: data.images,
      status: "pending",
      helpfulCount: 0,
      reportCount: 0,
      createdAt: FieldValue.serverTimestamp() as unknown as Timestamp,
      updatedAt: FieldValue.serverTimestamp() as unknown as Timestamp,
    } satisfies Omit<Review, "id"> & { id: string });

    return { success: true, reviewId: reviewRef.id };
  } catch (err) {
    console.error("[reviews] submitReview failed", err);
    return { success: false, error: "Failed to submit review. Please try again." };
  }
}

// ── Moderate review (admin) ───────────────────────────────────────────────────

export type ModerateReviewResult = { success: true } | { success: false; error: string };

export async function approveReview(
  reviewId: string,
  adminUserId: string,
): Promise<ModerateReviewResult> {
  if (!isFirebaseReady()) {
    return { success: true }; // mock mode
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    const reviewRef = adminDb.collection("reviews").doc(reviewId);
    const reviewSnap = await reviewRef.get();
    if (!reviewSnap.exists) return { success: false, error: "Review not found." };
    const review = reviewSnap.data() as Review;

    await adminDb.runTransaction(async (tx) => {
      // Approve the review
      tx.update(reviewRef, {
        status: "approved",
        moderatedBy: adminUserId,
        moderatedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Recompute product rating from all approved reviews
      const reviewsSnap = await adminDb
        .collection("reviews")
        .where("productId", "==", review.productId)
        .where("status", "==", "approved")
        .get();

      // Include the current review being approved
      const allRatings = reviewsSnap.docs.map((d) => (d.data() as Review).rating);
      allRatings.push(review.rating);
      const avg = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;

      tx.update(adminDb.collection("products").doc(review.productId), {
        rating: Math.round(avg * 10) / 10,
        reviewCount: allRatings.length,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return { success: true };
  } catch (err) {
    console.error("[reviews] approveReview failed", err);
    return { success: false, error: "Failed to approve review." };
  }
}

export async function rejectReview(
  reviewId: string,
  adminUserId: string,
  rejectionReason: string,
): Promise<ModerateReviewResult> {
  if (!rejectionReason.trim()) {
    return { success: false, error: "Rejection reason is required." };
  }
  if (!isFirebaseReady()) return { success: true };
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    await adminDb.collection("reviews").doc(reviewId).update({
      status: "rejected",
      rejectionReason: rejectionReason.trim(),
      moderatedBy: adminUserId,
      moderatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error("[reviews] rejectReview failed", err);
    return { success: false, error: "Failed to reject review." };
  }
}

export async function addAdminReply(
  reviewId: string,
  adminUserId: string,
  reply: string,
): Promise<ModerateReviewResult> {
  if (!reply.trim()) return { success: false, error: "Reply cannot be empty." };
  if (!isFirebaseReady()) return { success: true };
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    await adminDb.collection("reviews").doc(reviewId).update({
      adminReply: reply.trim(),
      adminRepliedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error("[reviews] addAdminReply failed", err);
    return { success: false, error: "Failed to save reply." };
  }
}

// ── Flag review (customer) ────────────────────────────────────────────────────

const flagSchema = z.object({
  reviewId: z.string().min(1),
  reportedBy: z.string().min(1),
  reason: z.enum(["spam", "offensive", "fake", "irrelevant", "other"]),
  note: z.string().max(500).optional(),
});

export type FlagReviewResult = { success: true } | { success: false; error: string };

export async function flagReview(input: unknown): Promise<FlagReviewResult> {
  const parsed = flagSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid flag data." };
  const data = parsed.data;
  if (!isFirebaseReady()) return { success: true };
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    // Prevent duplicate flags from same user on same review
    const existing = await adminDb
      .collection("reviewFlags")
      .where("reviewId", "==", data.reviewId)
      .where("reportedBy", "==", data.reportedBy)
      .limit(1)
      .get();
    if (!existing.empty) {
      return { success: false, error: "You have already reported this review." };
    }

    const flagRef = adminDb.collection("reviewFlags").doc();
    await flagRef.set({
      id: flagRef.id,
      reviewId: data.reviewId,
      reportedBy: data.reportedBy,
      reason: data.reason as ReviewFlagReason,
      note: data.note ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Increment reportCount on review
    await adminDb
      .collection("reviews")
      .doc(data.reviewId)
      .update({ reportCount: FieldValue.increment(1) });

    return { success: true };
  } catch (err) {
    console.error("[reviews] flagReview failed", err);
    return { success: false, error: "Failed to report review." };
  }
}

// ── Mark helpful ──────────────────────────────────────────────────────────────

export async function markReviewHelpful(
  reviewId: string,
): Promise<{ success: boolean; helpfulCount?: number }> {
  if (!isFirebaseReady()) {
    const r = SEED_REVIEWS.find((r) => r.id === reviewId);
    return { success: true, helpfulCount: (r?.helpfulCount ?? 0) + 1 };
  }
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    const ref = adminDb.collection("reviews").doc(reviewId);
    await ref.update({ helpfulCount: FieldValue.increment(1) });
    const updated = await ref.get();
    return { success: true, helpfulCount: (updated.data() as Review).helpfulCount };
  } catch {
    return { success: false };
  }
}
