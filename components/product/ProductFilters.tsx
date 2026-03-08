"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { Category, Concern } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const CERTIFICATIONS = [
  { id: "cruelty-free", label: "Cruelty Free" },
  { id: "vegan", label: "Vegan" },
  { id: "no-parabens", label: "No Parabens" },
  { id: "ayurvedic", label: "Ayurvedic" },
];

interface ProductFiltersProps {
  /** pre-selected category (for category pages) */
  lockedCategory?: string;
  categories?: Category[];
  concerns?: Concern[];
}

export function ProductFilters({ lockedCategory, categories = [], concerns = [] }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.getAll("category");
  const selectedConcerns = searchParams.getAll("concern");
  const selectedCerts = searchParams.getAll("cert");

  function buildParams(key: string, value: string, current: string[]): URLSearchParams {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    next.forEach((v) => params.append(key, v));
    return params;
  }

  function toggle(key: string, value: string, current: string[]) {
    const params = buildParams(key, value, current);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  const hasFilters = selectedCategories.length + selectedConcerns.length + selectedCerts.length > 0;

  return (
    <aside className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-primary h-4 w-4" />
          <span className="font-heading text-foreground text-base font-semibold">Filters</span>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-primary flex items-center gap-1 text-xs hover:underline"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* Category */}
      {!lockedCategory && (
        <FilterSection title="Category">
          {categories.map((cat) => (
            <CheckboxItem
              key={cat.id}
              id={`cat-${cat.id}`}
              label={cat.label}
              checked={selectedCategories.includes(cat.slug)}
              onChange={() => toggle("category", cat.slug, selectedCategories)}
            />
          ))}
        </FilterSection>
      )}

      {/* Concern */}
      <FilterSection title="Skin Concern">
        {concerns.map((con) => (
          <CheckboxItem
            key={con.id}
            id={`con-${con.id}`}
            label={con.label}
            checked={selectedConcerns.includes(con.slug)}
            onChange={() => toggle("concern", con.slug, selectedConcerns)}
          />
        ))}
      </FilterSection>

      {/* Certifications */}
      <FilterSection title="Certifications">
        {CERTIFICATIONS.map((cert) => (
          <CheckboxItem
            key={cert.id}
            id={`cert-${cert.id}`}
            label={cert.label}
            checked={selectedCerts.includes(cert.id)}
            onChange={() => toggle("cert", cert.id, selectedCerts)}
          />
        ))}
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-foreground mb-2 flex w-full items-center justify-between text-sm font-semibold"
      >
        {title}
        <span className="text-muted-foreground text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="flex flex-col gap-2">{children}</div>}
    </div>
  );
}

function CheckboxItem({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="accent-primary h-4 w-4 rounded"
      />
      <span className={checked ? "text-foreground font-medium" : "text-muted-foreground"}>
        {label}
      </span>
    </label>
  );
}
