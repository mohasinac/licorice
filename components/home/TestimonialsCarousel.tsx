"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Review } from "@/lib/types";

interface TestimonialsCarouselProps {
  reviews: Review[];
}

export function TestimonialsCarousel({ reviews }: TestimonialsCarouselProps) {
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [autoplay.current]);

  if (reviews.length === 0) return null;

  return (
    <section className="bg-primary/5 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="What Our Customers Say"
          subtitle="Real results from real people"
          className="mb-10"
        />

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="min-w-0 flex-[0_0_calc(100%-16px)] rounded-2xl bg-white p-6 shadow-sm sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]"
              >
                <StarRating value={review.rating} size="sm" className="mb-3" />
                <p className="text-foreground line-clamp-4 text-sm leading-relaxed">
                  &ldquo;{review.body}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                    {(review.authorName ?? "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {review.authorName ?? "Verified Customer"}
                    </p>
                    {review.isVerifiedPurchase && (
                      <p className="text-xs text-green-600">Verified Purchase</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
