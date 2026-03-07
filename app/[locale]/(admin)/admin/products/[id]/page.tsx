import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  const name = product ? (typeof product.name === "string" ? product.name : id) : id;
  return { title: `Edit ${name} — Admin` };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm">Edit Product</p>
        <h1 className="font-heading text-foreground text-3xl font-bold">{product.name}</h1>
      </div>
      <ProductForm product={product} mode="edit" />
    </div>
  );
}
