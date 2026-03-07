import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getProducts } from "@/lib/db";
import { AdminProductsTable } from "./AdminProductsTable";

export const metadata: Metadata = {
  title: "Products — Admin",
};

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-foreground text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">{products.length} products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Product
        </Link>
      </div>
      <AdminProductsTable products={products} />
    </div>
  );
}
