"use client";

import * as React from "react";
import Image from "next/image";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import type { Review } from "@/lib/types";

interface ReviewPhotoGalleryProps {
  reviews: Review[];
}

export function ReviewPhotoGallery({ reviews }: ReviewPhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  // Flatten all review images into a single array with metadata
  const allPhotos = reviews.flatMap((r) =>
    (r.images ?? []).map((img) => ({
      url: img,
      reviewerName: r.authorName ?? "Customer",
      rating: r.rating,
    })),
  );

  if (allPhotos.length === 0) return null;

  function openLightbox(idx: number) {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-foreground mb-3 text-sm font-medium">
          Customer Photos ({allPhotos.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {allPhotos.slice(0, 8).map((photo, idx) => (
            <button
              key={photo.url}
              type="button"
              onClick={() => openLightbox(idx)}
              className="border-border relative h-16 w-16 overflow-hidden rounded-lg border hover:opacity-90 sm:h-20 sm:w-20"
              aria-label={`Photo by ${photo.reviewerName}`}
            >
              <Image src={photo.url} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
          {allPhotos.length > 8 && (
            <button
              type="button"
              onClick={() => openLightbox(8)}
              className="border-border bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-lg border text-xs font-medium sm:h-20 sm:w-20"
            >
              +{allPhotos.length - 8} more
            </button>
          )}
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={allPhotos.map((p) => p.url)}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
