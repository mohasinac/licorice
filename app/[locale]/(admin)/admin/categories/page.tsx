import type { Metadata } from "next";
import { getCategories } from "@/lib/db";
import { CategoriesClient } from "./CategoriesClient";

export const metadata: Metadata = { title: "Categories — Admin — Licorice Herbals" };

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return <CategoriesClient initialCategories={categories} />;
}
