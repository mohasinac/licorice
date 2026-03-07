"use client";

import * as React from "react";
import { Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Variant } from "@/lib/types";

type PartialVariant = Partial<Variant> & {
  id: string;
  label: string;
  price: number;
  sku: string;
  stock: number;
  reservedStock: number;
  weight: number;
  isDefault: boolean;
};

interface VariantManagerProps {
  variants: PartialVariant[];
  onChange: (variants: PartialVariant[]) => void;
}

const BLANK_VARIANT = (): PartialVariant => ({
  id: `var_${Date.now()}`,
  label: "",
  price: 0,
  compareAtPrice: undefined,
  sku: "",
  stock: 50,
  reservedStock: 0,
  weight: 100,
  isDefault: false,
});

export function VariantManager({ variants, onChange }: VariantManagerProps) {
  function update(index: number, patch: Partial<PartialVariant>) {
    const next = variants.map((v, i) => (i === index ? { ...v, ...patch } : v));
    onChange(next);
  }

  function add() {
    onChange([...variants, BLANK_VARIANT()]);
  }

  function remove(index: number) {
    const next = variants.filter((_, i) => i !== index);
    // If removed was default, set first remaining as default
    if (variants[index].isDefault && next.length > 0) {
      next[0].isDefault = true;
    }
    onChange(next);
  }

  function setDefault(index: number) {
    onChange(variants.map((v, i) => ({ ...v, isDefault: i === index })));
  }

  return (
    <div className="flex flex-col gap-3">
      {variants.map((variant, i) => (
        <div
          key={variant.id}
          className={`border-border relative rounded-xl border p-4 ${
            variant.isDefault ? "border-primary bg-primary/5" : ""
          }`}
        >
          {variant.isDefault && (
            <span className="bg-primary text-primary-foreground absolute -top-2.5 left-3 rounded-full px-2 py-0.5 text-xs font-medium">
              Default
            </span>
          )}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">Variant {i + 1}</span>
            <div className="flex gap-1">
              {!variant.isDefault && (
                <button
                  type="button"
                  onClick={() => setDefault(i)}
                  className="text-muted-foreground hover:text-primary p-1"
                  title="Set as default"
                >
                  <Star className="h-4 w-4" />
                </button>
              )}
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Input
              label="Label"
              placeholder="e.g. 100ml"
              value={variant.label}
              onChange={(e) => update(i, { label: e.target.value })}
            />
            <Input
              label="Price (₹)"
              type="number"
              placeholder="399"
              value={variant.price || ""}
              onChange={(e) => update(i, { price: Number(e.target.value) })}
            />
            <Input
              label="Compare At (₹)"
              type="number"
              placeholder="499"
              value={variant.compareAtPrice || ""}
              onChange={(e) =>
                update(i, {
                  compareAtPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <Input
              label="SKU"
              placeholder="LH-001-100ML"
              value={variant.sku}
              onChange={(e) => update(i, { sku: e.target.value })}
            />
            <Input
              label="Stock"
              type="number"
              placeholder="50"
              value={variant.stock}
              onChange={(e) => update(i, { stock: Number(e.target.value) })}
            />
            <Input
              label="Weight (g)"
              type="number"
              placeholder="150"
              value={variant.weight}
              onChange={(e) => update(i, { weight: Number(e.target.value) })}
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="self-start" onClick={add}>
        <Plus className="h-4 w-4" /> Add Variant
      </Button>
    </div>
  );
}
