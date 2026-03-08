"use client";

import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-foreground text-sm font-medium">
            {label}
            {props.required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "text-foreground w-full rounded-xl border bg-card px-4 py-2.5 text-sm shadow-sm",
              "placeholder:text-muted-foreground transition-all duration-200 outline-none",
              "focus:border-primary focus:ring-primary/20 focus:ring-2",
              error ? "border-destructive" : "border-border",
              leftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              className,
            ].join(" ")}
            {...props}
          />
          {rightIcon && (
            <span className="text-muted-foreground absolute inset-y-0 right-3 flex items-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {!error && hint && <p className="text-muted-foreground text-xs">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
