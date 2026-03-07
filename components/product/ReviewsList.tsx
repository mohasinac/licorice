"use client";

import * as React from "react";
import type { Review } from "@/lib/types";
import { StarRating } from "@/components/ui/StarRating";
import { ReviewCard } from "@/components/product/ReviewCard";
import { ReviewFilters, type ReviewFilterValue } from "@/components/product/ReviewFilters";
import { ReviewPhotoGallery } from "@/components/product/ReviewPhotoGallery";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { Modal } from "@/components/ui/Modal";
import { flagReview } from "@/lib/actions/reviews";
import { useAuthStore } from "@/stores/useAuthStore";

const PAGE_SIZE = 10;

type SortOption = "recent" | "helpful" | "highest" | "lowest";

interface ReviewsListProps {
  reviews: Review[];
  productId: string;
  avgRating: number;
  reviewCount: number;
}

function computeRatingCounts(reviews: Review[]): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    const k = Math.floor(r.rating);
    if (k >= 1 && k <= 5) counts[k]++;
  }
  return counts;
}

function applyFilter(reviews: Review[], filter: ReviewFilterValue): Review[] {
  if (filter === "all") return reviews;
  if (filter === "verified") return reviews.filter((r) => r.isVerifiedPurchase);
  if (filter === "photos") return reviews.filter((r) => r.images && r.images.length > 0);
  const star = Number(filter);
  if (!isNaN(star)) return reviews.filter((r) => Math.floor(r.rating) === star);
  return reviews;
}

function applySort(reviews: Review[], sort: SortOption): Review[] {
  const copy = [...reviews];
  switch (sort) {
    case "recent":
      return copy.sort((a, b) => {
        const aTime =
          a.createdAt instanceof Date
            ? a.createdAt.getTime()
            : (a.createdAt as { seconds: number }).seconds * 1000;
        const bTime =
          b.createdAt instanceof Date
            ? b.createdAt.getTime()
            : (b.createdAt as { seconds: number }).seconds * 1000;
        return bTime - aTime;
      });
    case "helpful":
      return copy.sort((a, b) => b.helpfulCount - a.helpfulCount);
    case "highest":
      return copy.sort((a, b) => b.rating - a.rating);
    case "lowest":
      return copy.sort((a, b) => a.rating - b.rating);
  }
}

export function ReviewsList({
  reviews,
  productId: _productId,
  avgRating,
  reviewCount,
}: ReviewsListProps) {
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = React.useState<ReviewFilterValue>("all");
  const [sort, setSort] = React.useState<SortOption>("recent");
  const [page, setPage] = React.useState(1);

  // Lightbox state
  const [lightboxImages, setLightboxImages] = React.useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  // Flag modal state
  const [flagTarget, setFlagTarget] = React.useState<string | null>(null);
  const [flagReason, setFlagReason] = React.useState("");
  const [flagNote, setFlagNote] = React.useState("");
  const [flagging, setFlagging] = React.useState(false);
  const [flagError, setFlagError] = React.useState("");

  const ratingCounts = computeRatingCounts(reviews);
  const filtered = applyFilter(reviews, filter);
  const sorted = applySort(filtered, sort);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = page * PAGE_SIZE < sorted.length;

  // Photos from filtered list
  const allPhotos = reviews.flatMap((r) => r.images ?? []);

  function openLightbox(images: string[], idx: number) {
    setLightboxImages(images);
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }

  function handleFilterChange(f: ReviewFilterValue) {
    setFilter(f);
    setPage(1);
  }

  async function handleFlag() {
    if (!user || !flagTarget || !flagReason) return;
    setFlagging(true);
    setFlagError("");
    const result = await flagReview({
      reviewId: flagTarget,
      reportedBy: user.uid,
      reason: flagReason,
      note: flagNote || undefined,
    });
    setFlagging(false);
    if (result.success) {
      setFlagTarget(null);
      setFlagReason("");
      setFlagNote("");
    } else {
      setFlagError(result.error);
    }
  }

  if (reviewCount === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  // Rating distribution bar
  const maxCount = Math.max(...Object.values(ratingCounts), 1);

  return (
    <div>
      {/* Summary row */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start">
        {/* Average */}
        <div className="flex flex-col items-center md:w-36">
          <span className="font-heading text-foreground text-5xl font-bold">
            {avgRating.toFixed(1)}
          </span>
          <StarRating value={avgRating} size="md" className="my-1" />
          <span className="text-muted-foreground text-sm">{reviewCount} reviews</span>
        </div>

        {/* Distribution bars */}
        <div className="flex flex-1 flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star] ?? 0;
            const pct = Math.round((count / Math.max(reviewCount, 1)) * 100);
            return (
              <button
                key={star}
                type="button"
                onClick={() => handleFilterChange(String(star) as ReviewFilterValue)}
                className="flex items-center gap-2 text-xs"
              >
                <span className="text-muted-foreground w-10 text-right">{star} star</span>
                <div className="bg-muted h-2.5 flex-1 overflow-hidden rounded-full">
                  <div
                    className="bg-yellow-400 h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-6">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer photo gallery */}
      {allPhotos.length > 0 && (
        <ReviewPhotoGallery
          reviews={reviews.filter((r) => (r.images?.length ?? 0) > 0)}
        />
      )}

      {/* Filters */}
      <ReviewFilters
        activeFilter={filter}
        onChange={handleFilterChange}
        ratingCounts={ratingCounts}
        totalCount={reviewCount}
      />

      {/* Sort */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="text-muted-foreground text-sm">
          {filtered.length} review{filtered.length !== 1 ? "s" : ""}
        </span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="border-border text-foreground rounded-lg border bg-white px-3 py-1.5 text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {/* Review cards */}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No reviews match this filter.
        </p>
      ) : (
        <>
          <div>
            {paged.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onImageClick={openLightbox}
                onReportClick={user ? setFlagTarget : undefined}
              />
            ))}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              className="border-border text-foreground hover:bg-muted mt-6 w-full rounded-xl border py-2.5 text-sm font-medium transition-colors"
            >
              Load more reviews
            </button>
          )}
        </>
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Flag modal */}
      <Modal
        open={flagTarget !== null}
        onOpenChange={(o) => !o && setFlagTarget(null)}
        title="Report Review"
        description="Help us keep reviews genuine and useful."
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-foreground mb-1 block text-sm font-medium">
              Reason <span className="text-destructive">*</span>
            </label>
            <select
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="border-border w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="offensive">Offensive content</option>
              <option value="fake">Fake review</option>
              <option value="irrelevant">Irrelevant</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-foreground mb-1 block text-sm font-medium">
              Additional note (optional)
            </label>
            <textarea
              value={flagNote}
              onChange={(e) => setFlagNote(e.target.value)}
              rows={3}
              className="border-border w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Tell us more…"
            />
          </div>
          {flagError && <p className="text-destructive text-sm">{flagError}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setFlagTarget(null)}
              className="text-muted-foreground text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFlag}
              disabled={!flagReason || flagging}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {flagging ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
