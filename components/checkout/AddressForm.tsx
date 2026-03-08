"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Address } from "@/lib/types";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const addressSchemaBase = z.object({
  name: z.string(),
  phone: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  country: z.string().optional(),
});

type AddressFormValues = z.infer<typeof addressSchemaBase>;

interface AddressFormProps {
  defaultValues?: Partial<Address>;
  onSubmit: (address: Address) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
  onCancel?: () => void;
}

export function AddressForm({
  defaultValues,
  onSubmit,
  submitLabel,
  loading = false,
  onCancel,
}: AddressFormProps) {
  const t = useTranslations("checkout");
  const schema = z.object({
    name: z.string().min(2, t("validName")),
    phone: z.string().regex(/^[6-9]\d{9}$/, t("validPhone")),
    line1: z.string().min(5, t("validLine1")),
    line2: z.string().optional(),
    city: z.string().min(2, t("validCity")),
    state: z.string().min(1, t("validState")),
    pincode: z.string().regex(/^\d{6}$/, t("validPincode")),
    country: z.string().optional(),
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      line1: defaultValues?.line1 ?? "",
      line2: defaultValues?.line2 ?? "",
      city: defaultValues?.city ?? "",
      state: defaultValues?.state ?? "",
      pincode: defaultValues?.pincode ?? "",
      country: "India",
    },
  });

  const stateValue = watch("state");

  async function handleFormSubmit(values: AddressFormValues) {
    await onSubmit({ ...values, country: "India" });
  }

  const stateOptions = INDIAN_STATES.map((s) => ({ value: s, label: s }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label={t("addrName")} error={errors.name?.message} {...register("name")} />
        <Input
          label={t("addrPhone")}
          placeholder={t("addrPhonePlaceholder")}
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      <Input
        label={t("addrLine1")}
        placeholder={t("addrLine1Placeholder")}
        error={errors.line1?.message}
        {...register("line1")}
      />
      <Input
        label={t("addrLine2")}
        placeholder={t("addrLine2Placeholder")}
        error={errors.line2?.message}
        {...register("line2")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input label={t("addrCity")} error={errors.city?.message} {...register("city")} />

        <div className="flex flex-col gap-1">
          <label className="text-foreground text-sm font-medium">{t("addrState")}</label>
          <Select
            options={stateOptions}
            value={stateValue}
            onValueChange={(v) => setValue("state", v)}
            placeholder={t("addrStatePlaceholder")}
          />
          {errors.state && <p className="text-destructive text-xs">{errors.state.message}</p>}
        </div>

        <Input
          label={t("addrPincode")}
          placeholder={t("addrPincodePlaceholder")}
          error={errors.pincode?.message}
          {...register("pincode")}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {submitLabel ?? t("saveAddress")}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("addrCancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
