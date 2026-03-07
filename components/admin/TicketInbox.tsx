"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toSafeDate } from "@/lib/utils";
import type { SupportTicket, TicketStatus } from "@/lib/types";

const TABS: { key: TicketStatus | "all"; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "waiting_customer", label: "Waiting Customer" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

const CATEGORY_LABELS: Record<string, string> = {
  order: "Order Issue",
  shipping: "Shipping",
  product: "Product Query",
  return: "Return / Refund",
  payment: "Payment",
  consultation: "Consultation",
  other: "Other",
};

interface Props {
  tickets: SupportTicket[];
  locale?: string;
}

function msAgo(val: unknown): number {
  const date = toSafeDate(val);
  if (!date) return 0;
  return Date.now() - date.getTime();
}

function formatDate(val: unknown): string {
  const date = toSafeDate(val);
  if (!date) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketInbox({ tickets, locale = "en" }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TicketStatus | "all">("open");

  const filtered = activeTab === "all" ? tickets : tickets.filter((t) => t.status === activeTab);

  const tabCounts = Object.fromEntries(
    TABS.map(({ key }) => [key, tickets.filter((t) => t.status === key).length]),
  );

  return (
    <div>
      {/* Tabs */}
      <div className="border-border mb-5 flex gap-1 overflow-x-auto border-b">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === key
                ? "text-primary border-primary border-b-2"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            {tabCounts[key] > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  activeTab === key ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"
                }`}
              >
                {tabCounts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl py-16 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">No tickets in this category.</p>
        </div>
      ) : (
        <div className="divide-border divide-y overflow-hidden rounded-2xl shadow-sm">
          {filtered.map((ticket) => {
            const ageMs = msAgo(ticket.updatedAt ?? ticket.createdAt);
            const isOld = ageMs > 24 * 60 * 60 * 1000; // > 24 hours
            return (
              <div
                key={ticket.id}
                onClick={() => router.push(`/${locale}/admin/support/${ticket.id}`)}
                className={`bg-surface flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors hover:bg-gray-50 ${
                  isOld && (ticket.status === "open" || ticket.status === "in_progress")
                    ? "border-l-4 border-amber-400"
                    : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-green-700">
                      {ticket.ticketNumber}
                    </span>
                    <StatusBadge status={ticket.status} type="ticket" />
                    <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
                      {CATEGORY_LABELS[ticket.category] ?? ticket.category}
                    </span>
                    {isOld && (ticket.status === "open" || ticket.status === "in_progress") && (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" /> Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-foreground line-clamp-1 text-sm font-medium">
                    {ticket.subject}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {ticket.guestEmail ??
                      (ticket as unknown as { guestName?: string }).guestName ??
                      ticket.userId ??
                      "—"}
                  </p>
                </div>
                <div className="text-muted-foreground flex flex-shrink-0 items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {formatDate(ticket.updatedAt ?? ticket.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
