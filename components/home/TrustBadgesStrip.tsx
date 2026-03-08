import {
  Truck,
  HeadphonesIcon,
  BadgeCheck,
  ShieldCheck,
  HeartHandshake,
  UserCheck,
  ThumbsUp,
  MessageCircleQuestion,
  type LucideIcon,
} from "lucide-react";
import type { TrustBadgeItem } from "@/lib/types";

const ICON_MAP: Record<string, LucideIcon> = {
  Truck,
  HeadphonesIcon,
  BadgeCheck,
  ShieldCheck,
  HeartHandshake,
  UserCheck,
  ThumbsUp,
  MessageCircleQuestion,
};

interface TrustBadgesStripProps {
  badges: TrustBadgeItem[];
}

export function TrustBadgesStrip({ badges }: TrustBadgesStripProps) {
  return (
    <section className="border-border/50 border-y bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {badges.map(({ icon, title, description }) => {
            const Icon = ICON_MAP[icon] ?? BadgeCheck;
            return (
              <div key={title} className="flex flex-col items-center gap-3 text-center">
                <div className="from-primary/10 to-secondary/10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br">
                  <Icon className="text-primary h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
                  {title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
