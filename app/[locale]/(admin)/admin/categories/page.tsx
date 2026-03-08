import type { Metadata } from "next";
import { getCategories } from "@/lib/db";
import { Tag } from "lucide-react";

export const metadata: Metadata = { title: "Categories — Admin — Licorice Herbals" };

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-foreground text-2xl font-bold">Categories</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {categories.length} categor{categories.length !== 1 ? "ies" : "y"} defined
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <Tag className="text-muted-foreground mb-3 h-10 w-10" />
          <p className="text-foreground font-medium">No categories yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Categories will appear here once added to Firestore.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-medium tracking-wider uppercase">
                <th className="text-muted-foreground px-4 py-3">#</th>
                <th className="text-muted-foreground px-4 py-3">Label</th>
                <th className="text-muted-foreground px-4 py-3">Slug</th>
                <th className="text-muted-foreground px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id} className="hover:bg-background border-b last:border-0">
                  <td className="text-muted-foreground px-4 py-3 text-sm">{i + 1}</td>
                  <td className="text-foreground px-4 py-3 text-sm font-medium">{cat.label}</td>
                  <td className="px-4 py-3">
                    <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-mono">
                      {cat.slug}
                    </span>
                  </td>
                  <td className="text-muted-foreground max-w-xs truncate px-4 py-3 text-sm">
                    {cat.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
