"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Ticket } from "lucide-react";
import type { SupportTicket } from "@/lib/types";
import { toSafeDate } from "@/lib/utils";

interface Props {
  ticket: SupportTicket;
  locale?: string;
  unread?: boolean;
}

function formatRelativeDate(val: unknown, t: (k: string, v?: Record<string, string | number | Date>) => string): string {
  const date = toSafeDate(val);
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return t("justNow");
  if (hours < 24) return t("hoursAgo", { hours });
  const days = Math.floor(hours / 24);
  return t("daysAgo", { days });
}

export function TicketCard({ ticket, locale = "en", unread = false }: Props) {
  const t = useTranslations("support");

  const CATEGORY_LABELS: Record<string, string> = {
    order: t("catOrder"),
    shipping: t("catShipping"),
    product: t("catProduct"),
    return: t("catReturn"),
    payment: t("catPayment"),
    consultation: t("catConsultation"),
    other: t("catOther"),
  };
  return (
    <Link
      href={`/account/support/${ticket.id}`}
      className="bg-surface hover:border-primary/30 flex items-start gap-4 rounded-2xl border border-transparent p-5 shadow-sm transition-all hover:shadow-md"
    >
      <div className="bg-primary/10 mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl">
        <Ticket className="text-primary h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-green-700 dark:text-green-400">
            {ticket.ticketNumber}
          </span>
          <StatusBadge status={ticket.status} type="ticket" />
          <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
            {CATEGORY_LABELS[ticket.category] ?? ticket.category}
          </span>
          {unread && <span className="h-2 w-2 rounded-full bg-blue-500" aria-label="Unread" />}
        </div>
        <p className="text-foreground line-clamp-1 text-sm font-medium">{ticket.subject}</p>
        <p className="text-muted-foreground mt-0.5 text-xs" suppressHydrationWarning>
          {formatRelativeDate(ticket.updatedAt ?? ticket.createdAt, t)}
        </p>
      </div>
    </Link>
  );
}
