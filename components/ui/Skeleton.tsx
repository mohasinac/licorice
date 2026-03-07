"use client";

import * as React from "react";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({ className = "", rounded = "md" }: SkeletonProps) {
  const roundedMap = { sm: "rounded", md: "rounded-lg", lg: "rounded-xl", full: "rounded-full" };
  return (
    <div
      aria-hidden
      className={["bg-surface animate-pulse", roundedMap[rounded], className].join(" ")}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-square w-full" rounded="lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-video w-full" rounded="lg" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}
