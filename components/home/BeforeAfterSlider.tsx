import { getBeforeAfterItems } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BeforeAfterCard } from "@/components/home/BeforeAfterCard";

export async function BeforeAfterSlider() {
  const items = await getBeforeAfterItems();
  const t = await getTranslations("home");

  if (items.length === 0) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t("realResults")} subtitle={t("realResultsSub")} />
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {items.map((item) => (
            <BeforeAfterCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
