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
    <section className="bg-accent/20 py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="font-heading text-primary text-3xl font-bold sm:text-4xl">
          Join the Licorice Community
        </h2>
        <p className="text-muted-foreground mt-3">
          Subscribe for Ayurvedic tips, exclusive offers, and a{" "}
          <strong className="text-primary">10% welcome discount</strong> on your first order.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" loading={loading} size="md">
            Subscribe
          </Button>
        </form>

        <p className="text-muted-foreground mt-3 text-xs">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
