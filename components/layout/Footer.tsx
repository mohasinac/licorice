import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  BRAND_NAME,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_HOURS,
  SOCIAL_LINKS,
  WHATSAPP_NUMBER,
} from "@/constants/site";
import { Instagram, Facebook, Youtube, Github } from "lucide-react";

const POLICY_LINKS = [
  { key: "privacy", href: "/privacy-policy" },
  { key: "terms", href: "/terms" },
  { key: "shipping", href: "/shipping-policy" },
  { key: "returns", href: "/refund-policy" },
] as const;

const SHOP_LINKS = [
  { key: "all", href: "/shop" },
  { key: "skincare", href: "/shop?category=skincare" },
  { key: "haircare", href: "/shop?category=haircare" },
  { key: "combos", href: "/shop?type=combo" },
] as const;

const USEFUL_LINKS = [
  { label: "Free Consultation", href: "/consultation" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Corporate Gifting", href: "/corporate-gifting" },
  { label: "Track your order", href: "/track" },
  { label: "Media Kit", href: "/media-kit" },
] as const;

export async function Footer({ logoUrl }: { logoUrl?: string }) {

  return (
    <footer className="from-primary via-primary to-primary/95 border-t border-white/5 bg-gradient-to-b text-white/70">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column — wider */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={BRAND_NAME}
                width={160}
                height={44}
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            ) : (
              <span className="font-heading text-xl font-semibold tracking-wide text-white">
                {BRAND_NAME}
              </span>
            )}
            <p className="max-w-sm text-sm leading-relaxed">
              Pure Ayurvedic skincare & haircare rooted in ancient wisdom, crafted for modern life.
              Experience the transformative power of Honest Ayurveda.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.instagram && (
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:border-accent/40 hover:bg-accent/10 hover:text-accent flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-all"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {SOCIAL_LINKS.facebook && (
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="hover:border-accent/40 hover:bg-accent/10 hover:text-accent flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-all"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {SOCIAL_LINKS.youtube && (
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="hover:border-accent/40 hover:bg-accent/10 hover:text-accent flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-all"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="font-heading mb-4 text-sm font-semibold tracking-widest text-white uppercase">
              Shop
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {SHOP_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="hover:text-accent capitalize transition-colors"
                  >
                    {key === "all" ? "All Products" : key}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful links */}
          <div>
            <h3 className="font-heading mb-4 text-sm font-semibold tracking-widest text-white uppercase">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {USEFUL_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-accent transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading mb-4 text-sm font-semibold tracking-widest text-white uppercase">
              Contact Us
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <a
                  href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=Hi`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  Call/WhatsApp — {SUPPORT_PHONE}
                </a>
              </li>
              <li className="text-xs text-white/50">{SUPPORT_HOURS}</li>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-accent transition-colors">
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li className="mt-2">
                <Link href="/contact" className="hover:text-accent transition-colors">
                  Contact Form
                </Link>
              </li>
            </ul>

            {/* Policies beneath contact on this column */}
            <h3 className="font-heading mt-8 mb-4 text-sm font-semibold tracking-widest text-white uppercase">
              Policies
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {POLICY_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="hover:text-accent capitalize transition-colors"
                  >
                    {key.replace(/-/g, " ")} policy
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </span>
          <a
            href="https://github.com/mohasinac"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-white/70"
          >
            <Github className="h-3.5 w-3.5" />
            Built by mohasinac
          </a>
        </div>
      </div>
    </footer>
  );
}
