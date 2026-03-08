import type { BrandStoryConfig } from "@/lib/types";

interface BrandStoryProps {
  config: BrandStoryConfig;
}

export function BrandStory({ config }: BrandStoryProps) {
  return (
    <section className="relative overflow-hidden py-24">
      {/* Background */}
      <div className="from-primary/[0.03] to-accent/[0.05] pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent" />

      {/* Decorative circles */}
      <div className="border-primary/[0.06] pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full border" />
      <div className="border-accent/[0.1] pointer-events-none absolute -right-24 -bottom-24 h-48 w-48 rounded-full border border-dashed" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* Ornamental tag */}
        <span className="border-accent/30 bg-accent/5 text-accent mb-6 inline-flex rounded-full border px-4 py-1 text-xs tracking-[0.2em] uppercase">
          {config.tag}
        </span>

        <h2 className="font-heading text-primary mb-6 text-3xl leading-tight font-bold tracking-tight sm:text-4xl md:text-5xl">
          {config.headline}
        </h2>

        <p className="text-foreground/70 mx-auto max-w-2xl text-base leading-relaxed sm:text-lg">
          {config.body}
        </p>

        {/* Decorative ornament */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="bg-accent/40 h-px w-16 rounded-full" />
          <svg viewBox="0 0 24 24" className="text-accent h-5 w-5" fill="none" aria-hidden="true">
            <path
              d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Z"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M12 6c-1.7 0-3 2.7-3 6s1.3 6 3 6 3-2.7 3-6-1.3-6-3-6Z"
              stroke="currentColor"
              strokeWidth="0.75"
            />
            <path d="M6 12h12" stroke="currentColor" strokeWidth="0.75" />
          </svg>
          <span className="bg-accent/40 h-px w-16 rounded-full" />
        </div>
      </div>
    </section>
  );
}
