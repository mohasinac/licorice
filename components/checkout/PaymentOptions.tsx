"use client";

import { Smartphone, Banknote, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PaymentMethod } from "@/lib/types";
import type { PaymentSettings } from "@/lib/types";
import { COD_FEE } from "@/constants/policies";

interface PaymentOptionsProps {
  settings: PaymentSettings;
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export function PaymentOptions({ settings, selected, onChange }: PaymentOptionsProps) {
  const t = useTranslations("checkout");
  const OPTIONS: {
    id: PaymentMethod;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    settingKey: "whatsappEnabled" | "codEnabled" | "razorpayEnabled";
  }[] = [
    {
      id: "whatsapp",
      label: t("payWhatsApp"),
      sublabel: t("payWhatsAppDesc"),
      icon: Smartphone,
      settingKey: "whatsappEnabled",
    },
    {
      id: "cod",
      label: t("payCOD"),
      sublabel: `+${fmt(COD_FEE)} ${t("codFeeLabel")}`,
      icon: Banknote,
      settingKey: "codEnabled",
    },
    {
      id: "razorpay",
      label: t("payRazorpay"),
      sublabel: t("payOnlineDesc"),
      icon: CreditCard,
      settingKey: "razorpayEnabled",
    },
  ];
  const available = OPTIONS.filter((o) => settings[o.settingKey] === true);

  return (
    <div className="space-y-3">
      {available.map((option) => {
        const isSelected = selected === option.id;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={[
              "w-full rounded-xl border p-4 text-left transition-all",
              isSelected
                ? "border-primary bg-primary/5 ring-primary ring-1"
                : "border-border hover:border-primary/50",
            ].join(" ")}
          >
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
                <p className="text-muted-foreground text-xs">{option.sublabel}</p>
              </div>
            </div>
          </button>
        );
      })}

      {available.length === 0 && (
        <p className="text-muted-foreground text-sm">
          {t("noPaymentMethods")}
        </p>
      )}
    </div>
  );
}
