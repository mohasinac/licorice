"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

const RANGES = [
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "12m", label: "12 Months" },
  { value: "24m", label: "24 Months" },
] as const;

export type AnalyticsRange = (typeof RANGES)[number]["value"];

export function AnalyticsRangePicker() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = (searchParams.get("range") as AnalyticsRange) || "12m";

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-card p-1">
      {RANGES.map((r) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", r.value);
        const isActive = current === r.value;

        return (
          <Link
            key={r.value}
            href={`${pathname}?${params.toString()}`}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {r.label}
          </Link>
        );
      })}
    </div>
  );
}
