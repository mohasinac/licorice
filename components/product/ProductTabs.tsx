"use client";

import * as React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedValue } from "@/lib/i18n";
import type { Product, Locale } from "@/lib/types";

interface ProductTabsProps {
  product: Product;
}

type TabId = "benefits" | "ingredients" | "how-to-use" | "faqs";

export function ProductTabs({ product }: ProductTabsProps) {
  const t = useTranslations("product");
  const [active, setActive] = React.useState<TabId>("benefits");
  const locale = useLocale() as Locale;

  const TABS: { id: TabId; label: string }[] = [
    { id: "benefits", label: t("tabBenefits") },
    { id: "ingredients", label: t("tabIngredients") },
    { id: "how-to-use", label: t("tabHowToUse") },
    { id: "faqs", label: t("tabFAQs") },
  ];

  return (
    <div>
      {/* Tab strip */}
      <div className="border-border border-b">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={[
                "px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                active === tab.id
                  ? "border-primary text-primary border-b-2"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="py-6">
        {active === "benefits" && (
          <ul className="flex flex-col gap-3">
            {product.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" />
                <span className="text-foreground">{getLocalizedValue(benefit, locale)}</span>
              </li>
            ))}
          </ul>
        )}

        {active === "ingredients" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {product.ingredients.map((ing, i) => (
              <div key={i} className="border-border rounded-xl border p-4">
                <p className="text-foreground font-semibold">
                  {getLocalizedValue(ing.name, locale)}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {getLocalizedValue(ing.benefit, locale)}
                </p>
              </div>
            ))}
          </div>
        )}

        {active === "how-to-use" && (
          <ol className="flex flex-col gap-4">
            {product.howToUse.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="bg-primary flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-foreground pt-0.5">{getLocalizedValue(step, locale)}</span>
              </li>
            ))}
          </ol>
        )}

        {active === "faqs" && (
          <Accordion.Root type="single" collapsible className="flex flex-col gap-2">
            {product.faqs.map((faq, i) => (
              <Accordion.Item
                key={i}
                value={`faq-${i}`}
                className="border-border overflow-hidden rounded-xl border"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="hover:bg-muted flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold transition-colors [&[data-state=open]>svg]:rotate-180">
                    <span>{getLocalizedValue(faq.question, locale)}</span>
                    <ChevronDown className="text-muted-foreground h-4 w-4 flex-shrink-0 transition-transform" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                  <p className="text-muted-foreground px-5 pb-4 text-sm leading-relaxed">
                    {getLocalizedValue(faq.answer, locale)}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        )}
      </div>
    </div>
  );
}
