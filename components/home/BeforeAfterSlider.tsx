import { getBeforeAfterItems } from "@/lib/db";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BeforeAfterCard } from "@/components/home/BeforeAfterCard";

export async function BeforeAfterSlider() {
  const items = await getBeforeAfterItems();

  if (items.length === 0) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Real Results" subtitle="See the difference our products make" />
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {items.map((item) => (
            <BeforeAfterCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
