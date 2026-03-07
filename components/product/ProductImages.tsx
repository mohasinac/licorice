"use client";

import * as React from "react";
import Image from "next/image";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { ZoomIn } from "lucide-react";

interface ProductImagesProps {
  images: string[];
  productName: string;
}

export function ProductImages({ images, productName }: ProductImagesProps) {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  const safeImages = images.length > 0 ? images : ["/images/placeholder.jpg"];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="group bg-muted relative cursor-zoom-in overflow-hidden rounded-2xl"
        style={{ aspectRatio: "1 / 1" }}
        onClick={() => setLightboxOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Zoom image"
        onKeyDown={(e) => e.key === "Enter" && setLightboxOpen(true)}
      >
        <Image
          src={safeImages[activeIdx]}
          alt={`${productName} — view ${activeIdx + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        {/* Zoom hint */}
        <span className="absolute right-3 bottom-3 rounded-full bg-white/70 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ZoomIn className="text-foreground h-4 w-4" />
        </span>
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={[
                "flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                i === activeIdx
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100",
              ].join(" ")}
              style={{ width: 72, height: 72 }}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                width={72}
                height={72}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <ImageLightbox
        images={safeImages}
        initialIndex={activeIdx}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        altPrefix={productName}
      />
    </div>
  );
}
