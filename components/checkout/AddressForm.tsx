"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

const addressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  line1: z.string().min(5, "Address must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter a valid city"),
  state: z.string().min(1, "Select a state"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  country: z.string().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

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
  submitLabel = "Save Address",
  loading = false,
  onCancel,
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
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
        <Input label="Full Name" error={errors.name?.message} {...register("name")} />
        <Input
          label="Mobile Number"
          placeholder="10-digit number"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      <Input
        label="Address Line 1"
        placeholder="House/flat no, street name"
        error={errors.line1?.message}
        {...register("line1")}
      />
      <Input
        label="Address Line 2 (Optional)"
        placeholder="Landmark, area"
        error={errors.line2?.message}
        {...register("line2")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input label="City" error={errors.city?.message} {...register("city")} />

        <div className="flex flex-col gap-1">
          <label className="text-foreground text-sm font-medium">State</label>
          <Select
            options={stateOptions}
            value={stateValue}
            onValueChange={(v) => setValue("state", v)}
            placeholder="Select state"
          />
          {errors.state && <p className="text-destructive text-xs">{errors.state.message}</p>}
        </div>

        <Input
          label="Pincode"
          placeholder="6 digits"
          error={errors.pincode?.message}
          {...register("pincode")}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
