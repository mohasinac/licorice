"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { CheckCircle2, Gift, Package, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { submitCorporateInquiry } from "@/lib/actions/submitCorporateInquiry";

const schema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactPerson: z.string().min(2, "Contact person required"),
  designation: z.string().optional(),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required").max(15),
  units: z.coerce.number().int().min(1, "At least 1 unit"),
  budgetPerUnit: z.coerce.number().min(0).optional(),
  totalBudget: z.coerce.number().min(0).optional(),
  deliveryDateRequired: z.string().optional(),
  customBranding: z.enum(["yes", "no"]),
  message: z.string().max(2000).optional(),
});

type FormData = z.output<typeof schema>;

const VALUE_PROPS = [
  {
    icon: Package,
    title: "Premium Ayurvedic Products",
    desc: "Gift authentic, certified Ayurvedic skincare and wellness products your team will love.",
    color: "bg-purple-100 text-purple-700",
  },
  {
    icon: Star,
    title: "Custom Branding",
    desc: "Add your company's logo and message on the packaging for a truly personal touch.",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: Gift,
    title: "Curated Gift Sets",
    desc: "We help you select the perfect product combination for your budget and occasion.",
    color: "bg-green-100 text-green-700",
  },
  {
    icon: Users,
    title: "Volume Discounts",
    desc: "Special pricing for orders of 50+ units. Dedicated account manager for large orders.",
    color: "bg-blue-100 text-blue-700",
  },
];

export function CorporateGiftingForm() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>, unknown, FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const result = await submitCorporateInquiry({
      ...data,
      customBranding: data.customBranding === "yes",
    });
    if (result.success) {
      setSuccess(true);
      toast.success("Inquiry received! Our team will be in touch soon.");
    } else {
      toast.error(result.error);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="mb-4 h-14 w-14 text-green-600" />
        <h2 className="font-heading text-foreground text-2xl font-bold">Inquiry Received!</h2>
        <p className="text-muted-foreground mt-3 max-w-md text-sm">
          Thank you for your interest in Licorice Herbals corporate gifting. Our team will reach out
          with a customised quote within 1–2 business days.
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
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${color}`}
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
            label="Company Name"
            placeholder="Acme Corp"
            error={errors.companyName?.message}
            {...register("companyName")}
          />
          <Input
            label="Contact Person"
            placeholder="Rahul Mehta"
            error={errors.contactPerson?.message}
            {...register("contactPerson")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Designation" placeholder="HR Manager" {...register("designation")} />
          <Input
            label="Phone"
            type="tel"
            placeholder="+91 98765 43210"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
        <Input
          label="Business Email"
          type="email"
          placeholder="rahul@acmecorp.in"
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Number of Units"
            type="number"
            min={1}
            placeholder="100"
            error={errors.units?.message}
            {...register("units")}
          />
          <Input
            label="Budget Per Unit (₹)"
            type="number"
            min={0}
            placeholder="500"
            {...register("budgetPerUnit")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Total Budget (₹)"
            type="number"
            min={0}
            placeholder="50000"
            {...register("totalBudget")}
          />
          <Input label="Required Delivery Date" type="date" {...register("deliveryDateRequired")} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Custom Branding Required?
          </label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" value="yes" {...register("customBranding")} />
              Yes
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" value="no" {...register("customBranding")} defaultChecked />
              No
            </label>
          </div>
        </div>
        <Textarea
          label="Product Preferences / Message"
          placeholder="Which products are you interested in? Any specific requirements or questions?"
          rows={4}
          {...register("message")}
        />
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Request Quote
        </Button>
      </form>
    </div>
  );
}
