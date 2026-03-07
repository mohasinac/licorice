"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag, Heart, Search, Menu, User, LogIn } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { useState } from "react";
import { BRAND_NAME } from "@/constants/site";

const NAV_ITEMS = [
  { key: "shop", href: "/shop" },
  { key: "concerns", href: "/concerns" },
  { key: "ingredients", href: "/ingredients" },
  { key: "consultation", href: "/consultation" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
] as const;

export function Navbar() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const user = useAuthStore((s) => s.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="border-border sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="font-heading text-primary text-2xl font-bold">{BRAND_NAME}</span>
          </Link>

          {/* Desktop navigation */}
          <ul className="hidden items-center gap-6 md:flex">
            {NAV_ITEMS.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={`/${locale}${href}`}
                  className="text-foreground hover:text-primary text-sm font-medium transition-colors"
                >
                  {t(key as Parameters<typeof t>[0])}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <Link
              href={`/${locale}/search`}
              className="text-foreground hover:bg-surface hidden rounded-full p-2 transition-colors md:flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>

            <Link
              href={`/${locale}/wishlist`}
              className="text-foreground hover:bg-surface relative hidden rounded-full p-2 transition-colors md:flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="bg-primary absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {user ? (
              <Link
                href={`/${locale}/account`}
                className="text-foreground hover:bg-surface hidden rounded-full p-2 transition-colors md:flex"
                aria-label={t("account")}
              >
                <User className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="text-foreground hover:bg-surface hidden rounded-full p-2 transition-colors md:flex"
                aria-label={t("login")}
              >
                <LogIn className="h-5 w-5" />
              </Link>
            )}

            <button
              onClick={openCart}
              className="text-foreground hover:bg-surface relative rounded-full p-2 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="bg-primary absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="text-foreground hover:bg-surface rounded-full p-2 transition-colors md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} locale={locale} />
    </>
  );
}
