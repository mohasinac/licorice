"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { submitReview } from "@/lib/actions/reviews";
import { useAuthStore } from "@/stores/useAuthStore";

const schema = z.object({
  rating: z.number().int().min(1, "Please select a rating").max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(20, "Review must be at least 20 characters").max(2000),
});

type FormValues = z.infer<typeof schema>;

interface AddReviewFormProps {
  productId: string;
  orderId?: string;
  isVerifiedPurchase: boolean;
  onSuccess?: () => void;
}

export function AddReviewForm({
  productId,
  orderId,
  isVerifiedPurchase,
  onSuccess,
}: AddReviewFormProps) {
  const t = useTranslations("product");
  const user = useAuthStore((s) => s.user);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0 },
  });

  const rating = watch("rating");

  async function onSubmit(values: FormValues) {
    if (!user) return;
    setSubmitting(true);
    const result = await submitReview({
      userId: user.uid,
      authorName: user.displayName ?? user.email?.split("@")[0] ?? "Customer",
      productId,
      orderId,
      isVerifiedPurchase,
      rating: values.rating,
      title: values.title || undefined,
      body: values.body,
      images: [],
    });
    setSubmitting(false);
    if (result.success) {
      toast.success(t("reviewSubmitted"));
      reset();
      onSuccess?.();
    } else {
      toast.error(result.error);
    }
  }

  if (!user) {
    return (
      <div className="bg-muted rounded-xl p-5 text-center">
        <p className="text-foreground/70 text-sm">
          {t("signInToReview")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <label className="text-foreground mb-2 block text-sm font-medium">
          {t("ratingLabel")} <span className="text-destructive">*</span>
        </label>
        <StarRating
          value={rating}
          interactive
          size="lg"
          onChange={(v) => setValue("rating", v, { shouldValidate: true })}
        />
        {errors.rating && (
          <p className="text-destructive mt-1 text-xs">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label className="text-foreground mb-1 block text-sm font-medium">
          {t("reviewTitleLabel")}
        </label>
        <input
          {...register("title")}
          type="text"
          placeholder={t("reviewTitlePlaceholder")}
          className="border-border focus:ring-primary w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-foreground mb-1 block text-sm font-medium">
          {t("reviewBodyLabel")} <span className="text-destructive">*</span>
        </label>
        <textarea
          {...register("body")}
          rows={4}
          placeholder={t("reviewBodyPlaceholder")}
          className="border-border focus:ring-primary w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
        />
        {errors.body && (
          <p className="text-destructive mt-1 text-xs">{errors.body.message}</p>
        )}
      </div>

      <Button type="submit" loading={submitting} className="self-start">
        {t("submitReview")}
      </Button>

      <p className="text-muted-foreground text-xs">
        {t("reviewsModeration")}
      </p>
    </form>
  );
}
