"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
}

export function ProductCarousel({ title, subtitle, products }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start", slidesToScroll: 1 });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (products.length === 0) return null;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <SectionHeading title={title} subtitle={subtitle} align="left" />
          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrev}
              className="border-border text-foreground/60 hover:border-primary hover:text-primary hidden rounded-full border p-2.5 transition-colors md:flex"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollNext}
              className="border-border text-foreground/60 hover:border-primary hover:text-primary hidden rounded-full border p-2.5 transition-colors md:flex"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-0 flex-[0_0_calc(50%-10px)] sm:flex-[0_0_calc(33.333%-14px)] lg:flex-[0_0_calc(25%-15px)]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
