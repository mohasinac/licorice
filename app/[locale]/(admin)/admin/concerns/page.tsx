import type { Metadata } from "next";
import { getConcerns } from "@/lib/db";
import { Target } from "lucide-react";

export const metadata: Metadata = { title: "Concerns — Admin — Licorice Herbals" };

export default async function AdminConcernsPage() {
  const concerns = await getConcerns();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-foreground text-2xl font-bold">Concerns</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {concerns.length} concern{concerns.length !== 1 ? "s" : ""} defined
        </p>
      </div>

      {concerns.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <Target className="text-muted-foreground mb-3 h-10 w-10" />
          <p className="text-foreground font-medium">No concerns yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Concerns will appear here once added to Firestore.
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
              {concerns.map((concern, i) => (
                <tr key={concern.id} className="hover:bg-background border-b last:border-0">
                  <td className="text-muted-foreground px-4 py-3 text-sm">{i + 1}</td>
                  <td className="text-foreground px-4 py-3 text-sm font-medium">
                    {concern.label}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-mono">
                      {concern.slug}
                    </span>
                  </td>
                  <td className="text-muted-foreground max-w-xs truncate px-4 py-3 text-sm">
                    {concern.description}
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
