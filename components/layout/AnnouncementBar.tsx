"use client";
// components/layout/AnnouncementBar.tsx
// Client component — receives text/link from the server layout.
import { useState } from "react";
import { X } from "lucide-react";

interface AnnouncementBarProps {
  text: string;
  link?: string;
}

export function AnnouncementBar({ text, link }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="from-primary to-secondary relative flex items-center justify-center bg-gradient-to-r px-8 py-2 text-sm text-white/90">
      {link ? (
        <a href={link} className="hover:underline">
          {text}
        </a>
      ) : (
        <p>{text}</p>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-1/2 right-3 -translate-y-1/2 opacity-70 transition-opacity hover:opacity-100"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default AnnouncementBar;
