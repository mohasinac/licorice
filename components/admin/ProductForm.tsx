"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { VariantManager } from "@/components/admin/VariantManager";
import { CATEGORIES, CONCERNS } from "@/constants/categories";
import type { Product } from "@/lib/types";

const variantSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Label required"),
  price: z.number().min(1, "Price required"),
  compareAtPrice: z.number().optional(),
  sku: z.string().min(1, "SKU required"),
  stock: z.number().min(0),
  reservedStock: z.number().min(0),
  weight: z.number().min(1, "Weight required (grams)"),
  isDefault: z.boolean(),
  dimensions: z.object({ l: z.number(), b: z.number(), h: z.number() }).optional(),
});

const schema = z.object({
  name: z.string().min(2, "Name required"),
  tagline: z.string().optional(),
  shortDescription: z.string().min(10, "Short description required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category required"),
  concerns: z.array(z.string()),
  certifications: z.array(z.string()),
  benefits: z.array(z.object({ value: z.string().min(1) })),
  howToUse: z.array(z.object({ value: z.string().min(1) })),
  tags: z.string().optional(),
  variants: z.array(variantSchema).min(1, "At least one variant required"),
  isFeatured: z.boolean(),
  isCombo: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number(),
});

type FormData = z.infer<typeof schema>;

interface ProductFormProps {
  product?: Partial<Product>;
  onSave?: (data: FormData) => Promise<void>;
  mode?: "create" | "edit";
}

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.slug, label: c.label }));
const CERT_OPTIONS = [
  { id: "cruelty-free", label: "Cruelty Free" },
  { id: "vegan", label: "Vegan" },
  { id: "no-parabens", label: "No Parabens" },
  { id: "ayurvedic", label: "Ayurvedic" },
  { id: "no-sulfates", label: "No Sulfates" },
  { id: "dermatologist-tested", label: "Dermatologist Tested" },
];

export function ProductForm({ product, onSave, mode = "create" }: ProductFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      name: product?.name ?? "",
      tagline: product?.tagline ?? "",
      shortDescription: product?.shortDescription ?? "",
      description: product?.description ?? "",
      category: product?.category ?? "",
      concerns: product?.concerns ?? [],
      certifications: product?.certifications ?? [],
      benefits: (product?.benefits ?? [""]).map((v: string) => ({ value: v })),
      howToUse: (product?.howToUse ?? [""]).map((v: string) => ({ value: v })),
      tags: product?.tags?.join(", ") ?? "",
      variants: product?.variants?.map((v) => ({
          id: v.id,
          label: v.label,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          sku: v.sku,
          stock: v.stock,
          reservedStock: v.reservedStock ?? 0,
          weight: v.weight ?? 100,
          isDefault: v.isDefault ?? false,
          dimensions: v.dimensions,
        })) ?? [
        {
          id: `var_${Date.now()}`,
          label: "",
          price: 0,
          sku: "",
          stock: 50,
          reservedStock: 0,
          weight: 100,
          isDefault: true,
        },
      ],
      isFeatured: product?.isFeatured ?? false,
      isCombo: product?.isCombo ?? false,
      isActive: product?.isActive ?? true,
      sortOrder: product?.sortOrder ?? 0,
    },
  });

  const benefits = useFieldArray({ control, name: "benefits" });
  const howToUse = useFieldArray({ control, name: "howToUse" });

  async function onSubmit(data: FormData) {
    try {
      await onSave?.(data);
      toast.success(mode === "create" ? "Product created!" : "Product updated!");
    } catch {
      toast.error("Failed to save product.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 pb-12">
      {/* Basic Info */}
      <section className="border-border rounded-2xl border p-6">
        <h2 className="font-heading text-foreground mb-4 text-xl font-semibold">Basic Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Product Name" error={errors.name?.message} {...register("name")} />
          </div>
          <div className="sm:col-span-2">
            <Input label="Tagline" placeholder="One-line benefit hook" {...register("tagline")} />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Short Description"
              rows={2}
              error={errors.shortDescription?.message}
              {...register("shortDescription")}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Full Description (HTML)"
              rows={6}
              placeholder="<p>Full product description…</p>"
              {...register("description")}
            />
          </div>
        </div>
      </section>

      {/* Taxonomy */}
      <section className="border-border rounded-2xl border p-6">
        <h2 className="font-heading text-foreground mb-4 text-xl font-semibold">
          Category & Concerns
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                options={CATEGORY_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                label="Category"
                error={errors.category?.message}
              />
            )}
          />
          <Input label="Tags (comma separated)" {...register("tags")} />
          <div className="sm:col-span-2">
            <p className="text-foreground mb-2 text-sm font-medium">Skin Concerns</p>
            <div className="flex flex-wrap gap-2">
              {CONCERNS.map((con) => (
                <label
                  key={con.id}
                  className="border-border flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                >
                  <input type="checkbox" value={con.slug} {...register("concerns")} />
                  {con.label}
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-foreground mb-2 text-sm font-medium">Certifications</p>
            <div className="flex flex-wrap gap-2">
              {CERT_OPTIONS.map((cert) => (
                <label
                  key={cert.id}
                  className="border-border flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                >
                  <input type="checkbox" value={cert.id} {...register("certifications")} />
                  {cert.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Variants */}
      <section className="border-border rounded-2xl border p-6">
        <h2 className="font-heading text-foreground mb-4 text-xl font-semibold">Variants</h2>
        <Controller
          control={control}
          name="variants"
          render={({ field }) => (
            <VariantManager variants={field.value} onChange={field.onChange} />
          )}
        />
        {errors.variants && (
          <p className="text-destructive mt-2 text-xs">{errors.variants.message}</p>
        )}
      </section>

      {/* Benefits */}
      <section className="border-border rounded-2xl border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-foreground text-xl font-semibold">Benefits</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => benefits.append({ value: "" })}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {benefits.fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                className="border-border focus:border-primary flex-1 rounded-lg border px-4 py-2 text-sm focus:outline-none"
                placeholder={`Benefit ${i + 1}`}
                {...register(`benefits.${i}.value`)}
              />
              <button
                type="button"
                onClick={() => benefits.remove(i)}
                className="text-muted-foreground hover:text-destructive p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* How to Use */}
      <section className="border-border rounded-2xl border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-foreground text-xl font-semibold">How to Use</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => howToUse.append({ value: "" })}
          >
            <Plus className="h-4 w-4" /> Add Step
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {howToUse.fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-2">
              <span className="text-muted-foreground w-5 flex-shrink-0 text-sm">{i + 1}.</span>
              <input
                className="border-border focus:border-primary flex-1 rounded-lg border px-4 py-2 text-sm focus:outline-none"
                placeholder={`Step ${i + 1}`}
                {...register(`howToUse.${i}.value`)}
              />
              <button
                type="button"
                onClick={() => howToUse.remove(i)}
                className="text-muted-foreground hover:text-destructive p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Publishing */}
      <section className="border-border rounded-2xl border p-6">
        <h2 className="font-heading text-foreground mb-4 text-xl font-semibold">Publishing</h2>
        <div className="flex flex-wrap gap-6">
          {[
            { name: "isActive" as const, label: "Active (visible in store)" },
            { name: "isFeatured" as const, label: "Featured product" },
            { name: "isCombo" as const, label: "Is a combo pack" },
          ].map(({ name, label }) => (
            <label key={name} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="accent-primary h-4 w-4" {...register(name)} />
              <span className="text-foreground text-sm">{label}</span>
            </label>
          ))}
          <div className="w-32">
            <Input
              label="Sort Order"
              type="number"
              {...register("sortOrder", { valueAsNumber: true })}
            />
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" size="lg" loading={isSubmitting}>
          {mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
