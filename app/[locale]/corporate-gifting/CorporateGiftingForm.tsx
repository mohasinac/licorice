"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { CheckCircle2, Gift, Sparkles, Paintbrush, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { submitCorporateInquiry } from "@/lib/actions/submitCorporateInquiry";

const schemaBase = z.object({
  companyName: z.string().min(2),
  contactPerson: z.string().min(2),
  designation: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  units: z.coerce.number().int().min(1),
  budgetPerUnit: z.coerce.number().min(0).optional(),
  totalBudget: z.coerce.number().min(0).optional(),
  deliveryDateRequired: z.string().optional(),
  customBranding: z.enum(["yes", "no"]),
  message: z.string().max(2000).optional(),
});

type FormData = z.output<typeof schemaBase>;

export function CorporateGiftingForm() {
  const [success, setSuccess] = useState(false);
  const t = useTranslations("corporateGifting");

  const schema = z.object({
    companyName: z.string().min(2, t("validCompanyName")),
    contactPerson: z.string().min(2, t("validContactPerson")),
    designation: z.string().optional(),
    email: z.string().email(t("validEmail")),
    phone: z.string().min(10, t("validPhone")).max(15),
    units: z.coerce.number().int().min(1, t("validUnits")),
    budgetPerUnit: z.coerce.number().min(0).optional(),
    totalBudget: z.coerce.number().min(0).optional(),
    deliveryDateRequired: z.string().optional(),
    customBranding: z.enum(["yes", "no"]),
    message: z.string().max(2000).optional(),
  });

  const VALUE_PROPS = [
    {
      icon: Sparkles,
      title: t("valuePropPremiumTitle"),
      desc: t("valuePropPremiumDesc"),
      color: "bg-purple-100 text-purple-700",
    },
    {
      icon: Paintbrush,
      title: t("valuePropBrandingTitle"),
      desc: t("valuePropBrandingDesc"),
      color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      icon: Gift,
      title: t("valuePropGiftTitle"),
      desc: t("valuePropGiftDesc"),
      color: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
    },
    {
      icon: BadgePercent,
      title: t("valuePropVolumeTitle"),
      desc: t("valuePropVolumeDesc"),
      color: "bg-blue-100 text-blue-700",
    },
  ];

    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schemaBase>, unknown, FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const result = await submitCorporateInquiry({
      ...data,
      customBranding: data.customBranding === "yes",
    });
    if (result.success) {
      setSuccess(true);
      toast.success(t("inquirySuccessToast"));
    } else {
      toast.error(result.error);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="font-heading text-foreground text-2xl font-bold">{t("inquiryReceived")}</h2>
        <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
          {t("thankYou")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      {/* Value props */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 lg:gap-4">
        {VALUE_PROPS.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="flex items-start gap-4">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">{title}</p>
              <p className="text-muted-foreground mt-0.5 text-sm">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Inquiry form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("companyName")}
            placeholder="Acme Corp"
            error={errors.companyName?.message}
            {...register("companyName")}
          />
          <Input
            label={t("contactPerson")}
            placeholder="Rahul Mehta"
            error={errors.contactPerson?.message}
            {...register("contactPerson")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t("designation")} placeholder="HR Manager" {...register("designation")} />
          <Input
            label={t("phone")}
            type="tel"
            placeholder="+91 98765 43210"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
        <Input
          label={t("businessEmail")}
          type="email"
          placeholder="rahul@acmecorp.in"
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("units")}
            type="number"
            min={1}
            placeholder="100"
            error={errors.units?.message}
            {...register("units")}
          />
          <Input
            label={t("budgetPerUnit")}
            type="number"
            min={0}
            placeholder="500"
            {...register("budgetPerUnit")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("totalBudget")}
            type="number"
            min={0}
            placeholder="50000"
            {...register("totalBudget")}
          />
          <Input label={t("deliveryDate")} type="date" {...register("deliveryDateRequired")} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            {t("customBrandingRequired")}
          </label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" value="yes" {...register("customBranding")} />
              {t("yes")}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" value="no" {...register("customBranding")} defaultChecked />
              {t("no")}
            </label>
          </div>
        </div>
        <Textarea
          label={t("preferencesMessage")}
          placeholder="Which products are you interested in? Any specific requirements or questions?"
          rows={4}
          {...register("message")}
        />
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          {t("requestQuote")}
        </Button>
      </form>
    </div>
  );
}
