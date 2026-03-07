import Link from "next/link";
import { getLocale } from "next-intl/server";
import { BRAND_NAME, SUPPORT_EMAIL, SOCIAL_LINKS } from "@/constants/site";
import { Instagram, Facebook, Youtube } from "lucide-react";

const POLICY_LINKS = [
  { key: "privacy", href: "/privacy-policy" },
  { key: "terms", href: "/terms" },
  { key: "shipping", href: "/shipping-policy" },
  { key: "returns", href: "/return-policy" },
] as const;

const SHOP_LINKS = [
  { key: "all", href: "/shop" },
  { key: "skincare", href: "/shop?category=skincare" },
  { key: "haircare", href: "/shop?category=haircare" },
  { key: "combos", href: "/shop?type=combo" },
] as const;

export async function Footer() {
  const locale = await getLocale();

  return (
    <footer className="border-border bg-primary border-t text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <span className="font-heading text-2xl font-bold text-white">{BRAND_NAME}</span>
            <p className="text-sm leading-relaxed">
              Pure Ayurvedic skincare & haircare rooted in ancient wisdom, crafted for modern life.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.instagram && (
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:text-accent transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {SOCIAL_LINKS.facebook && (
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="hover:text-accent transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {SOCIAL_LINKS.youtube && (
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="hover:text-accent transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="font-heading mb-4 text-lg font-semibold text-white">Shop</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {SHOP_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={`/${locale}${href}`}
                    className="hover:text-accent capitalize transition-colors"
                  >
                    {key === "all" ? "All Products" : key}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-heading mb-4 text-lg font-semibold text-white">Policies</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {POLICY_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={`/${locale}${href}`}
                    className="hover:text-accent capitalize transition-colors"
                  >
                    {key.replace(/-/g, " ")} policy
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading mb-4 text-lg font-semibold text-white">Contact</h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-accent transition-colors">
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-accent transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/faq`} className="hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
