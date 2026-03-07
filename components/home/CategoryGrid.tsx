import Link from "next/link";
import { getLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Category, Locale } from "@/lib/types";

interface CategoryGridProps {
  categories: Category[];
}

export async function CategoryGrid({ categories }: CategoryGridProps) {
  const locale = (await getLocale()) as Locale;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Shop by Category"
          subtitle="Curated collections for every concern"
          className="mb-10"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${locale}/shop?category=${cat.slug}`}
              className="group border-border hover:border-primary flex flex-col items-center gap-3 rounded-2xl border bg-white p-6 text-center transition-all hover:shadow-md"
            >
              <span className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full text-2xl">
                🌿
              </span>
              <span className="text-foreground group-hover:text-primary text-sm font-medium transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
