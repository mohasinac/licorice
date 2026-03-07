"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Send, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { SupportTicket, TicketMessage, TicketStatus } from "@/lib/types";

const STATUS_OPTIONS: TicketStatus[] = [
  "open",
  "in_progress",
  "waiting_customer",
  "resolved",
  "closed",
];

function formatDateTime(val: unknown): string {
  let date: Date | null = null;
  if (val instanceof Date) date = val;
  else if (val && typeof (val as Record<string, unknown>).toDate === "function")
    date = (val as { toDate: () => Date }).toDate();
  if (!date) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  ticket: SupportTicket;
  messages: TicketMessage[];
}

export function AdminTicketActions({ ticket, messages }: Props) {
  const router = useRouter();
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [changingStatus, setChangingStatus] = useState(false);

  async function handleReply() {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyText.trim(),
          isInternalNote,
          status: isInternalNote ? status : "waiting_customer",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(isInternalNote ? "Internal note added." : "Reply sent.");
      setReplyText("");
      router.refresh();
    } catch {
      toast.error("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(newStatus: TicketStatus) {
    setChangingStatus(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticket.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus(newStatus);
      toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      router.refresh();
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setChangingStatus(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Thread */}
      <div className="flex flex-col gap-4">
        {messages.map((msg, idx) => {
          const isAdmin = msg.senderType === "admin";
          const isInternal = msg.isInternalNote === true;
          return (
            <div key={idx} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  isInternal
                    ? "border border-gray-300 bg-gray-50 text-gray-600"
                    : isAdmin
                      ? "bg-muted text-foreground"
                      : "bg-primary text-white"
                }`}
              >
                {isAdmin && (
                  <p className="text-muted-foreground mb-1 text-xs font-medium">
                    {isInternal && <Lock className="mr-1 inline h-3 w-3" />}
                    {isInternal
                      ? "Internal Note"
                      : ((msg as unknown as { senderName?: string }).senderName ?? "Support Team")}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{msg.body}</p>
                <p
                  className={`mt-1 text-xs ${isAdmin ? "text-muted-foreground" : "text-white/70"}`}
                >
                  {formatDateTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply form */}
      <div className="border-border rounded-2xl border p-4">
        <div className="mb-3 flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isInternalNote}
              onChange={(e) => setIsInternalNote(e.target.checked)}
            />
            <Lock className="h-3.5 w-3.5 text-gray-500" />
            Internal Note (not visible to customer)
          </label>
        </div>
        <Textarea
          label={isInternalNote ? "Internal Note" : "Reply to Customer"}
          placeholder={isInternalNote ? "Add a private note for your team…" : "Type your reply…"}
          rows={4}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          disabled={sending}
        />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-muted-foreground text-xs font-medium">Status:</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
              disabled={changingStatus}
              className="border-border text-foreground rounded-lg border px-2 py-1 text-xs focus:outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <StatusBadge status={status} type="ticket" />
          </div>
          <Button size="sm" onClick={handleReply} loading={sending} disabled={!replyText.trim()}>
            <Send className="h-4 w-4" />
            {isInternalNote ? "Save Note" : "Send Reply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
