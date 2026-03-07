"use client";

import * as React from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  /** Current image URLs (from Firebase Storage or mock) */
  images?: string[];
  onChange?: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUploader({
  images = [],
  onChange,
  maxImages = 8,
  className,
}: ImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [previews, setPreviews] = React.useState<string[]>(images);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = maxImages - previews.length;
    const toLoad = Array.from(files).slice(0, remaining);

    toLoad.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviews((prev) => {
          // In a real implementation these base64 URLs would be uploaded to
          // Firebase Storage and swapped for CDN URLs. For now we store the
          // data URL locally and propagate it.
          const next = [...prev, result];
          onChange?.(next);
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
  }

  function remove(index: number) {
    const next = previews.filter((_, i) => i !== index);
    setPreviews(next);
    onChange?.(next);
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Drop zone */}
      <div
        className={cn(
          "border-border flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors",
          dragging ? "border-primary bg-primary/5" : "hover:border-primary/60",
          previews.length >= maxImages && "pointer-events-none opacity-40",
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="text-muted-foreground mb-2 h-8 w-8" />
        <p className="text-foreground text-sm font-medium">Drag & drop or click to upload</p>
        <p className="text-muted-foreground mt-1 text-xs">
          PNG, JPG, WEBP — up to {maxImages} images
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {previews.map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Product image ${i + 1}`}
                className="h-full w-full object-cover"
              />
              {i === 0 && (
                <span className="bg-primary text-primary-foreground absolute bottom-1 left-1 rounded px-1 py-0.5 text-[10px] font-medium">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="bg-foreground/70 text-background absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {previews.length < maxImages && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="border-border text-muted-foreground hover:border-primary flex aspect-square items-center justify-center rounded-xl border-2 border-dashed transition-colors"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
