// app/[locale]/(admin)/admin/support/page.tsx - Admin support ticket inbox
import { Metadata } from "next";
import { TicketInbox } from "@/components/admin/TicketInbox";
import type { SupportTicket } from "@/lib/types";

export const metadata: Metadata = { title: "Support Inbox — Admin" };

async function getAllTickets(): Promise<SupportTicket[]> {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("supportTickets")
      .orderBy("updatedAt", "desc")
      .limit(200)
      .get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...(data as Omit<SupportTicket, "id">),
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
        resolvedAt: data.resolvedAt?.toDate?.() ?? null,
      };
    });
  } catch {
    return [];
  }
}

export default async function AdminSupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tickets = await getAllTickets();
  const openCount = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-foreground text-3xl font-bold">Support Inbox</h1>
          {openCount > 0 && (
            <span className="rounded-full bg-red-100 dark:bg-red-950/40 px-3 py-1 text-sm font-bold text-red-700 dark:text-red-400">
              {openCount} open
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-sm">{tickets.length} total tickets</p>
      </div>
      <TicketInbox tickets={tickets} locale={locale} />
    </div>
  );
}
