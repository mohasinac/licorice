"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("You're subscribed! Check your inbox for a welcome gift.");
        setEmail("");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="from-primary via-primary/95 to-secondary relative overflow-hidden bg-gradient-to-br py-24">
      {/* Decorative rings */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full border border-white/[0.06]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full border border-dashed border-white/[0.08]" />

      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <span className="border-accent/30 text-accent mb-4 inline-flex rounded-full border px-3 py-1 text-xs tracking-widest uppercase">
          Stay Connected
        </span>
        <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
          Join the Licorice Community
        </h2>
        <p className="mt-4 text-white/60">
          Subscribe for Ayurvedic tips, exclusive offers, and a{" "}
          <strong className="text-accent">10% welcome discount</strong> on your first order.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-accent"
          />
          <Button type="submit" loading={loading} size="md" variant="secondary">
            Subscribe
          </Button>
        </form>

        <p className="mt-4 text-xs text-white/40">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
