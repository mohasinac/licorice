"use client";

import * as React from "react";
import { useState } from "react";
import { Send, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import type { SupportTicket, TicketMessage } from "@/lib/types";
import { toSafeDate } from "@/lib/utils";
import { apiFetch } from "@/lib/api-fetch";

interface Props {
  ticket: SupportTicket;
  messages: TicketMessage[];
  /** If true, renders the customer reply form; if false/undefined, hides it (for admin view) */
  allowReply?: boolean;
  /** Called when customer submits a reply — receives updated messages */
  onReply?: (message: string) => Promise<void>;
}

function formatDateTime(val: unknown): string {
  const date = toSafeDate(val);
  if (!date) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketThread({ ticket, messages, allowReply = true, onReply }: Props) {
  const t = useTranslations("support");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const isClosed = ticket.status === "resolved" || ticket.status === "closed";

  async function handleReply() {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      if (onReply) {
        await onReply(replyText.trim());
      } else {
        await apiFetch(`/api/support/tickets/${ticket.id}/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: replyText.trim() }),
        });
        toast.success(t("replySent"));
      }
      setReplyText("");
    } catch {
      toast.error(t("replyFailed"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-foreground text-xl font-bold">{ticket.subject}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            <span className="font-mono font-semibold text-green-700 dark:text-green-400">{ticket.ticketNumber}</span>
            {" · "}
            {t("opened", { date: formatDateTime(ticket.createdAt) })}
          </p>
        </div>
        <StatusBadge status={ticket.status} type="ticket" />
      </div>

      {/* Status banner for resolved/closed */}
      {isClosed && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950/30 dark:text-green-400">
          {ticket.status === "resolved" ? t("bannerResolved") : t("bannerClosed")}{" "}
          {allowReply && (
            <button
              className="ml-1 font-medium underline"
              onClick={() => {
                document.getElementById("ticket-reply-textarea")?.focus();
              }}
            >
              {t("replyToReopen")}
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex flex-col gap-4">
        {messages.map((msg, idx) => {
          const isAdmin = msg.senderType === "admin";
          const isInternal = msg.isInternalNote === true;

          if (isInternal && allowReply) return null; // customers don't see internal notes

          return (
            <div key={idx} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  isInternal
                    ? "border border-border bg-muted text-muted-foreground"
                    : isAdmin
                      ? "bg-muted text-foreground"
                      : "bg-primary text-white"
                }`}
              >
                {isAdmin && (
                  <p className="text-muted-foreground mb-1 text-xs font-medium">
                    {isInternal && <Lock className="mr-1 inline h-3 w-3" />}
                    {isInternal
                      ? t("internalNote")
                      : ((msg as unknown as { senderName?: string }).senderName ?? t("supportTeam"))}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{msg.body}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.attachments.map((url, ai) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={ai}
                        src={url}
                        alt="Attachment"
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
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

      {/* Reply box */}
      {allowReply && (
        <div className="border-border rounded-2xl border p-4">
          <Textarea
            id="ticket-reply-textarea"
            label={t("yourReply")}
            placeholder={t("yourReply")}
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={sending}
          />
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={handleReply} loading={sending} disabled={!replyText.trim()}>
              <Send className="h-4 w-4" />
              {t("sendReply")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
