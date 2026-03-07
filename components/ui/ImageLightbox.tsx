"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  altPrefix?: string;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  open,
  onClose,
  altPrefix = "Image",
}: ImageLightboxProps) {
  const [idx, setIdx] = React.useState(initialIndex);

  React.useEffect(() => {
    setIdx(initialIndex);
  }, [initialIndex]);

  React.useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, images.length, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Counter */}
      <span className="absolute top-4 left-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
        {idx + 1} / {images.length}
      </span>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIdx((i) => (i - 1 + images.length) % images.length);
          }}
          className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <div
        className="relative mx-16 max-h-[85vh] w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[idx]}
          alt={`${altPrefix} ${idx + 1}`}
          width={1200}
          height={900}
          className="max-h-[85vh] w-full rounded-xl object-contain"
          unoptimized
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIdx((i) => (i + 1) % images.length);
          }}
          className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setIdx(i);
              }}
              className={[
                "h-12 w-12 overflow-hidden rounded-lg border-2 transition-opacity",
                i === idx ? "border-white" : "border-transparent opacity-60",
              ].join(" ")}
            >
              <Image
                src={src}
                alt={`Thumbnail ${i + 1}`}
                width={48}
                height={48}
                className="h-full w-full object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Standalone trigger wrapper for inline usage
interface LightboxTriggerProps {
  images: string[];
  initialIndex?: number;
  children: React.ReactNode;
}

export function LightboxTrigger({ images, initialIndex = 0, children }: LightboxTriggerProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="group relative" aria-label="View full image">
        {children}
        <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 transition-colors group-hover:bg-black/20">
          <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </button>
      <ImageLightbox
        images={images}
        initialIndex={initialIndex}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
