"use client";

import * as React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number; // 0-5
  max?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };

export function StarRating({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = "md",
  className = "",
}: StarRatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div
      className={["flex items-center gap-0.5", className].join(" ")}
      role={interactive ? "radiogroup" : undefined}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < display;
        return (
          <button
            key={i}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={interactive ? () => onChange?.(i + 1) : undefined}
            onMouseEnter={interactive ? () => setHovered(i + 1) : undefined}
            onMouseLeave={interactive ? () => setHovered(null) : undefined}
            className={interactive ? "cursor-pointer focus:outline-none" : "pointer-events-none"}
            aria-label={interactive ? `${i + 1} star${i + 1 > 1 ? "s" : ""}` : undefined}
          >
            <Star
              className={[
                sizeMap[size],
                filled ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-border",
              ].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}
