"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { X, ShoppingBag, Heart, Search, User, UserRoundPlus } from "lucide-react";
import { BRAND_NAME } from "@/constants/site";
import { useAuthStore } from "@/stores/useAuthStore";
import { LanguageSwitcher } from "./LanguageSwitcher";

const NAV_ITEMS = [
  { key: "home", href: "" },
  { key: "shop", href: "/shop" },
  { key: "concerns", href: "/concern" },
  { key: "ingredients", href: "/ingredients" },
  { key: "consultation", href: "/consultation" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
] as const;

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  locale: string;
  logoUrl?: string;
}

export function MobileMenu({ open, onClose, logoUrl }: MobileMenuProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left fixed top-0 bottom-0 left-0 z-50 flex w-80 flex-col bg-white shadow-xl"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
          {/* Header */}
          <div className="border-border flex h-16 items-center justify-between border-b px-6">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={BRAND_NAME}
                width={120}
                height={34}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="font-heading text-primary text-lg font-semibold tracking-wide">
                {BRAND_NAME}
              </span>
            )}
            <Dialog.Close asChild>
              <button
                className="text-foreground hover:bg-surface rounded-full p-2 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Nav links */}
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
            {NAV_ITEMS.map(({ key, href }) => (
              <Link
                key={key}
                href={href || "/"}
                onClick={onClose}
                className={`rounded-lg px-4 py-3 text-sm transition-colors ${
                  (href ? pathname.startsWith(href) : pathname === "/")
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground font-medium hover:bg-surface hover:text-primary"
                }`}
              >
                {t(key as Parameters<typeof t>[0])}
              </Link>
            ))}
          </nav>

          {/* Footer icons */}
          <div className="border-border border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <LanguageSwitcher />
              <div className="flex gap-2">
                <Link
                  href="/search"
                  onClick={onClose}
                  aria-label="Search"
                  className="hover:bg-surface rounded-full p-2"
                >
                  <Search className="h-5 w-5" />
                </Link>
                <Link
                  href="/account/wishlist"
                  onClick={onClose}
                  aria-label="Wishlist"
                  className="hover:bg-surface rounded-full p-2"
                >
                  <Heart className="h-5 w-5" />
                </Link>
                {user ? (
                  <Link
                    href="/account"
                    onClick={onClose}
                    aria-label={t("account")}
                    className="hover:bg-surface rounded-full p-2"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={onClose}
                    aria-label={t("login")}
                    className="hover:bg-surface rounded-full p-2"
                  >
                    <UserRoundPlus className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
