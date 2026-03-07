import { Leaf, Shield, FlaskConical, Award } from "lucide-react";

const values = [
  {
    icon: Leaf,
    title: "100% Natural",
    description:
      "Every ingredient is plant-derived, cold-pressed or steam-distilled — nothing synthetic.",
  },
  {
    icon: Shield,
    title: "Cruelty-Free",
    description: "Never tested on animals. PETA-registered and Leaping Bunny certified.",
  },
  {
    icon: FlaskConical,
    title: "Dermat Tested",
    description: "Clinically tested by certified dermatologists for every skin type.",
  },
  {
    icon: Award,
    title: "GMP Certified",
    description:
      "Manufactured in a WHO-GMP certified facility adhering to the highest safety standards.",
  },
] as const;

export function BrandValues() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="border-border flex flex-col items-center gap-4 rounded-2xl border bg-white p-8 text-center"
            >
              <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full">
                <Icon className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-heading text-primary text-lg font-semibold">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
