"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import type { InventoryVariantEntry } from "@/lib/types";

interface InventoryRowProps {
  productName: string;
  variantLabel: string;
  variantId: string;
  entry: InventoryVariantEntry;
  onAdjust?: (variantId: string) => void;
}

export function InventoryRow({
  productName,
  variantLabel,
  variantId,
  entry,
  onAdjust,
}: InventoryRowProps) {
  const available = entry.stock - entry.reservedStock;
  const isLow = available <= entry.lowStockThreshold && available > 0;
  const isOOS = available <= 0;

  return (
    <tr
      className={`border-border border-b text-sm transition-colors ${
        isOOS ? "bg-destructive/5" : isLow ? "bg-yellow-50 dark:bg-yellow-950/20" : ""
      }`}
    >
      <td className="px-4 py-3">
        <p className="text-foreground font-medium">{productName}</p>
        <p className="text-muted-foreground text-xs">{variantLabel}</p>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-foreground tabular-nums">{entry.stock}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-muted-foreground tabular-nums">{entry.reservedStock}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span
          className={`font-semibold tabular-nums ${
            isOOS ? "text-destructive" : isLow ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"
          }`}
        >
          {available}
        </span>
        {(isLow || isOOS) && (
          <AlertCircle
            className={`ml-1 inline h-3.5 w-3.5 ${isOOS ? "text-destructive" : "text-yellow-500 dark:text-yellow-400"}`}
          />
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-muted-foreground tabular-nums">{entry.lowStockThreshold}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-muted-foreground tabular-nums">{entry.reorderPoint}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onAdjust?.(variantId)}
          className="text-primary text-xs font-medium hover:underline"
        >
          Adjust
        </button>
      </td>
    </tr>
  );
}
