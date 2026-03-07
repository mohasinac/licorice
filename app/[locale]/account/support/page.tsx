// app/[locale]/account/support/page.tsx - Customer support tickets list
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { isFirebaseReady } from "@/lib/db";
import { TicketCard } from "@/components/support/TicketCard";
import type { SupportTicket } from "@/lib/types";
import { PlusCircle, MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "My Support Tickets" };

async function getUserTickets(userId: string): Promise<SupportTicket[]> {
  if (!isFirebaseReady()) return [];
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("supportTickets")
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc")
      .limit(50)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SupportTicket, "id">) }));
  } catch {
    return [];
  }
}

export default async function AccountSupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getServerUser();
  if (!user) redirect(`/${locale}/login`);

  const tickets = await getUserTickets(user.uid);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-foreground text-2xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {tickets.length > 0
              ? `${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`
              : "No tickets yet"}
          </p>
        </div>
        <Link
          href={`/${locale}/contact`}
          className="bg-primary text-primary-foreground hover:bg-secondary flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          New Ticket
        </Link>
      </div>

      {tickets.length > 0 ? (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="bg-surface flex flex-col items-center rounded-2xl px-6 py-16 text-center shadow-sm">
          <MessageCircle className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="text-foreground font-medium">No support tickets yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Need help? Create a new ticket and we&apos;ll respond within 1 business day.
          </p>
          <Link
            href={`/${locale}/contact`}
            className="bg-primary text-primary-foreground hover:bg-secondary mt-5 rounded-xl px-6 py-2 text-sm font-medium transition-colors"
          >
            Contact Support
          </Link>
        </div>
      )}
    </div>
  );
}
