"use client";

import { Instagram, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SOCIAL_LINKS } from "@/constants/site";
import { useEffect, useRef } from "react";
import type { InstagramReelItem } from "@/lib/types";

interface InstagramReelsProps {
  reels: InstagramReelItem[];
}

/**
 * Extract the reel shortcode from various Instagram URL formats:
 * - https://www.instagram.com/reel/ABC123/
 * - https://instagram.com/reel/ABC123
 * - https://www.instagram.com/p/ABC123/
 */
function extractShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

export function InstagramReels({ reels }: InstagramReelsProps) {
  const t = useTranslations("home");
  const scriptLoaded = useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processEmbeds = () => (window as any).instgrm?.Embeds?.process?.();

  // Load Instagram embed.js once when reels mount
  useEffect(() => {
    if (scriptLoaded.current) {
      processEmbeds();
      return;
    }
    const existing = document.querySelector('script[src*="instagram.com/embed.js"]');
    if (existing) {
      scriptLoaded.current = true;
      processEmbeds();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    document.body.appendChild(script);
  }, [reels]);

  const validReels = reels.filter((r) => r.reelUrl && extractShortcode(r.reelUrl));

  if (validReels.length === 0) return null;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            title={t("followInstagram")}
            subtitle={t("instagramSub")}
            align="left"
          />
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="from-primary to-secondary inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-5 py-2.5 text-sm font-medium text-white shadow-md transition-transform hover:scale-105"
          >
            <Instagram className="h-4 w-4" />
            @licoriceherbal
          </a>
        </div>

        {/* Reels grid — Instagram embeds */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {validReels.slice(0, 6).map((reel) => (
            <div key={reel.id} className="flex justify-center">
              <blockquote
                className="instagram-media"
                data-instgrm-captioned
                data-instgrm-permalink={reel.reelUrl}
                style={{
                  background: "#FFF",
                  border: 0,
                  borderRadius: "12px",
                  boxShadow: "none",
                  margin: 0,
                  maxWidth: "540px",
                  minWidth: "280px",
                  width: "100%",
                }}
              />
            </div>
          ))}
        </div>

        {/* "View more on Instagram" link */}
        <div className="mt-8 text-center">
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            {t("viewOnInstagram")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
