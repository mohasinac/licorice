"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import type { HeroBannerConfig } from "@/lib/types";

interface HeroBannerProps {
  config?: HeroBannerConfig;
}

export function HeroBanner({ config }: HeroBannerProps) {
  const locale = useLocale();

  const headline = config?.headline ?? "Rediscover the Power\nof Ayurveda";
  const subheadline =
    config?.subheadline ??
    "Licorice Herbals blends time-honoured botanical extracts with precision formulation for skin and hair that truly thrives.";
  const primaryCtaText = config?.primaryCtaText ?? "Explore Products";
  const primaryCtaHref = config?.primaryCtaHref ?? "/shop";
  const secondaryCtaText = config?.secondaryCtaText ?? "Our Story";
  const secondaryCtaHref = config?.secondaryCtaHref ?? "/about";

  return (
    <section className="from-primary to-primary/80 relative flex min-h-[80vh] items-center overflow-hidden bg-gradient-to-br">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-48 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-white/[0.03]" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-24 text-center sm:px-6 lg:px-8">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border-accent/40 bg-accent/10 text-accent inline-flex rounded-full border px-4 py-1 text-xs font-medium tracking-widest uppercase"
        >
          Ancient Wisdom · Modern Care
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {headline.includes("\n")
            ? headline.split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))
            : headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl text-base text-white/70 sm:text-lg"
        >
          {subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Link href={`/${locale}${primaryCtaHref}`}>
            <Button size="lg" variant="secondary">
              {primaryCtaText}
            </Button>
          </Link>
          <Link href={`/${locale}${secondaryCtaHref}`}>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 hover:text-white"
            >
              {secondaryCtaText}
            </Button>
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/50"
        >
          {["100% Natural", "Cruelty Free", "Dermat Tested", "GMP Certified"].map((badge) => (
            <span key={badge} className="flex items-center gap-1.5">
              <span className="bg-accent h-1 w-1 rounded-full" />
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
