import * as React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BRAND_NAME } from "@/constants/site";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: `About Us — ${BRAND_NAME}`,
  description:
    "Learn the story behind Licorice Herbals — our mission, our values, and our passion for pure Ayurvedic wellness.",
};

export default async function AboutPage() {
  const t = await getTranslations("about");
  return (
    <div className="bg-background">
      {/* Hero */}
      <div className="ayur-hero py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-accent mb-3 text-sm font-semibold tracking-widest uppercase">
            {t("title")}
          </p>
          <h1 className="font-heading text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            {t("subtitle")}
          </h1>
          <p className="text-muted-foreground mt-5 text-xl leading-relaxed">
            {BRAND_NAME} was founded with a single purpose — to bring the healing wisdom of Ayurveda
            into your daily ritual, without compromise.
          </p>
          <hr className="ayur-divider mt-8 w-32" />
        </div>
      </div>

      {/* Mission */}
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading title={t("ourMission")} className="mb-4" />
            <p className="text-muted-foreground leading-relaxed">
              We believe that nature already has the answers. Our products are formulated using
              traditional Ayurvedic recipes — time-tested over centuries — combined with modern
              quality standards to deliver results you can trust.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Every ingredient we use is selected for its proven benefit. No fillers. No artificial
              fragrances. No compromises.
            </p>
          </div>
          <div>
            <SectionHeading title={t("ourPromise")} className="mb-4" />
            <ul className="flex flex-col gap-3">
              {[
                "100% natural, Ayurvedic formulations",
                "Cruelty-free — never tested on animals",
                "No parabens, sulphates, or harmful chemicals",
                "Made with ethically sourced\u00a0herbs",
                "Dermatologist reviewed formulations",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Values */}
        <div className="mt-20">
          <SectionHeading title={t("whatWeStandFor")} align="center" className="mb-10" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Ayurvedic Authenticity",
                desc: "Every formula traces its roots to classical Ayurvedic texts, adapted for modern efficacy.",
              },
              {
                title: "Transparency",
                desc: "We list every ingredient — nothing hidden. You always know what you put on your skin.",
              },
              {
                title: "Sustainability",
                desc: "Minimal packaging, eco-conscious sourcing, and a commitment to reducing our environmental footprint.",
              },
              {
                title: "Inclusivity",
                desc: "Formulated for all skin types and tones. Ayurveda has always been for everyone.",
              },
              {
                title: "Quality First",
                desc: "GMP-certified manufacturing processes and rigorous quality checks on every batch.",
              },
              {
                title: "Customer Care",
                desc: "Free consultations, transparent policies, and a support team that genuinely cares.",
              },
            ].map((card) => (
              <div key={card.title} className="ayur-card border-border rounded-2xl border bg-card p-6">
                <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">
                  {card.title}
                </h3>
                <p className="text-muted-foreground text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
