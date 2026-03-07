"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { StockMovementType } from "@/lib/types";

const schema = z.object({
  type: z.enum(["stock_in", "adjustment", "return"] as const),
  quantity: z.number().min(1, "Quantity must be ≥ 1"),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface StockAdjustModalProps {
  productId: string;
  variantId: string;
  variantLabel: string;
  currentStock: number;
  open: boolean;
  onClose: () => void;
  onSubmit: (
    productId: string,
    variantId: string,
    delta: number,
    type: StockMovementType,
    note?: string,
  ) => Promise<void>;
}

const TYPE_LABELS: Record<"stock_in" | "adjustment" | "return", string> = {
  stock_in: "Stock In (add)",
  adjustment: "Adjustment (remove)",
  return: "Customer Return (add)",
};

export function StockAdjustModal({
  productId,
  variantId,
  variantLabel,
  currentStock,
  open,
  onClose,
  onSubmit,
}: StockAdjustModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "stock_in", quantity: 1 },
  });

  const type = watch("type");
  const qty = watch("quantity") || 0;
  const isRemoval = type === "adjustment";
  const projected = isRemoval ? Math.max(0, currentStock - qty) : currentStock + qty;

  async function onValid(data: FormData) {
    const delta = isRemoval ? -data.quantity : data.quantity;
    await onSubmit(productId, variantId, delta, data.type as StockMovementType, data.note);
    reset();
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="bg-background border-border fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-xl">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <Dialog.Title className="font-heading text-foreground text-xl font-semibold">
                Adjust Stock
              </Dialog.Title>
              <Dialog.Description className="text-muted-foreground mt-0.5 text-sm">
                {variantLabel} · Current: <strong>{currentStock}</strong>
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                Movement Type
              </label>
              <select
                className="border-border focus:border-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                {...register("type")}
              >
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Quantity"
              type="number"
              min={1}
              error={errors.quantity?.message}
              {...register("quantity", { valueAsNumber: true })}
            />
            <Textarea
              label="Note (optional)"
              rows={2}
              placeholder="Reason for adjustment…"
              {...register("note")}
            />

            <div className="bg-muted/50 rounded-xl px-4 py-3 text-sm">
              <span className="text-muted-foreground">Projected stock after: </span>
              <span className="text-foreground font-semibold">{projected}</span>
            </div>

            <div className="flex gap-3">
              <Button type="submit" loading={isSubmitting} className="flex-1">
                Confirm Adjustment
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
