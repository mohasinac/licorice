"use client";

import * as React from "react";
import type { Variant } from "@/lib/types";

interface VariantSelectorProps {
  variants: Variant[];
  selected: Variant;
  onSelect: (variant: Variant) => void;
}

export function VariantSelector({ variants, selected, onSelect }: VariantSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-foreground text-sm font-semibold">
        Size: <span className="text-muted-foreground font-normal">{selected.label}</span>
      </span>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selected.id;
          const isOOS = variant.stock - variant.reservedStock <= 0;
          return (
            <button
              key={variant.id}
              onClick={() => !isOOS && onSelect(variant)}
              disabled={isOOS}
              className={[
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                isSelected
                  ? "bg-primary border-primary text-white"
                  : isOOS
                    ? "border-border text-muted-foreground cursor-not-allowed line-through opacity-50"
                    : "border-border text-foreground hover:border-primary hover:text-primary",
              ].join(" ")}
              aria-pressed={isSelected}
              aria-label={`${variant.label}${isOOS ? " — out of stock" : ""}`}
            >
              {variant.label}
              {isOOS && " (OOS)"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
