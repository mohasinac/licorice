// i18n/navigation.ts
// Locale-aware navigation utilities for next-intl.
// Components should import Link, useRouter, usePathname, redirect from here
// instead of next/link and next/navigation to get correct locale-prefix handling.

import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
