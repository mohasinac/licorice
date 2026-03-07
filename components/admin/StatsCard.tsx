// components/admin/StatsCard.tsx
// Reusable stat card for the admin dashboard.

import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  href?: string;
  accentColor?: string; // Tailwind colour class e.g. "text-green-600"
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  subtext,
  trend,
  href,
  accentColor = "text-primary",
}: StatsCardProps) {
  const inner = (
    <div className="bg-surface flex items-start gap-4 rounded-2xl p-5 shadow-sm">
      <div className={`rounded-xl bg-current/10 p-3 ${accentColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground truncate text-sm">{label}</p>
        <p className={`font-heading mt-0.5 text-2xl font-bold ${accentColor}`}>{value}</p>
        {subtext && (
          <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
            {trend === "up" && <span className="font-medium text-green-600">↑</span>}
            {trend === "down" && <span className="font-medium text-destructive">↓</span>}
            {subtext}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block transition-transform hover:scale-[1.01]">
        {inner}
      </a>
    );
  }

  return inner;
}
