"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, MessageCircle, ExternalLink } from "lucide-react";
import type { Review } from "@/lib/types";
import { StarRating } from "@/components/ui/StarRating";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toSafeDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { approveReview, rejectReview, addAdminReply } from "@/lib/actions/reviews";
import { useAuthStore } from "@/stores/useAuthStore";

interface ReviewModerationCardProps {
  review: Review;
  productName?: string;
  showActions?: boolean;
}

function formatDate(d: unknown) {
  const date = toSafeDate(d);
  return date
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";
}

export function ReviewModerationCard({
  review,
  productName,
  showActions = true,
}: ReviewModerationCardProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [rejecting, setRejecting] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [showReply, setShowReply] = React.useState(false);
  const [replyText, setReplyText] = React.useState(review.adminReply ?? "");
  const [saving, setSaving] = React.useState(false);

  async function handleApprove() {
    if (!user) return;
    setSaving(true);
    const result = await approveReview(review.id, user.uid);
    setSaving(false);
    if (result.success) {
      toast.success("Review approved.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleReject() {
    if (!user || !rejectReason.trim()) return;
    setSaving(true);
    const result = await rejectReview(review.id, user.uid, rejectReason);
    setSaving(false);
    if (result.success) {
      toast.success("Review rejected.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleSaveReply() {
    if (!user || !replyText.trim()) return;
    setSaving(true);
    const result = await addAdminReply(review.id, user.uid, replyText);
    setSaving(false);
    if (result.success) {
      toast.success("Reply saved.");
      setShowReply(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="border-border rounded-2xl border bg-card p-5">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex-1">
          {productName && (
            <p className="text-primary mb-1 text-xs font-medium uppercase tracking-wide">
              {productName}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-foreground font-medium">
              {review.authorName ?? "Customer"}
            </span>
            {review.isVerifiedPurchase && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            {formatDate(review.createdAt as Date | { seconds: number })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating value={review.rating} size="sm" />
          <StatusBadge status={review.status} type="review" />
        </div>
      </div>

      {/* Title + body */}
      {review.title && (
        <p className="text-foreground mb-1 text-sm font-semibold">{review.title}</p>
      )}
      <p className="text-foreground/80 mb-3 text-sm leading-relaxed">{review.body}</p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {review.images.map((img, idx) => (
            <a key={img} href={img} target="_blank" rel="noopener noreferrer">
              <div className="border-border relative h-16 w-16 overflow-hidden rounded-lg border">
                <Image src={img} alt={`Image ${idx + 1}`} fill className="object-cover" sizes="64px" />
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Rejection reason (if rejected) */}
      {review.status === "rejected" && review.rejectionReason && (
        <div className="mb-3 rounded-lg bg-red-50 px-4 py-3">
          <p className="text-xs font-medium text-red-800">Rejection reason:</p>
          <p className="mt-0.5 text-sm text-red-700">{review.rejectionReason}</p>
        </div>
      )}

      {/* Admin reply preview */}
      {review.adminReply && !showReply && (
        <div className="bg-muted mb-3 rounded-xl p-4">
          <div className="mb-1 flex items-center gap-2">
            <MessageCircle className="text-primary h-4 w-4" />
            <span className="text-primary text-xs font-semibold">Your Reply</span>
          </div>
          <p className="text-foreground/70 text-sm">{review.adminReply}</p>
        </div>
      )}

      {/* Reply textarea */}
      {showReply && (
        <div className="mb-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            className="border-border w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="Write your public reply…"
          />
          <div className="mt-2 flex gap-2">
            <Button size="sm" loading={saving} onClick={handleSaveReply}>
              Save Reply
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowReply(false);
                setReplyText(review.adminReply ?? "");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reject input */}
      {rejecting && (
        <div className="mb-3">
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Rejection reason (required)"
            className="border-border mb-2 w-full rounded-xl border px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" loading={saving} onClick={handleReject}>
              Confirm Reject
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
          {review.status === "pending" && (
            <>
              <Button size="sm" onClick={handleApprove} loading={saving}>
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setRejecting(true)}
                disabled={saving}
              >
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Reject
              </Button>
            </>
          )}
          {review.status === "approved" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowReply((show) => !show)}
              disabled={saving}
            >
              <MessageCircle className="mr-1 h-3.5 w-3.5" />
              {review.adminReply ? "Edit Reply" : "Reply"}
            </Button>
          )}
          {review.orderId && (
            <a
              href={`../orders/${review.orderId}`}
              className="text-muted-foreground hover:text-primary flex items-center gap-1 text-xs"
            >
              <ExternalLink className="h-3 w-3" />
              View Order
            </a>
          )}
        </div>
      )}
    </div>
  );
}
