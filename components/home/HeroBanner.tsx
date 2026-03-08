"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Leaf, Rabbit, FlaskConical, Award } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { BotanicalOrnaments } from "./BotanicalOrnaments";
import type { HeroBannerConfig } from "@/lib/types";

interface HeroBannerProps {
  config?: HeroBannerConfig;
}

export function HeroBanner({ config }: HeroBannerProps) {
  const t = useTranslations("home");

  const TRUST_BADGES = [
    { icon: Leaf, label: t("trustNatural") },
    { icon: Rabbit, label: t("trustCrueltyFree") },
    { icon: FlaskConical, label: t("trustDermatTested") },
    { icon: Award, label: t("trustGMPCertified") },
  ] as const;

  const headline = config?.headline ?? t("heroTitle");
  const subheadline =
    config?.subheadline ??
    t("heroSub");
  const primaryCtaText = config?.primaryCtaText ?? t("heroCta1");
  const primaryCtaHref = config?.primaryCtaHref ?? "/shop";
  const secondaryCtaText = config?.secondaryCtaText ?? t("heroCta2");
  const secondaryCtaHref = config?.secondaryCtaHref ?? "/consultation";

  return (
    <section className="from-primary via-primary/90 to-secondary relative flex min-h-[85vh] items-center overflow-hidden bg-gradient-to-br">
      {/* Mandala pattern — large subtle ring */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[700px] w-[700px] animate-[spin_120s_linear_infinite] rounded-full border border-white/[0.04]" />
      </div>
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[500px] w-[500px] animate-[spin_90s_linear_infinite_reverse] rounded-full border border-dashed border-white/[0.06]" />
      </div>

      {/* Butterflies & leaves on the dashed ring */}
      <BotanicalOrnaments radius={250} />

      {/* Floating botanical dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="bg-accent/20 pointer-events-none absolute rounded-full"
          style={{
            width: 4 + (i % 3) * 4,
            height: 4 + (i % 3) * 4,
            top: `${15 + i * 13}%`,
            left: `${8 + i * 15}%`,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Corner flourish SVGs */}
      <svg
        className="pointer-events-none absolute top-8 left-8 h-24 w-24 text-white/[0.06]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path d="M0 100 C0 45 45 0 100 0" stroke="currentColor" strokeWidth="1" />
        <path d="M0 70 C0 32 32 0 70 0" stroke="currentColor" strokeWidth="0.5" />
      </svg>
      <svg
        className="pointer-events-none absolute right-8 bottom-8 h-24 w-24 rotate-180 text-white/[0.06]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path d="M0 100 C0 45 45 0 100 0" stroke="currentColor" strokeWidth="1" />
        <path d="M0 70 C0 32 32 0 70 0" stroke="currentColor" strokeWidth="0.5" />
      </svg>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-28 text-center sm:px-6 lg:px-8">
        {/* Pill badge */}
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="border-accent/30 bg-accent/10 text-accent inline-flex items-center gap-2 rounded-full border px-5 py-1.5 text-xs font-medium tracking-[0.2em] uppercase backdrop-blur-sm"
        >
          <span className="bg-accent inline-block h-1.5 w-1.5 rounded-full" />
          {t("ancientWisdom")}
          <span className="bg-accent inline-block h-1.5 w-1.5 rounded-full" />
        </motion.span>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {headline.includes("\n")
            ? headline.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {i === 1 ? (
                    <span className="from-accent to-accent/70 bg-gradient-to-r bg-clip-text text-transparent">
                      {line}
                    </span>
                  ) : (
                    line
                  )}
                </span>
              ))
            : headline}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg"
        >
          {subheadline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <Link href={primaryCtaHref}>
            <Button
              size="lg"
              variant="secondary"
              className="px-8 text-base shadow-lg shadow-white/10"
            >
              {primaryCtaText}
            </Button>
          </Link>
          <Link href={secondaryCtaHref}>
            <Button
              size="lg"
              variant="outline"
              className="border-accent/40 text-accent hover:bg-accent/10 hover:text-accent px-8 text-base"
            >
              {secondaryCtaText}
            </Button>
          </Link>
        </motion.div>

        {/* Trust badges — pill style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-4"
        >
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/60 backdrop-blur-sm"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="from-background pointer-events-none absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t" />
    </section>
  );
}
