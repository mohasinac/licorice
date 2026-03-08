"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/admin/DataTable";
import type { Product } from "@/lib/types";

interface Props {
  products: Product[];
}

export function AdminProductsTable({ products }: Props) {
  const router = useRouter();
  const locale = useLocale();

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          {p.images?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.images[0]}
              alt=""
              className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
            />
          )}
          <div>
            <p className="text-foreground text-sm font-medium">{p.name}</p>
            <p className="text-muted-foreground text-xs">{p.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (p) => {
        const v = p.variants?.[0];
        return v ? (
          <span className="text-foreground text-sm">₹{v.price}</span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      render: (p) => {
        const total = p.variants?.reduce((s, v) => s + v.stock, 0) ?? 0;
        return (
          <span
            className={`text-sm font-medium ${
              total === 0 ? "text-destructive" : total < 10 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"
            }`}
          >
            {total}
          </span>
        );
      },
    },
    {
      key: "variants",
      header: "Variants",
      render: (p) => (
        <span className="text-muted-foreground text-sm">{p.variants?.length ?? 0}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge variant={p.isActive ? "success" : "outline"}>
          {p.isActive ? "Active" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "featured",
      header: "Featured",
      render: (p) =>
        p.isFeatured ? (
          <Badge variant="info">Featured</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      keyExtractor={(p) => p.id}
      emptyMessage="No products yet. Create your first product."
      onRowClick={(p) => router.push(`/${locale}/admin/products/${p.id}`)}
    />
  );
}
