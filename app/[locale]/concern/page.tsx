import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CONCERNS } from "@/constants/categories";
import { BRAND_NAME } from "@/constants/site";

export const metadata: Metadata = {
  title: `Shop by Concern — ${BRAND_NAME}`,
  description:
    "Find the right Ayurvedic solution for your skin or hair concern — acne, pigmentation, hair fall, anti-ageing, and more.",
};

export default async function ConcernsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <div className="ayur-hero">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-accent mb-3 text-sm font-semibold tracking-widest uppercase">
            Targeted Solutions
          </p>
          <h1 className="font-heading text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Shop by Concern
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-lg leading-relaxed">
            Every skin and hair concern has an Ayurvedic answer. Find yours below.
          </p>
          <hr className="ayur-divider mt-8 w-32" />
        </div>
      </div>

      {/* Concern cards */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CONCERNS.map((concern) => (
            <Link
              key={concern.id}
              href={`/${locale}/concern/${concern.slug}`}
              className="ayur-card border-border group rounded-2xl border bg-white p-6 transition-all"
            >
              <h3 className="font-heading text-foreground group-hover:text-primary text-lg font-semibold transition-colors">
                {concern.label}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {concern.description}
              </p>
              <span className="text-primary mt-4 inline-block text-sm font-medium">
                Browse products →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
