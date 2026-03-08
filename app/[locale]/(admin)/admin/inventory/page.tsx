import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/db";
import { getInventory } from "@/lib/db";
import { AdminInventoryTable } from "./AdminInventoryTable";

export const metadata: Metadata = {
  title: "Inventory — Admin",
};

export default async function AdminInventoryPage() {
  const products = await getProducts();

  // Load inventory docs for all products in parallel
  const inventoryDocs = await Promise.all(
    products.map(async (p) => ({
      product: p,
      inventory: await getInventory(p.id),
    })),
  );

  const rows = inventoryDocs.flatMap(({ product, inventory }) =>
    product.variants.map((variant) => ({
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      variantLabel: variant.label,
      entry: inventory?.variants?.[variant.id] ?? {
        stock: variant.stock,
        reservedStock: variant.reservedStock ?? 0,
        lowStockThreshold: 10,
        reorderPoint: 5,
      },
    })),
  );

  const lowCount = rows.filter(
    (r) => r.entry.stock - r.entry.reservedStock <= r.entry.lowStockThreshold,
  ).length;
  const oosCount = rows.filter((r) => r.entry.stock - r.entry.reservedStock <= 0).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-foreground text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {rows.length} variants ·{" "}
          <span className="font-medium text-yellow-600">{lowCount} low stock</span> ·{" "}
          <span className="text-destructive font-medium">{oosCount} out of stock</span>
        </p>
      </div>
      <AdminInventoryTable rows={rows} />
    </div>
  );
}
