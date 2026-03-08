"use client";

import { useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface SearchFormProps {
  defaultValue?: string;
}

export function SearchForm({ defaultValue }: SearchFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("search");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <div className="border-border bg-card focus-within:border-primary focus-within:ring-primary/20 focus-within:ring-2 flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-all">
        <Search className="text-muted-foreground h-5 w-5 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          defaultValue={defaultValue}
          placeholder={t("placeholder")}
          autoFocus
          className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-base outline-none"
        />
      </div>
      <button
        type="submit"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-5 py-3 text-sm font-medium shadow-sm transition-colors"
      >
        {t("searchBtn")}
      </button>
    </form>
  );
}
