import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Category } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  face: "🧴",
  body: "🧖",
  hair: "💆",
  powder: "🌾",
  combo: "🎁",
  supplements: "💊",
};

interface CategoryGridProps {
  categories: Category[];
}

export async function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Shop by Category"
          subtitle="Curated collections for every concern"
          className="mb-12"
        />

        {/* Scrollable row on mobile, grid on desktop */}
        <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group from-primary/5 to-secondary/5 relative flex min-w-[140px] flex-col items-center gap-4 rounded-2xl border border-transparent bg-gradient-to-br p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 sm:min-w-0"
            >
              {/* Glow ring on hover */}
              <span className="bg-primary/8 group-hover:bg-primary/15 flex h-16 w-16 items-center justify-center rounded-full text-3xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10">
                {CATEGORY_ICONS[cat.slug] ?? "🌿"}
              </span>
              <span className="text-foreground group-hover:text-primary text-sm font-semibold tracking-wide transition-colors">
                {cat.label}
              </span>
              {/* Decorative bottom line */}
              <span className="bg-accent h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-8" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
