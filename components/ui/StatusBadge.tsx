import * as React from "react";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

type StatusVariant = "green" | "amber" | "red" | "purple" | "blue" | "gray";

const ORDER_STATUS_VARIANTS: Record<OrderStatus, StatusVariant> = {
  draft: "gray",
  pending: "amber",
  confirmed: "blue",
  processing: "blue",
  ready_to_ship: "purple",
  shipped: "purple",
  out_for_delivery: "purple",
  delivered: "green",
  cancelled: "red",
  return_requested: "amber",
  return_picked_up: "amber",
  refunded: "gray",
};

const PAYMENT_STATUS_VARIANTS: Record<PaymentStatus, StatusVariant> = {
  pending_whatsapp: "amber",
  proof_submitted: "amber",
  pending: "amber",
  paid: "green",
  failed: "red",
  refunded: "gray",
  partially_refunded: "gray",
};

const REVIEW_STATUS_VARIANTS: Record<string, StatusVariant> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
};

const variantClasses: Record<StatusVariant, string> = {
  green: "bg-green-100 text-green-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  purple: "bg-purple-100 text-purple-800",
  blue: "bg-blue-100 text-blue-800",
  gray: "bg-gray-100 text-gray-600",
};

interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment" | "review" | "ticket";
  className?: string;
}

function getVariant(status: string, type: StatusBadgeProps["type"]): StatusVariant {
  if (type === "order") return ORDER_STATUS_VARIANTS[status as OrderStatus] ?? "gray";
  if (type === "payment") return PAYMENT_STATUS_VARIANTS[status as PaymentStatus] ?? "gray";
  if (type === "review") return REVIEW_STATUS_VARIANTS[status] ?? "gray";
  return "gray";
}

function formatLabel(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function StatusBadge({ status, type = "order", className = "" }: StatusBadgeProps) {
  const variant = getVariant(status, type);
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {formatLabel(status)}
    </span>
  );
}
