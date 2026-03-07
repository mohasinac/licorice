"use client";
// app/[locale]/track/TrackForm.tsx
// Search form for public order tracking.

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  initialOrderId?: string;
  initialAwb?: string;
  initialEmail?: string;
}

export function TrackForm({ initialOrderId, initialAwb, initialEmail }: Props = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = searchParams.get("locale") ?? "en";

  const [searchType, setSearchType] = useState<"orderId" | "awb">(
    initialAwb ? "awb" : "orderId",
  );
  const [value, setValue] = useState(initialOrderId ?? initialAwb ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;

    const params = new URLSearchParams();
    if (searchType === "orderId") {
      params.set("orderId", value.trim());
      if (email.trim()) params.set("email", email.trim());
    } else {
      params.set("awb", value.trim());
    }

    router.push(`/${locale}/track?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden w-fit">
        <button
          type="button"
          onClick={() => setSearchType("orderId")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            searchType === "orderId"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:text-foreground"
          }`}
        >
          Order ID
        </button>
        <button
          type="button"
          onClick={() => setSearchType("awb")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            searchType === "awb"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:text-foreground"
          }`}
        >
          AWB Number
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            searchType === "orderId" ? "e.g. LH-2026-00001" : "e.g. 4567891234"
          }
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <Button type="submit" variant="primary" size="md">
          <Search className="h-4 w-4 mr-2" />
          Track
        </Button>
      </div>

      {searchType === "orderId" && (
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email or phone (for verification)"
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      )}
    </form>
  );
}
