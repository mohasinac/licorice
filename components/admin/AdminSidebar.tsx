"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  Package,
  Star,
  FileText,
  Headset,
  Settings,
  BookOpen,
  CalendarCheck,
  Building2,
  Mail,
  Tag,
  Megaphone,
  Quote,
  Compass,
  Home,
  Truck,
  ScrollText,
  Stethoscope,
  Layers,
  HeartPulse,
  ChevronDown,
  Ticket,
  CreditCard,
  FolderDown,
  KeyRound,
} from "lucide-react";
import { useState } from "react";

interface NavGroup {
  title: string;
  items: { label: string; href: string; icon: React.ReactNode }[];
}

export function AdminSidebar() {
  const pathname = usePathname();
  const base = "/admin";

  const groups: NavGroup[] = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: `${base}`, icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: "Analytics", href: `${base}/analytics`, icon: <BarChart3 className="h-4 w-4" /> },
      ],
    },
    {
      title: "Commerce",
      items: [
        { label: "Orders", href: `${base}/orders`, icon: <ClipboardList className="h-4 w-4" /> },
        { label: "Products", href: `${base}/products`, icon: <Package className="h-4 w-4" /> },
        { label: "Inventory", href: `${base}/inventory`, icon: <Layers className="h-4 w-4" /> },
        { label: "Categories", href: `${base}/categories`, icon: <Tag className="h-4 w-4" /> },
        { label: "Concerns", href: `${base}/concerns`, icon: <HeartPulse className="h-4 w-4" /> },
        { label: "Coupons", href: `${base}/coupons`, icon: <Ticket className="h-4 w-4" /> },
        { label: "Reviews", href: `${base}/reviews`, icon: <Star className="h-4 w-4" /> },
      ],
    },
    {
      title: "Content",
      items: [
        { label: "Blog Posts", href: `${base}/blogs`, icon: <BookOpen className="h-4 w-4" /> },
        {
          label: "Testimonials",
          href: `${base}/testimonials`,
          icon: <Quote className="h-4 w-4" />,
        },
        {
          label: "Promo Banners",
          href: `${base}/promo-banners`,
          icon: <Megaphone className="h-4 w-4" />,
        },
        { label: "Static Pages", href: `${base}/pages`, icon: <FileText className="h-4 w-4" /> },
        {
          label: "Media Kit",
          href: `${base}/media-kit`,
          icon: <FolderDown className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Support",
      items: [
        { label: "Tickets", href: `${base}/support`, icon: <Headset className="h-4 w-4" /> },
        {
          label: "Consultations",
          href: `${base}/consultations`,
          icon: <Stethoscope className="h-4 w-4" />,
        },
        { label: "Corporate", href: `${base}/corporate`, icon: <Building2 className="h-4 w-4" /> },
        { label: "Newsletter", href: `${base}/newsletter`, icon: <Mail className="h-4 w-4" /> },
      ],
    },
    {
      title: "Settings",
      items: [
        { label: "General", href: `${base}/settings`, icon: <Settings className="h-4 w-4" /> },
        {
          label: "Navigation",
          href: `${base}/settings/navigation`,
          icon: <Compass className="h-4 w-4" />,
        },
        {
          label: "Homepage",
          href: `${base}/settings/homepage`,
          icon: <Home className="h-4 w-4" />,
        },
        {
          label: "Shipping",
          href: `${base}/settings/shipping`,
          icon: <Truck className="h-4 w-4" />,
        },
        {
          label: "Pages",
          href: `${base}/settings/pages`,
          icon: <ScrollText className="h-4 w-4" />,
        },
        {
          label: "Payments",
          href: `${base}/settings/payments`,
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          label: "Integrations",
          href: `${base}/settings/integrations`,
          icon: <KeyRound className="h-4 w-4" />,
        },
        {
          label: "Consultation",
          href: `${base}/settings/consultation`,
          icon: <CalendarCheck className="h-4 w-4" />,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === base) return pathname === base || pathname === `${base}/`;
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link href="/" className="font-heading text-primary text-lg font-bold">
          Licoricé Admin
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <SidebarGroup key={group.title} group={group} isActive={isActive} />
        ))}
      </nav>
    </aside>
  );
}

function SidebarGroup({
  group,
  isActive,
}: {
  group: NavGroup;
  isActive: (href: string) => boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-2 py-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
      >
        {group.title}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && (
        <ul className="space-y-0.5">
          {group.items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
