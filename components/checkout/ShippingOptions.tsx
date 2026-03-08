"use client";

import { Truck, Zap, Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_RATE,
  getShippingCharge,
} from "@/constants/policies";
import type { ShippingMode } from "@/stores/useCheckoutStore";

interface ShippingOptionsProps {
  subtotal: number;
  selected: ShippingMode;
  onChange: (mode: ShippingMode) => void;
  sameDayAvailable?: boolean;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export function ShippingOptions({
  subtotal,
  selected,
  onChange,
  sameDayAvailable = false,
}: ShippingOptionsProps) {
  const t = useTranslations("checkout");
  const SHIPPING_OPTIONS: {
    id: ShippingMode;
    label: string;
    sla: string;
    icon: React.ElementType;
    description: string;
    priceFn: (subtotal: number) => number;
    alwaysAvailable: boolean;
  }[] = [
    {
      id: "standard",
      label: t("standardDelivery"),
      sla: t("standardSla"),
      icon: Truck,
      description: t("standardDesc"),
      priceFn: (sub) => (sub >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_RATE),
      alwaysAvailable: true,
    },
    {
      id: "express",
      label: t("expressDelivery"),
      sla: t("expressSla"),
      icon: Zap,
      description: t("expressDesc"),
      priceFn: () => 149,
      alwaysAvailable: true,
    },
    {
      id: "same_day",
      label: t("sameDayDelivery"),
      sla: t("sameDaySla"),
      icon: Timer,
      description: t("sameDayDesc"),
      priceFn: () => 199,
      alwaysAvailable: false,
    },
  ];
  return (
    <div className="space-y-3">
      {SHIPPING_OPTIONS.map((option) => {
        const available = option.alwaysAvailable || (option.id === "same_day" && sameDayAvailable);
        const price = option.priceFn(subtotal);
        const isSelected = selected === option.id;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            disabled={!available}
            onClick={() => available && onChange(option.id)}
            className={[
              "w-full rounded-xl border p-4 text-left transition-all",
              isSelected
                ? "border-primary bg-primary/5 ring-primary ring-1"
                : available
                  ? "border-border hover:border-primary/50"
                  : "border-border cursor-not-allowed opacity-50",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Icon
                  className={[
                    "mt-0.5 h-5 w-5 flex-none",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  ].join(" ")}
                />
                <div>
                  <p
                    className={[
                      "text-sm font-medium",
                      isSelected ? "text-primary" : "text-foreground",
                    ].join(" ")}
                  >
                    {option.label}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {option.sla} · {option.description}
                  </p>
                </div>
              </div>
              <span
                className={[
                  "text-sm font-semibold",
                  price === 0 ? "text-green-600 dark:text-green-400" : "text-foreground",
                ].join(" ")}
              >
                {price === 0 ? t("freeLabel") : fmt(price)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// re-export for convenience so existing imports still work
export { getShippingCharge } from "@/constants/policies";
