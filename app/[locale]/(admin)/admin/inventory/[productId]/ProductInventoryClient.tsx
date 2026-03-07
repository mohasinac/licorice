"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { InventoryRow } from "@/components/admin/InventoryRow";
import { StockAdjustModal } from "@/components/admin/StockAdjustModal";
import type { Product, InventoryDoc, StockMovement, StockMovementType } from "@/lib/types";

interface Props {
  product: Product;
  inventory: InventoryDoc | null;
  movements: StockMovement[];
}

const MOVEMENT_LABELS: Record<string, string> = {
  stock_in: "Stock In",
  sale: "Sale",
  return: "Return",
  adjustment: "Adjustment",
  reserved: "Reserved",
  released: "Released",
};

export function ProductInventoryClient({ product, inventory, movements }: Props) {
  const [adjustingVariantId, setAdjustingVariantId] = React.useState<string | null>(null);
  const [localInventory, setLocalInventory] = React.useState(inventory);

  const adjustingVariant = product.variants.find((v) => v.id === adjustingVariantId);

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
      setLocalInventory((prev) => {
        const current = prev?.variants?.[variantId]?.stock ?? 0;
        return {
          ...(prev ?? { productId, updatedAt: new Date() }),
          variants: {
            ...(prev?.variants ?? {}),
            [variantId]: {
              ...(prev?.variants?.[variantId] ?? {
                reservedStock: 0,
                lowStockThreshold: 10,
                reorderPoint: 5,
              }),
              stock: Math.max(0, current + delta),
            },
          },
        };
      });
      toast.success("Stock updated!");
    } catch {
      toast.error("Failed to update stock.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Variants table */}
      <div className="border-border overflow-x-auto rounded-2xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-border border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide">Variant</th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide">Total</th>
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
            {product.variants.map((variant) => {
              const entry = localInventory?.variants?.[variant.id] ?? {
                stock: variant.stock,
                reservedStock: variant.reservedStock ?? 0,
                lowStockThreshold: 10,
                reorderPoint: 5,
              };
              return (
                <InventoryRow
                  key={variant.id}
                  productName=""
                  variantLabel={variant.label}
                  variantId={variant.id}
                  entry={entry}
                  onAdjust={setAdjustingVariantId}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stock movements ledger */}
      {movements.length > 0 && (
        <div>
          <h2 className="font-heading text-foreground mb-3 text-xl font-semibold">
            Stock Movements
          </h2>
          <div className="border-border overflow-x-auto rounded-2xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-border border-b">
                  <th className="px-4 py-3 text-left text-xs font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Variant</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Note</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => {
                  const variant = product.variants.find((v) => v.id === m.variantId);
                  const isRemoval = ["sale", "adjustment", "reserved"].includes(m.type);
                  return (
                    <tr key={m.id} className="border-border border-b">
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            isRemoval
                              ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                              : "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                          }`}
                        >
                          {MOVEMENT_LABELS[m.type] ?? m.type}
                        </span>
                      </td>
                      <td className="text-muted-foreground px-4 py-2.5">
                        {variant?.label ?? m.variantId}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-semibold tabular-nums ${
                          isRemoval ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isRemoval ? "-" : "+"}
                        {m.quantity}
                      </td>
                      <td className="text-muted-foreground px-4 py-2.5 text-xs">{m.note ?? "—"}</td>
                      <td className="text-muted-foreground px-4 py-2.5 text-right text-xs">
                        {m.createdAt instanceof Date ? m.createdAt.toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {movements.length === 0 && (
        <p className="text-muted-foreground text-sm">No stock movements recorded yet.</p>
      )}

      {adjustingVariant && (
        <StockAdjustModal
          open={true}
          productId={product.id}
          variantId={adjustingVariant.id}
          variantLabel={adjustingVariant.label}
          currentStock={
            localInventory?.variants?.[adjustingVariant.id]?.stock ?? adjustingVariant.stock
          }
          onClose={() => setAdjustingVariantId(null)}
          onSubmit={handleAdjust}
        />
      )}
    </div>
  );
}
