import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = {
  title: "New Product — Admin",
};

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-foreground text-3xl font-bold">New Product</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Fill in the details below to add a new product to the catalogue.
        </p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
