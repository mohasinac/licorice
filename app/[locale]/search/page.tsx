import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getProducts, getCategories, getConcerns } from "@/lib/db";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SearchForm } from "@/components/layout/SearchForm";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Tag, Leaf } from "lucide-react";

export const metadata: Metadata = {
  title: "Search",
};

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const t = await getTranslations("search");
  const sp = await searchParams;
  const query = (sp.q ?? "").trim().toLowerCase();

  if (!query) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-lg text-center">
            <h1 className="font-heading text-foreground mb-3 text-3xl font-bold">
              {t("title")}
            </h1>
            <p className="text-muted-foreground mb-8">{t("enterTerm")}</p>
            <SearchForm />
          </div>
        </div>
      </div>
    );
  }

  const [allProducts, categories, concerns] = await Promise.all([
    getProducts(),
    getCategories(),
    getConcerns(),
  ]);

  const products = allProducts.filter((p) => {
    const name = typeof p.name === "string" ? p.name : (p.name as { en?: string })?.en ?? "";
    return (
      name.toLowerCase().includes(query) ||
      p.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
      (typeof p.shortDescription === "string"
        ? p.shortDescription.toLowerCase().includes(query)
        : false) ||
      p.category?.toLowerCase().includes(query) ||
      p.concerns?.some((c) => c.toLowerCase().includes(query))
    );
  });

  const matchedCategories = categories.filter(
    (c) =>
      c.label.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query) ||
      (c.description ?? "").toLowerCase().includes(query),
  );

  const matchedConcerns = concerns.filter(
    (c) =>
      c.label.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query) ||
      (c.description ?? "").toLowerCase().includes(query),
  );

  const totalCount = products.length + matchedCategories.length + matchedConcerns.length;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header + search box */}
        <div className="mb-10">
          <p className="text-muted-foreground mb-4 text-sm">
            {totalCount > 0
              ? t("foundTotal", { count: totalCount, query })
              : t("noResultsFor", { query })}
          </p>
          <SearchForm defaultValue={sp.q} />
        </div>

        {totalCount === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-lg">{t("noResultsFor", { query })}</p>
            <p className="text-muted-foreground mt-2 text-sm">{t("tryDifferent")}</p>
          </div>
        )}

        {/* Categories */}
        {matchedCategories.length > 0 && (
          <section className="mb-12">
            <h2 className="font-heading text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
              <Tag className="text-primary h-5 w-5" />
              {t("categories")}
              <span className="text-muted-foreground text-sm font-normal">
                ({matchedCategories.length})
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {matchedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="border-border hover:border-primary/40 hover:bg-primary/5 group flex flex-col items-center rounded-2xl border bg-card p-4 text-center transition-colors"
                >
                  {cat.imageUrl ? (
                    <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full">
                      <Image
                        src={cat.imageUrl}
                        alt={cat.label}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-primary/10 mb-3 flex h-16 w-16 items-center justify-center rounded-full">
                      <Tag className="text-primary h-7 w-7" />
                    </div>
                  )}
                  <span className="text-foreground text-sm font-medium">{cat.label}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Concerns */}
        {matchedConcerns.length > 0 && (
          <section className="mb-12">
            <h2 className="font-heading text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
              <Leaf className="text-primary h-5 w-5" />
              {t("concerns")}
              <span className="text-muted-foreground text-sm font-normal">
                ({matchedConcerns.length})
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {matchedConcerns.map((concern) => (
                <Link
                  key={concern.id}
                  href={`/concern/${concern.slug}`}
                  className="border-border hover:border-primary/40 hover:bg-primary/5 group flex flex-col items-center rounded-2xl border bg-card p-4 text-center transition-colors"
                >
                  {concern.imageUrl ? (
                    <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full">
                      <Image
                        src={concern.imageUrl}
                        alt={concern.label}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-primary/10 mb-3 flex h-16 w-16 items-center justify-center rounded-full">
                      <Leaf className="text-primary h-7 w-7" />
                    </div>
                  )}
                  <span className="text-foreground text-sm font-medium">{concern.label}</span>
                  {concern.description && (
                    <span className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                      {concern.description}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        {products.length > 0 && (
          <section>
            <h2 className="font-heading text-foreground mb-6 text-lg font-semibold">
              {t("products")}
              <span className="text-muted-foreground ml-2 text-sm font-normal">
                ({products.length})
              </span>
            </h2>
            <ProductGrid products={products} />
          </section>
        )}
      </div>
    </div>
  );
}
