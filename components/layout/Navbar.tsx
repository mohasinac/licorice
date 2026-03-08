"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ShoppingBag, Heart, Search, Menu, User, UserRoundPlus, Shield, LogOut } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { useEffect, useState } from "react";
import { BRAND_NAME } from "@/constants/site";

const NAV_ITEMS = [
  { key: "home", href: "" },
  { key: "shop", href: "/shop" },
  { key: "concerns", href: "/concern" },
  { key: "ingredients", href: "/ingredients" },
  { key: "consultation", href: "/consultation" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
] as const;

export function Navbar({ logoUrl }: { logoUrl?: string }) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
        <header className="border-border/40 sticky top-0 z-40 border-b bg-background/95 shadow-sm backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={BRAND_NAME}
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
                priority
              />
            ) : (
              <span className="font-heading text-primary text-xl font-semibold tracking-wide">
                {BRAND_NAME}
              </span>
            )}
          </Link>

          {/* Desktop navigation */}
          <ul className="hidden items-center gap-6 lg:flex">
            {NAV_ITEMS.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href || "/"}
                  className={`text-sm tracking-wide transition-colors ${
                    (href ? pathname.startsWith(href) : pathname === "/")
                      ? "text-primary font-bold"
                      : "text-foreground/80 font-medium hover:text-primary"
                  } ${
                    key === "consultation"
                      ? "border-primary/20 bg-primary/5 text-primary rounded-full border px-3 py-1"
                      : ""
                  }`}
                >
                  {t(key as Parameters<typeof t>[0])}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />

            <Link
              href="/search"
              className="text-foreground/70 hover:text-primary hover:bg-primary/5 hidden rounded-full p-2 transition-colors lg:flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>

            <Link
              href="/account/wishlist"
              className="text-foreground/70 hover:text-primary hover:bg-primary/5 relative hidden rounded-full p-2 transition-colors lg:flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {mounted && wishlistCount > 0 && (
                <span className="bg-primary absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {mounted && user?.role === "admin" && (
              <Link
                href="/admin"
                className="text-foreground/70 hover:text-primary hover:bg-primary/5 hidden rounded-full p-2 transition-colors lg:flex"
                aria-label={t("admin")}
              >
                <Shield className="h-5 w-5" />
              </Link>
            )}

            {mounted && (user ? (
              <Link
                href="/account"
                className="text-foreground/70 hover:text-primary hover:bg-primary/5 hidden rounded-full p-2 transition-colors lg:flex"
                aria-label={t("account")}
              >
                <User className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-foreground/70 hover:text-primary hover:bg-primary/5 hidden rounded-full p-2 transition-colors lg:flex"
                aria-label={t("login")}
              >
                <UserRoundPlus className="h-5 w-5" />
              </Link>
            ))}

            {mounted && user && (
              <button
                onClick={async () => {
                  const { getClientAuth } = await import("@/lib/firebase/client");
                  const { signOut } = await import("firebase/auth");
                  await signOut(getClientAuth());
                }}
                className="text-foreground/70 hover:text-primary hover:bg-primary/5 hidden rounded-full p-2 transition-colors lg:flex"
                aria-label={t("logout")}
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={openCart}
              className="text-foreground/70 hover:text-primary hover:bg-primary/5 relative rounded-full p-2 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && itemCount > 0 && (
                <span className="bg-primary absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-full p-2 transition-colors lg:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        locale={locale}
        logoUrl={logoUrl}
      />
    </>
  );
}
