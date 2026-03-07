"use client";

// TODO: Replace with Tiptap rich text editor in Phase 7 (Blog & CMS).
// For Phase 2 this is a styled textarea that accepts HTML content.

import * as React from "react";
import { Textarea } from "@/components/ui/Textarea";

interface RichTextEditorProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  rows?: number;
}

export function RichTextEditor({ label, value, onChange, error, rows = 10 }: RichTextEditorProps) {
  return (
    <div>
      <Textarea
        label={label}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        error={error}
        rows={rows}
        placeholder="<p>Enter HTML content…</p>"
        className="font-mono text-xs"
      />
      <p className="text-muted-foreground mt-1 text-xs">
        HTML accepted. Rich editor coming in Phase 7.
      </p>
    </div>
  );
}
