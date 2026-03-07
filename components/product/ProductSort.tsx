"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select } from "@/components/ui/Select";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
] as const;

export function ProductSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "featured";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select
      options={[...SORT_OPTIONS]}
      value={sort}
      onValueChange={handleChange}
      className="w-48"
    />
  );
}

// Sort helper for server side sorting
export type SortKey = "featured" | "newest" | "price_asc" | "price_desc" | "rating";

import type { Product } from "@/lib/types";
import { toSafeDate } from "@/lib/utils";

export function sortProducts(products: Product[], sort: string): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => {
        const aPrice = a.variants.find((v) => v.isDefault)?.price ?? 0;
        const bPrice = b.variants.find((v) => v.isDefault)?.price ?? 0;
        return aPrice - bPrice;
      });
    case "price_desc":
      return copy.sort((a, b) => {
        const aPrice = a.variants.find((v) => v.isDefault)?.price ?? 0;
        const bPrice = b.variants.find((v) => v.isDefault)?.price ?? 0;
        return bPrice - aPrice;
      });
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort((a, b) => {
        const aTime = toSafeDate(a.createdAt)?.getTime() ?? 0;
        const bTime = toSafeDate(b.createdAt)?.getTime() ?? 0;
        return bTime - aTime;
      });
    default:
      return copy.sort((a, b) => a.sortOrder - b.sortOrder);
  }
}
