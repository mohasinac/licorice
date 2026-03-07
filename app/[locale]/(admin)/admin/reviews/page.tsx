import { Metadata } from "next";
import Link from "next/link";
import { getAllReviews, getProducts } from "@/lib/db";
import { ReviewModerationCard } from "@/components/admin/ReviewModerationCard";
import type { ReviewStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Reviews — Admin — Licorice Herbals" };

interface ReviewsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminReviewsPage({ searchParams }: ReviewsPageProps) {
  const { tab = "pending" } = await searchParams;
  const activeTab = (["pending", "approved", "rejected", "all"].includes(tab)
    ? tab
    : "pending") as ReviewStatus | "all";

  const [reviews, products] = await Promise.all([
    getAllReviews(activeTab === "all" ? undefined : (activeTab as ReviewStatus)),
    getProducts(),
  ]);

  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const allCount = reviews.length;

  const tabs: { value: string; label: string; count?: number }[] = [
    {
      value: "pending",
      label: "Pending",
      count: activeTab === "pending" ? allCount : undefined,
    },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "all", label: "All Reviews" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-foreground text-2xl font-bold">Reviews</h1>
          {activeTab === "pending" && pendingCount > 0 && (
            <p className="text-muted-foreground mt-1 text-sm">
              {pendingCount} review{pendingCount !== 1 ? "s" : ""} awaiting moderation
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-border mb-6 flex gap-1 border-b">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={`?tab=${t.value}`}
            className={[
              "-mb-px px-4 py-2 text-sm font-medium transition-colors",
              activeTab === t.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="bg-primary text-primary-foreground ml-1.5 rounded-full px-1.5 py-0.5 text-xs">
                {t.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Review cards */}
      {reviews.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-sm">No reviews in this category.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`reviews/${review.id}`}
              className="block transition-shadow hover:shadow-md"
            >
              <ReviewModerationCard
                review={review}
                productName={String(productMap[review.productId] ?? review.productId)}
                showActions={false}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
