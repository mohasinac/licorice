import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getInventory, getStockMovements } from "@/lib/db";
import { ProductInventoryClient } from "./ProductInventoryClient";

interface Props {
  params: Promise<{ productId: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProduct(productId);
  const name = product ? product.name : productId;

  return { title: `${name} Inventory — Admin` };
}

export default async function ProductInventoryPage({ params }: Props) {
  const { productId } = await params;
  const [product, inventory, movements] = await Promise.all([
    getProduct(productId),
    getInventory(productId),
    getStockMovements(productId),
  ]);

  if (!product) notFound();

  const productName = product.name;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <p className="text-muted-foreground text-sm">Inventory</p>
        <h1 className="font-heading text-foreground text-3xl font-bold">{productName}</h1>
      </div>
      <ProductInventoryClient product={product} inventory={inventory} movements={movements} />
    </div>
  );
}
