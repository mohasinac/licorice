"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type DrawerSide = "left" | "right" | "bottom";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: DrawerSide;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const sideClasses: Record<DrawerSide, string> = {
  left: "inset-y-0 left-0 w-full max-w-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
  right:
    "inset-y-0 right-0 w-full max-w-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
  bottom:
    "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
};

export function Drawer({
  open,
  onOpenChange,
  side = "right",
  title,
  description,
  children,
  className = "",
}: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className={["fixed z-50 flex flex-col bg-white shadow-xl", sideClasses[side], className]
            .filter(Boolean)
            .join(" ")}
          aria-describedby={description ? undefined : undefined}
        >
          {(title || description) && (
            <div className="border-border flex items-center justify-between border-b px-6 py-4">
              <div>
                {title && (
                  <Dialog.Title className="font-heading text-foreground text-lg font-semibold">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="text-muted-foreground mt-0.5 text-sm">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close className="text-muted-foreground hover:text-foreground rounded-lg p-1">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
