"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import * as Select from "@radix-ui/react-select";
import { Globe, ChevronDown, Check } from "lucide-react";

const locales = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "हिं", name: "हिन्दी" },
  { code: "mr", label: "मर", name: "मराठी" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    router.replace(pathname, { locale: newLocale });
  }

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <Select.Root value={locale} onValueChange={switchLocale}>
      <Select.Trigger className="text-foreground hover:bg-surface inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium focus:outline-none">
        <Globe className="text-muted-foreground h-4 w-4" />
        <span>{current.label}</span>
        <ChevronDown className="text-muted-foreground h-3 w-3" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          className="border-border z-50 overflow-hidden rounded-lg border bg-card shadow-lg"
        >
          <Select.Viewport className="p-1">
            {locales.map((loc) => (
              <Select.Item
                key={loc.code}
                value={loc.code}
                className="text-foreground hover:bg-surface data-[highlighted]:bg-surface flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none"
              >
                <Select.ItemText>{loc.name}</Select.ItemText>
                <Select.ItemIndicator className="ml-auto">
                  <Check className="text-primary h-4 w-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
