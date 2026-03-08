"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { Quote } from "lucide-react";
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
    <section className="relative overflow-hidden py-20">
      {/* Decorative background */}
      <div className="from-primary/5 to-accent/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="What Our Customers Say"
          subtitle="Real results from real people"
          className="mb-12"
        />

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="ayur-card group border-border/50 relative min-w-0 flex-[0_0_calc(100%-16px)] rounded-2xl border bg-white p-8 shadow-sm sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]"
              >
                {/* Large quote icon */}
                <Quote className="text-primary/10 mb-4 h-8 w-8" />

                <StarRating value={review.rating} size="sm" className="mb-4" />
                <p className="text-foreground/80 line-clamp-4 text-sm leading-relaxed italic">
                  &ldquo;{review.body}&rdquo;
                </p>

                {/* Divider */}
                <div className="bg-accent/30 my-5 h-px w-full" />

                <div className="flex items-center gap-3">
                  <div className="from-primary to-secondary flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white">
                    {(review.authorName ?? "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold">
                      {review.authorName ?? "Verified Customer"}
                    </p>
                    {review.isVerifiedPurchase && (
                      <p className="flex items-center gap-1 text-xs text-green-600">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                        Verified Purchase
                      </p>
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
