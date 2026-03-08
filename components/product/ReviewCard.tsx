"use client";

import * as React from "react";
import Image from "next/image";
import { ThumbsUp, Flag, MessageCircle, CheckCircle } from "lucide-react";
import type { Review } from "@/lib/types";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { markReviewHelpful } from "@/lib/actions/reviews";
import { toSafeDate } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
  onImageClick?: (images: string[], startIndex: number) => void;
  onReportClick?: (reviewId: string) => void;
}

function formatDate(d: unknown) {
  const date = toSafeDate(d);
  return date
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";
}

export function ReviewCard({ review, onImageClick, onReportClick }: ReviewCardProps) {
  const [helpfulCount, setHelpfulCount] = React.useState(review.helpfulCount);
  const [voted, setVoted] = React.useState(false);
  const [voting, setVoting] = React.useState(false);

  async function handleHelpful() {
    if (voted || voting) return;
    setVoting(true);
    const result = await markReviewHelpful(review.id);
    if (result.success) {
      setHelpfulCount(result.helpfulCount ?? helpfulCount + 1);
      setVoted(true);
    }
    setVoting(false);
  }

  const authorInitial = (review.authorName ?? "U")[0].toUpperCase();

  return (
    <div className="border-border border-b py-6 last:border-0">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
            {authorInitial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-foreground text-sm font-medium">
                {review.authorName ?? "Customer"}
              </span>
              {review.isVerifiedPurchase && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  Verified Purchase
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              {formatDate(review.createdAt as Date | { seconds: number })}
            </p>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>

      {/* Title */}
      {review.title && (
        <p className="text-foreground mb-1 text-sm font-semibold">{review.title}</p>
      )}

      {/* Body */}
      <p className="text-foreground/80 mb-3 text-sm leading-relaxed">{review.body}</p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {review.images.map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => onImageClick?.(review.images!, idx)}
              className="border-border relative h-16 w-16 overflow-hidden rounded-lg border"
              aria-label={`View image ${idx + 1}`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* Admin reply */}
      {review.adminReply && (
        <div className="bg-muted border-border my-3 rounded-xl border p-4">
          <div className="mb-1 flex items-center gap-2">
            <MessageCircle className="text-primary h-4 w-4" />
            <span className="text-primary text-xs font-semibold">Response from Licorice Herbals</span>
          </div>
          <p className="text-foreground/70 text-sm leading-relaxed">{review.adminReply}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={handleHelpful}
          disabled={voted || voting}
          className={[
            "flex items-center gap-1.5 text-xs transition-colors",
            voted
              ? "text-primary cursor-default font-medium"
              : "text-muted-foreground hover:text-foreground cursor-pointer",
          ].join(" ")}
          aria-label="Mark as helpful"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Helpful{helpfulCount > 0 ? ` (${helpfulCount})` : ""}
        </button>
        <button
          type="button"
          onClick={() => onReportClick?.(review.id)}
          className="text-muted-foreground hover:text-destructive flex items-center gap-1.5 text-xs transition-colors"
          aria-label="Report review"
        >
          <Flag className="h-3.5 w-3.5" />
          Report
        </button>
      </div>
    </div>
  );
}
