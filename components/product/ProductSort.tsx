"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/Select";

export function ProductSort() {
  const t = useTranslations("shop");
  const SORT_OPTIONS = [
    { value: "featured", label: t("featuredSort") },
    { value: "newest", label: t("newestSort") },
    { value: "price_asc", label: t("priceLow") },
    { value: "price_desc", label: t("priceHigh") },
    { value: "rating", label: t("topRated") },
  ] as const;

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
