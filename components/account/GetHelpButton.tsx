"use client";

import * as React from "react";
import { useState } from "react";
import { HelpCircle, X, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";

interface Props {
  orderId: string;
  orderNumber: string;
}

export function GetHelpButton({ orderId, orderNumber }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState(`Issue with order ${orderNumber}`);
  const [sending, setSending] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          category: "order",
          orderId,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { ticketNumber?: string };
      setTicketNumber(data.ticketNumber ?? null);
      toast.success("Support ticket created!");
    } catch {
      toast.error("Failed to create ticket. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
      >
        <HelpCircle className="h-4 w-4" />
        Get Help with this Order
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-background w-full max-w-md rounded-2xl p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-foreground text-lg font-bold">
                {ticketNumber ? "Ticket Created" : `Get Help — ${orderNumber}`}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {ticketNumber ? (
              <div className="py-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Your support ticket has been created.
                </p>
                <p className="mt-3 rounded-lg bg-green-50 px-4 py-2 font-mono text-sm font-semibold text-green-700">
                  {ticketNumber}
                </p>
                <p className="text-muted-foreground mt-3 text-xs">
                  We&apos;ll respond within 1 business day.
                </p>
                <Button className="mt-5" size="sm" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <Textarea
                  label="Describe your issue"
                  placeholder="What's the problem? Please include as much detail as possible…"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" loading={sending} disabled={!message.trim()}>
                    <Send className="h-4 w-4" />
                    Submit Ticket
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
