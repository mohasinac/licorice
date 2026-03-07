"use client";
// app/[locale]/dev/seed/page.tsx
// Dev-only page to seed or unseed Firestore with mock data.
// Middleware blocks this in production (returns 404).

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";

type SeedResult = {
  success: boolean;
  seeded?: Record<string, number>;
  deleted?: Record<string, number>;
  message?: string;
  error?: string;
};

async function callEndpoint(endpoint: "/api/dev/seed" | "/api/dev/unseed"): Promise<SeedResult> {
  const res = await fetch(endpoint, { method: "POST" });
  return res.json() as Promise<SeedResult>;
}

export default function DevSeedPage() {
  const [loading, setLoading] = useState<"seed" | "unseed" | null>(null);
  const [lastResult, setLastResult] = useState<SeedResult | null>(null);

  async function handleSeed() {
    setLoading("seed");
    try {
      const result = await callEndpoint("/api/dev/seed");
      setLastResult(result);
      if (result.success) toast.success("Seed complete!");
      else toast.error(result.error ?? "Seed failed");
    } catch {
      toast.error("Request failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleUnseed() {
    setLoading("unseed");
    try {
      const result = await callEndpoint("/api/dev/unseed");
      setLastResult(result);
      if (result.success) toast.success("Unseed complete!");
      else toast.error(result.error ?? "Unseed failed");
    } catch {
      toast.error("Request failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-heading text-primary mb-2 text-3xl font-bold">Dev Seed Tool</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Upserts or deletes all seed documents in Firestore. Only available in{" "}
        <code className="bg-muted rounded px-1">NODE_ENV=development</code>.
      </p>

      <div className="flex gap-4">
        <Button onClick={handleSeed} loading={loading === "seed"} size="md">
          Seed Firestore
        </Button>
        <Button
          onClick={handleUnseed}
          loading={loading === "unseed"}
          variant="outline"
          size="md"
          className="border-destructive text-destructive hover:bg-destructive/10"
        >
          Unseed Firestore
        </Button>
      </div>

      {lastResult && (
        <pre className="bg-muted mt-8 overflow-auto rounded-lg p-4 text-xs">
          {JSON.stringify(lastResult, null, 2)}
        </pre>
      )}
    </div>
  );
}
