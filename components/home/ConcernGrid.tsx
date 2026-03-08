import Link from "next/link";
import type { Concern, Locale } from "@/lib/types";

const CONCERN_ICONS: Record<string, string> = {
  "pimples-open-pores": "🧴",
  "pigmentation-melasma": "✨",
  brightening: "🌟",
  "anti-ageing": "🕐",
  tanning: "☀️",
  dryness: "💧",
  "hair-care": "💆",
  "blemishes-dark-spots": "🎯",
};

interface ConcernGridProps {
  concerns: Concern[];
  locale: Locale;
}

export function ConcernGrid({ concerns, locale }: ConcernGridProps) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-14 flex flex-col items-center gap-3 text-center">
          <span className="border-accent/30 text-accent inline-flex rounded-full border px-3 py-1 text-xs tracking-widest uppercase">
            Targeted Solutions
          </span>
          <h2 className="font-heading text-primary text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Say Goodbye
          </h2>
          <h2 className="font-heading from-secondary to-primary bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl md:text-5xl">
            to Imperfections
          </h2>
          <div className="flex items-center gap-2">
            <span className="bg-accent h-0.5 w-8 rounded-full" />
            <span className="text-accent text-xs">✦</span>
            <span className="bg-accent h-0.5 w-8 rounded-full" />
          </div>
        </div>

        {/* Concern cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {concerns.map((concern) => (
            <Link
              key={concern.id}
              href={`/${locale}/concern/${concern.slug}`}
              className="ayur-card group hover:border-primary/10 relative overflow-hidden rounded-2xl border border-transparent bg-white p-6"
            >
              {/* Background gradient on hover */}
              <div className="from-primary/5 to-secondary/5 pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative flex flex-col gap-4">
                <span className="text-3xl">{CONCERN_ICONS[concern.slug] ?? "🌿"}</span>

                <div>
                  <h3 className="text-foreground group-hover:text-primary text-sm font-bold tracking-wide transition-colors">
                    {concern.label}
                  </h3>
                  <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs leading-relaxed">
                    {concern.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <span className="text-primary flex items-center gap-1 text-xs font-medium opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                  View products →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
