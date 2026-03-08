"use client";

import * as React from "react";

export type ReviewFilterValue = "all" | "5" | "4" | "3" | "2" | "1" | "verified" | "photos";

interface ReviewFiltersProps {
  activeFilter: ReviewFilterValue;
  onChange: (filter: ReviewFilterValue) => void;
  ratingCounts: Record<number, number>;
  totalCount: number;
}

const FILTERS: { value: ReviewFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4 Stars" },
  { value: "3", label: "3 Stars" },
  { value: "2", label: "2 Stars" },
  { value: "1", label: "1 Star" },
  { value: "verified", label: "Verified Only" },
  { value: "photos", label: "With Photos" },
];

export function ReviewFilters({
  activeFilter,
  onChange,
  ratingCounts,
  totalCount,
}: ReviewFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter reviews">
      {FILTERS.map((f) => {
        const count =
          f.value === "all"
            ? totalCount
            : ["5", "4", "3", "2", "1"].includes(f.value)
              ? (ratingCounts[Number(f.value)] ?? 0)
              : undefined;
        return (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange(f.value)}
            className={[
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeFilter === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary bg-card",
            ].join(" ")}
          >
            {f.label}
            {count !== undefined ? ` (${count})` : ""}
          </button>
        );
      })}
    </div>
  );
}
