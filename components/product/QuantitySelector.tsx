"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({ value, onChange, min = 1, max = 99 }: QuantitySelectorProps) {
  function decrement() {
    if (value > min) onChange(value - 1);
  }
  function increment() {
    if (value < max) onChange(value + 1);
  }

  const nearlyOut = max <= 5;

  return (
    <div className="flex flex-col gap-1">
      <div className="border-border flex items-center overflow-hidden rounded-lg border">
        <button
          onClick={decrement}
          disabled={value <= min}
          className="hover:bg-muted text-foreground flex h-10 w-10 items-center justify-center transition-colors disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="text-foreground flex-1 text-center text-sm font-semibold tabular-nums select-none">
          {value}
        </span>
        <button
          onClick={increment}
          disabled={value >= max}
          className="hover:bg-muted text-foreground flex h-10 w-10 items-center justify-center transition-colors disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {nearlyOut && max > 0 && <p className="text-xs text-amber-600 dark:text-amber-400">Only {max} left</p>}
    </div>
  );
}
