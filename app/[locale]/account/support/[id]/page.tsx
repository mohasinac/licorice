// app/[locale]/account/support/[id]/page.tsx - Customer ticket detail
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getServerUser } from "@/lib/auth";
import { TicketThread } from "@/components/support/TicketThread";
import type { SupportTicket, TicketMessage } from "@/lib/types";

export const metadata: Metadata = { title: "Support Ticket" };

async function getTicketWithMessages(
  ticketId: string,
  userId: string,
): Promise<{ ticket: SupportTicket; messages: TicketMessage[] } | null> {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const ticketDoc = await adminDb.collection("supportTickets").doc(ticketId).get();
    if (!ticketDoc.exists) return null;

    const data = ticketDoc.data() as Omit<SupportTicket, "id">;
    if (data.userId !== userId) return null; // not owner

    const messagesSnap = await adminDb
      .collection("supportTickets")
      .doc(ticketId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages: TicketMessage[] = messagesSnap.docs
      .map((d) => d.data() as TicketMessage)
      .filter((m) => m.isInternalNote !== true); // customers don't see internal notes

    return { ticket: { id: ticketDoc.id, ...data }, messages };
  } catch (err) {
    console.error("[account/support/[id]] fetch failed:", err);
    return null;
  }
}

export default async function AccountTicketDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await getServerUser();
  if (!user) redirect(`/${locale}/login`);

  const result = await getTicketWithMessages(id, user.uid);
  if (!result) notFound();

  const { ticket, messages } = result;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/${locale}/account/support`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> My Tickets
        </Link>
      </div>
      <TicketThread ticket={ticket} messages={messages} allowReply={true} />
    </div>
  );
}
