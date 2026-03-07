"use client";

import * as React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoResize?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, autoResize = false, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    function handleAutoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
      if (autoResize) {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      props.onChange?.(e);
    }

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-foreground text-sm font-medium">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={[
            "border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-4 py-3 text-sm",
            "focus:border-primary focus:ring-primary focus:ring-2 focus:ring-offset-1 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-destructive focus:ring-destructive" : "",
            autoResize ? "resize-none overflow-hidden" : "resize-y",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          onChange={handleAutoResize}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-destructive text-xs">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
