"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { MessageCircle, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { SUPPORT_EMAIL, SUPPORT_HOURS, WHATSAPP_NUMBER } from "@/constants/site";
import { apiFetch } from "@/lib/api-fetch";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

export function ContactPageClient() {
  const [ticketNumber, setTicketNumber] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const json = await apiFetch<{ success: boolean; ticketNumber?: string }>("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setTicketNumber(json.ticketNumber ?? null);
      toast.success("Message sent! We'll reply within 1 business day.");
      reset();
    } catch {}
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <div className="ayur-hero">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-accent mb-3 text-sm font-semibold tracking-widest uppercase">
            Reach Out
          </p>
          <h1 className="font-heading text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Get in Touch
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            We&apos;re here to help. Whether it&apos;s a product question or order support, we
            respond promptly.
          </p>
          <hr className="ayur-divider mt-8 w-32" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Contact info */}
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                <MessageCircle className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-foreground font-semibold">WhatsApp</p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  Chat with us on WhatsApp →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                <Mail className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-foreground font-semibold">Email</p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-primary text-sm hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                <Clock className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-foreground font-semibold">Support Hours</p>
                <p className="text-muted-foreground text-sm">{SUPPORT_HOURS}</p>
              </div>
            </div>

            <div className="border-border bg-muted/50 ayur-card rounded-2xl border p-5">
              <p className="text-foreground text-sm font-semibold">📦 Order related issues?</p>
              <p className="text-muted-foreground mt-1 text-sm">
                For faster help with orders, WhatsApp us with your order number. We typically
                respond within 2 hours during business hours.
              </p>
            </div>
          </div>

          {/* Form / Success state */}
          {ticketNumber ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-green-50 p-8 text-center">
              <CheckCircle2 className="mb-4 h-12 w-12 text-green-600" />
              <h2 className="text-foreground text-xl font-semibold">Message Sent!</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Your support ticket has been created.
              </p>
              <p className="mt-3 rounded-lg bg-white px-4 py-2 font-mono text-sm font-semibold text-green-700 shadow-sm">
                {ticketNumber}
              </p>
              <p className="text-muted-foreground mt-3 text-xs">
                Save this number for future reference. We&apos;ll reply within 1 business day.
              </p>
              <button
                onClick={() => setTicketNumber(null)}
                className="text-primary mt-6 text-sm hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Your Name"
                placeholder="Priya Sharma"
                error={errors.name?.message}
                {...register("name")}
              />
              <Input
                label="Email Address"
                placeholder="you@example.com"
                type="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Subject"
                placeholder="Order inquiry, product question…"
                error={errors.subject?.message}
                {...register("subject")}
              />
              <Textarea
                label="Message"
                placeholder="Tell us how we can help…"
                rows={5}
                error={errors.message?.message}
                {...register("message")}
              />
              <Button type="submit" size="lg" loading={isSubmitting} className="mt-2 w-full">
                <Send className="h-4 w-4" /> Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
