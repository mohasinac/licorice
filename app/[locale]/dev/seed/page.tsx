"use client";
// app/[locale]/dev/seed/page.tsx
// Page to seed or unseed Firestore with seed data.
// In development: always accessible.
// In production: admin only — redirects others to /.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { SEED_ADMIN_USER } from "@/lib/seeds/users";
import { useAuthStore } from "@/stores/useAuthStore";
import { getClientAuth } from "@/lib/firebase/client";

const IS_DEV = process.env.NODE_ENV === "development";

type Rollcall = Record<string, Record<string, boolean>>;

type SeedResult = {
  success: boolean;
  rollcall?: Rollcall;
  error?: string;
};

export default function DevSeedPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const isAllowed = IS_DEV || isAdmin;

  const [loading, setLoading] = useState<"seed" | "unseed" | "status" | null>("status");
  const [lastResult, setLastResult] = useState<SeedResult | null>(null);
  const didLoad = useRef(false);

  // Redirect non-admins in production
  useEffect(() => {
    if (authLoading) return;
    if (!isAllowed) router.replace("/");
  }, [authLoading, isAllowed, router]);

  // Fetch current rollcall once auth resolves and access is confirmed
  useEffect(() => {
    if (authLoading || !isAllowed || didLoad.current) return;
    didLoad.current = true;
    async function load() {
      const headers: Record<string, string> = {};
      if (!IS_DEV) {
        const token = await getClientAuth().currentUser?.getIdToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }
      return fetch("/api/dev/seed", { headers });
    }
    load()
      .then((r) => r.json() as Promise<SeedResult>)
      .then(setLastResult)
      .catch((err) => setLastResult({ success: false, error: String(err) }))
      .finally(() => setLoading(null));
  }, [authLoading, isAllowed]);

  async function authFetch(url: string, init?: RequestInit) {
    const headers: Record<string, string> = { ...(init?.headers as Record<string, string>) };
    if (!IS_DEV) {
      const token = await getClientAuth().currentUser?.getIdToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, { ...init, headers });
  }

  async function handleSeed() {
    setLoading("seed");
    try {
      const res = await authFetch("/api/dev/seed", { method: "POST" });
      const result = (await res.json()) as SeedResult;
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
      const res = await authFetch("/api/dev/unseed", { method: "POST" });
      const result = (await res.json()) as SeedResult;
      setLastResult(result);
      if (result.success) toast.success("Unseed complete!");
      else toast.error(result.error ?? "Unseed failed");
    } catch {
      toast.error("Request failed");
    } finally {
      setLoading(null);
    }
  }

  // Show spinner while auth resolves in production (or while redirecting)
  if (!IS_DEV && (authLoading || !isAllowed)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-heading text-primary mb-2 text-3xl font-bold">Dev Seed Tool</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Upserts or deletes all seed documents in Firestore.
      </p>

      <div className="flex gap-4">
        <Button onClick={handleSeed} loading={loading === "seed"} disabled={!!loading} size="md">
          Seed Firestore
        </Button>
        <Button
          onClick={handleUnseed}
          loading={loading === "unseed"}
          disabled={!!loading}
          variant="outline"
          size="md"
          className="border-destructive text-destructive hover:bg-destructive/10"
        >
          Unseed Firestore
        </Button>
      </div>

      <div className="bg-muted mt-8 rounded-lg p-4">
        <h3 className="text-sm font-semibold">Admin User (Firebase Auth)</h3>
        <ul className="mt-2 space-y-0.5 text-xs">
          <li><span className="text-muted-foreground">Email:</span> <code>{SEED_ADMIN_USER.email}</code></li>
          <li><span className="text-muted-foreground">Password:</span> <code>{SEED_ADMIN_USER.password}</code></li>
          <li><span className="text-muted-foreground">UID:</span> <code>{SEED_ADMIN_USER.uid}</code></li>
          <li><span className="text-muted-foreground">Role:</span> <code>{SEED_ADMIN_USER.role}</code></li>
        </ul>
      </div>

      {loading === "status" && (
        <p className="text-muted-foreground mt-8 text-sm">Loading rollcall…</p>
      )}

      {lastResult && (
        <div className="mt-8 space-y-4">
          {lastResult.error && (
            <pre className="bg-destructive/10 text-destructive overflow-auto rounded-lg p-4 text-xs">
              {lastResult.error}
            </pre>
          )}
          {lastResult.rollcall &&
            Object.entries(lastResult.rollcall).map(([collection, docs]) => {
              const ids = Object.entries(docs);
              const present = ids.filter(([, exists]) => exists).length;
              return (
                <div key={collection} className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-semibold">
                    {collection}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({present}/{ids.length})
                    </span>
                  </h3>
                  <ul className="mt-2 space-y-0.5 text-xs">
                    {ids.map(([id, exists]) => (
                      <li key={id} className="flex items-center gap-2">
                        <span className={exists ? "text-green-600 dark:text-green-400" : "text-red-500"}>
                          {exists ? "✓" : "✗"}
                        </span>
                        <code>{id}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
