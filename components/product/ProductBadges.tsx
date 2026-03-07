import * as React from "react";
import { CheckCircle2 } from "lucide-react";

const CERTIFICATION_LABELS: Record<string, string> = {
  "cruelty-free": "Cruelty Free",
  vegan: "Vegan",
  "no-parabens": "No Parabens",
  ayurvedic: "Ayurvedic Formula",
  "no-sulfates": "No Sulfates",
  "dermatologist-tested": "Dermatologist Tested",
  organic: "Organic",
};

interface ProductBadgesProps {
  certifications: string[];
}

export function ProductBadges({ certifications }: ProductBadgesProps) {
  if (certifications.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {certifications.map((cert) => (
        <div
          key={cert}
          className="border-border flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-medium"
        >
          <CheckCircle2 className="text-primary h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-foreground">{CERTIFICATION_LABELS[cert] ?? cert}</span>
        </div>
      ))}
    </div>
  );
}
