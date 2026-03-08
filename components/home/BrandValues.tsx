import {
  Leaf,
  Rabbit,
  FlaskConical,
  Award,
  Star,
  Heart,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { BrandValueItem } from "@/lib/types";

const ICON_MAP: Record<string, LucideIcon> = {
  Leaf,
  Rabbit,
  FlaskConical,
  Award,
  Star,
  Heart,
  Sparkles,
};

const DEFAULT_VALUES: BrandValueItem[] = [
  {
    icon: "Leaf",
    title: "100% Natural",
    description:
      "Every ingredient is plant-derived, cold-pressed or steam-distilled — nothing synthetic.",
  },
  {
    icon: "Rabbit",
    title: "Cruelty-Free",
    description: "Never tested on animals. PETA-registered and Leaping Bunny certified.",
  },
  {
    icon: "FlaskConical",
    title: "Dermat Tested",
    description: "Clinically tested by certified dermatologists for every skin type.",
  },
  {
    icon: "Award",
    title: "GMP Certified",
    description:
      "Manufactured in a WHO-GMP certified facility adhering to the highest safety standards.",
  },
];

/* Decorative Sanskrit-style ornament divider */
function OrnamentDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-4 w-28 ${className}`}
      aria-hidden="true"
    >
      <path d="M0 8h40 M80 8h40" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
      <path
        d="M48 8a8 8 0 1 1 24 0 8 8 0 0 1-24 0Z"
        stroke="currentColor"
        strokeWidth="0.75"
        fill="none"
      />
      <circle cx="60" cy="8" r="3" fill="currentColor" />
      <path
        d="M40 4l4 4-4 4 M80 4l-4 4 4 4"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* Corner flourish for card decoration */
function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-8 w-8 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M2 38 C2 20 20 2 38 2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M8 38 C8 24 24 8 38 8"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <circle cx="6" cy="34" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

interface BrandValuesProps {
  values?: BrandValueItem[];
}

export function BrandValues({ values }: BrandValuesProps) {
  const items = values && values.length > 0 ? values : DEFAULT_VALUES;

  return (
    <section className="relative overflow-hidden py-20">
      {/* Subtle mandala-style background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="border-primary absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            backgroundImage:
              "repeating-conic-gradient(from 0deg, transparent 0deg 10deg, var(--color-primary) 10deg 10.5deg)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading with ornamental dividers */}
        <div className="mb-14 flex flex-col items-center gap-3">
          <OrnamentDivider className="text-accent" />
          <h2 className="font-heading text-primary text-center text-3xl font-bold tracking-wide sm:text-4xl">
            Rooted in Tradition
          </h2>
          <p className="text-muted-foreground max-w-lg text-center text-base leading-relaxed">
            Ancient wisdom meets modern science — pure, potent, and crafted with reverence.
          </p>
          <OrnamentDivider className="text-accent" />
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon, title, description }) => {
            const Icon = ICON_MAP[icon] ?? Leaf;
            return (
              <div
                key={title}
                className="group border-accent/40 hover:shadow-accent/10 relative flex flex-col items-center gap-5 rounded-xl border-2 bg-card px-6 py-10 text-center shadow-sm transition-shadow duration-300 hover:shadow-lg"
              >
                {/* Corner flourishes */}
                <CornerFlourish className="text-accent/30 absolute top-2 left-2" />
                <CornerFlourish className="text-accent/30 absolute right-2 bottom-2 rotate-180" />

                {/* Icon with double-ring ayurvedic motif */}
                <div className="relative flex h-[72px] w-[72px] items-center justify-center">
                  <span className="border-accent/50 absolute inset-0 rounded-full border-2 border-dashed" />
                  <span className="border-primary/20 absolute inset-1.5 rounded-full border" />
                  <span className="bg-primary/10 absolute inset-3 rounded-full" />
                  <Icon className="text-primary relative z-10 h-7 w-7" />
                </div>

                {/* Small leaf ornament between icon and title */}
                <span className="text-accent text-lg leading-none" aria-hidden="true">
                  ✦
                </span>

                <h3 className="font-heading text-primary text-xl font-bold tracking-wide">
                  {title}
                </h3>
                <p className="text-foreground/70 text-sm leading-relaxed">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
