"use client";

import { Check } from "lucide-react";
import type { CheckoutStep } from "@/stores/useCheckoutStore";

const STEPS: { id: CheckoutStep; label: string }[] = [
  { id: "cart", label: "Cart" },
  { id: "address", label: "Address" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "confirm", label: "Confirm" },
];

const STEP_ORDER: CheckoutStep[] = ["cart", "address", "shipping", "payment", "confirm"];

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
}

export function CheckoutStepper({ currentStep, onStepClick }: CheckoutStepperProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <nav aria-label="Checkout steps" className="mb-8">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((step, idx) => {
          const stepIndex = STEP_ORDER.indexOf(step.id);
          const isCompleted = stepIndex < currentIndex;
          const isActive = step.id === currentStep;
          const isPast = stepIndex < currentIndex;

          return (
            <li key={step.id} className="flex items-center">
              <button
                onClick={() => isPast && onStepClick?.(step.id)}
                disabled={!isPast}
                className="group flex flex-col items-center gap-1"
              >
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    isCompleted
                      ? "bg-primary cursor-pointer text-white"
                      : isActive
                        ? "bg-primary ring-primary/20 text-white ring-4"
                        : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                </span>
                <span
                  className={[
                    "hidden text-xs font-medium sm:block",
                    isActive ? "text-primary" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </button>

              {idx < STEPS.length - 1 && (
                <div
                  className={[
                    "mx-2 h-0.5 w-8 transition-colors sm:w-16",
                    stepIndex < currentIndex ? "bg-primary" : "bg-border",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
