"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  ArrowRight,
  Package,
  Tag,
  Leaf,
  FileText,
  Loader2,
  ShoppingBag,
  BookOpen,
  User,
  MapPin,
  Truck,
  Gift,
  Phone,
  Info,
  Stethoscope,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import type { Product, Category, Concern } from "@/lib/types";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedValue } from "@/lib/i18n";

// ── Types ───────────────────────────────────────────────────────────────────

interface SearchResults {
  products: Product[];
  categories: Category[];
  concerns: Concern[];
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ResultGroup({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("search");

  const SITE_LINKS = [
    { label: t("linkShopAll"), href: "/shop", icon: ShoppingBag, keywords: ["shop", "products", "buy", "all products", "store"] },
    { label: t("linkConcerns"), href: "/concern", icon: Leaf, keywords: ["concern", "skin", "problem", "issue", "acne", "dryness", "oily"] },
    { label: t("linkIngredients"), href: "/ingredients", icon: Leaf, keywords: ["ingredient", "natural", "herb", "botanical", "extract"] },
    { label: t("linkConsultation"), href: "/consultation", icon: Stethoscope, keywords: ["consult", "free", "advice", "help", "expert", "recommendation"] },
    { label: t("linkBlog"), href: "/blog", icon: BookOpen, keywords: ["blog", "tip", "article", "read", "guide", "skincare"] },
    { label: t("linkAbout"), href: "/about", icon: Info, keywords: ["about", "brand", "story", "company", "who we are"] },
    { label: t("linkContact"), href: "/contact", icon: Phone, keywords: ["contact", "support", "help", "email", "call", "whatsapp"] },
    { label: t("linkTrack"), href: "/track", icon: Truck, keywords: ["track", "order", "delivery", "shipping", "status", "where is my"] },
    { label: t("linkCorporate"), href: "/corporate-gifting", icon: Gift, keywords: ["corporate", "gift", "bulk", "business", "gifting", "office"] },
    { label: t("linkAccount"), href: "/account", icon: User, keywords: ["account", "profile", "order history", "my orders", "login"] },
    { label: t("linkStoreFinder"), href: "/about#stores", icon: MapPin, keywords: ["store", "location", "near me", "offline", "shop"] },
  ];

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reset state when dialog closes
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
      setLoading(false);
    }
  }, [open]);

  // Debounced API search
  const handleQuery = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const data: SearchResults = await res.json();
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 280);
  }, []);

  // Filter site links by query
  const q = query.toLowerCase();
  const matchedLinks =
    q.length >= 1
      ? SITE_LINKS.filter(
          (l) =>
            l.label.toLowerCase().includes(q) ||
            l.keywords.some((k) => k.includes(q)),
        )
      : [...SITE_LINKS].slice(0, 6);

  const hasApiResults =
    results &&
    (results.products.length > 0 ||
      results.categories.length > 0 ||
      results.concerns.length > 0);

  function handleClose() {
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    handleClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="text-foreground/70 hover:text-primary hover:bg-primary/5 hidden items-center gap-1.5 rounded-full p-2 transition-colors lg:flex"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
          <kbd className="border-border text-muted-foreground hidden rounded border px-1.5 py-0.5 text-[10px] xl:inline-flex">
            ⌘K
          </kbd>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[8%] left-1/2 z-50 w-full max-w-xl -translate-x-1/2 rounded-2xl border border-border bg-background shadow-2xl"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>

          {/* Input bar */}
          <form
            onSubmit={handleSubmit}
            className="border-border flex items-center gap-3 border-b px-4 py-3"
          >
            <Search className="text-muted-foreground h-5 w-5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder={t("placeholder")}
              className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-base outline-none"
            />
            {loading ? (
              <Loader2 className="text-muted-foreground h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="border-border text-muted-foreground hover:text-foreground shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] transition-colors"
                  aria-label="Close"
                >
                  Esc
                </button>
              </Dialog.Close>
            )}
          </form>

          {/* Results panel */}
          <div className="max-h-[62vh] overflow-y-auto p-3">
            {/* Products */}
            {results && results.products.length > 0 && (
              <ResultGroup
                label={t("products")}
                icon={<Package className="h-3.5 w-3.5" />}
              >
                {results.products.map((product) => {
                  const name = getLocalizedValue(product.name, locale);
                  const defaultVariant =
                    product.variants?.find((v) => v.isDefault) ?? product.variants?.[0];
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={handleClose}
                      className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
                    >
                      {product.images?.[0] ? (
                        <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={product.images[0]}
                            alt={name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                          <Package className="text-muted-foreground h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground truncate text-sm font-medium">
                          {name}
                        </div>
                        {defaultVariant && (
                          <div className="text-muted-foreground text-xs">
                            ₹{defaultVariant.price.toLocaleString("en-IN")}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                    </Link>
                  );
                })}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={handleClose}
                  className="text-primary hover:bg-primary/5 flex items-center justify-center rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                >
                  {t("seeAllResults", { query })} →
                </Link>
              </ResultGroup>
            )}

            {/* Categories */}
            {results && results.categories.length > 0 && (
              <ResultGroup
                label={t("categories")}
                icon={<Tag className="h-3.5 w-3.5" />}
              >
                {results.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    onClick={handleClose}
                    className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
                  >
                    {cat.imageUrl ? (
                      <div className="bg-muted relative h-9 w-9 shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={cat.imageUrl}
                          alt={cat.label}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                        <Tag className="text-muted-foreground h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground truncate text-sm font-medium">
                        {cat.label}
                      </div>
                      {cat.description && (
                        <div className="text-muted-foreground truncate text-xs">
                          {cat.description}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                  </Link>
                ))}
              </ResultGroup>
            )}

            {/* Concerns */}
            {results && results.concerns.length > 0 && (
              <ResultGroup
                label={t("concerns")}
                icon={<Leaf className="h-3.5 w-3.5" />}
              >
                {results.concerns.map((concern) => (
                  <Link
                    key={concern.id}
                    href={`/concern/${concern.slug}`}
                    onClick={handleClose}
                    className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
                  >
                    {concern.imageUrl ? (
                      <div className="bg-muted relative h-9 w-9 shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={concern.imageUrl}
                          alt={concern.label}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                        <Leaf className="text-muted-foreground h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground truncate text-sm font-medium">
                        {concern.label}
                      </div>
                      {concern.description && (
                        <div className="text-muted-foreground truncate text-xs">
                          {concern.description}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                  </Link>
                ))}
              </ResultGroup>
            )}

            {/* Site pages */}
            {matchedLinks.length > 0 && (
              <ResultGroup
                label={query.length >= 1 ? t("pages") : t("quickLinks")}
                icon={<FileText className="h-3.5 w-3.5" />}
              >
                {matchedLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleClose}
                      className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
                    >
                      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                        <Icon className="text-muted-foreground h-4 w-4" />
                      </div>
                      <div className="text-foreground text-sm font-medium">{link.label}</div>
                      <ArrowRight className="text-muted-foreground ml-auto h-3.5 w-3.5 shrink-0" />
                    </Link>
                  );
                })}
              </ResultGroup>
            )}

            {/* Empty state */}
            {!loading && query.length >= 2 && !hasApiResults && matchedLinks.length === 0 && (
              <div className="py-12 text-center">
                <Search className="text-muted-foreground/40 mx-auto mb-3 h-10 w-10" />
                <p className="text-foreground text-sm font-medium">
                  {t("noResultsFor", { query })}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">{t("tryDifferent")}</p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
