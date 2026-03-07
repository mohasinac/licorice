import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getReviewById, getProductById } from "@/lib/db";
import { ReviewModerationCard } from "@/components/admin/ReviewModerationCard";
import { getLocalizedValue } from "@/lib/i18n";

interface ReviewDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: ReviewDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Review ${id.slice(0, 8)} — Admin — Licorice Herbals` };
}

export default async function AdminReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { id } = await params;
  const review = await getReviewById(id);
  if (!review) notFound();

  const product = await getProductById(review.productId);
  const productName = product ? getLocalizedValue(product.name, "en") : review.productId;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="../reviews"
        className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Reviews
      </Link>

      <h1 className="font-heading text-foreground mb-6 text-2xl font-bold">
        Review #{id.slice(0, 8)}
      </h1>

      <ReviewModerationCard review={review} productName={productName} showActions />

      {/* Product link */}
      {product && (
        <div className="bg-muted/50 border-border mt-6 rounded-xl border p-4">
          <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
            Product
          </p>
          <Link
            href={`../products/${product.id}`}
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            {productName}
          </Link>
        </div>
      )}

      {/* Meta */}
      <div className="bg-muted/50 border-border mt-4 rounded-xl border p-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <dt className="text-muted-foreground font-medium">Review ID</dt>
          <dd className="text-foreground font-mono">{review.id}</dd>
          <dt className="text-muted-foreground font-medium">User ID</dt>
          <dd className="text-foreground font-mono">{review.userId}</dd>
          {review.orderId && (
            <>
              <dt className="text-muted-foreground font-medium">Order ID</dt>
              <dd className="text-foreground font-mono">{review.orderId}</dd>
            </>
          )}
          {review.moderatedBy && (
            <>
              <dt className="text-muted-foreground font-medium">Moderated by</dt>
              <dd className="text-foreground font-mono">{review.moderatedBy}</dd>
            </>
          )}
          <dt className="text-muted-foreground font-medium">Report count</dt>
          <dd className="text-foreground">{review.reportCount}</dd>
          <dt className="text-muted-foreground font-medium">Helpful count</dt>
          <dd className="text-foreground">{review.helpfulCount}</dd>
        </dl>
      </div>
    </div>
  );
}
