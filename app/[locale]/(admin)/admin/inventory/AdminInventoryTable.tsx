"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { InventoryRow } from "@/components/admin/InventoryRow";
import { StockAdjustModal } from "@/components/admin/StockAdjustModal";
import type { InventoryVariantEntry, StockMovementType } from "@/lib/types";

interface InventoryTableRow {
  productId: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  entry: InventoryVariantEntry;
}

interface AdminInventoryTableProps {
  rows: InventoryTableRow[];
}

export function AdminInventoryTable({ rows }: AdminInventoryTableProps) {
  const [adjusting, setAdjusting] = React.useState<InventoryTableRow | null>(null);
  const [localRows, setLocalRows] = React.useState(rows);

  async function handleAdjust(
    productId: string,
    variantId: string,
    delta: number,
    type: StockMovementType,
    note?: string,
  ) {
    try {
      const res = await fetch(`/api/admin/inventory/${productId}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, delta, type, note }),
      });
      if (!res.ok) throw new Error("Failed");
      // Optimistic update
      setLocalRows((prev) =>
        prev.map((r) =>
          r.productId === productId && r.variantId === variantId
            ? {
                ...r,
                entry: {
                  ...r.entry,
                  stock: Math.max(0, r.entry.stock + delta),
                },
              }
            : r,
        ),
      );
      toast.success("Stock updated!");
    } catch {
      toast.error("Failed to update stock.");
    }
  }

  return (
    <>
      <div className="border-border overflow-x-auto rounded-2xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-border border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide">
                Product / Variant
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide">
                Total Stock
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide">Reserved</th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide">
                Available
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide">
                Low Threshold
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide">
                Reorder Point
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {localRows.map((row) => (
              <InventoryRow
                key={`${row.productId}-${row.variantId}`}
                productName={row.productName}
                variantLabel={row.variantLabel}
                variantId={row.variantId}
                entry={row.entry}
                onAdjust={() => setAdjusting(row)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {adjusting && (
        <StockAdjustModal
          open={true}
          productId={adjusting.productId}
          variantId={adjusting.variantId}
          variantLabel={`${adjusting.productName} · ${adjusting.variantLabel}`}
          currentStock={adjusting.entry.stock}
          onClose={() => setAdjusting(null)}
          onSubmit={handleAdjust}
        />
      )}
    </>
  );
}
