// app/[locale]/(admin)/admin/support/[ticketId]/page.tsx - Admin ticket detail
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminTicketActions } from "./AdminTicketActions";
import type { SupportTicket, TicketMessage } from "@/lib/types";

export const metadata: Metadata = { title: "Support Ticket — Admin" };

async function getAdminTicket(
  ticketId: string,
): Promise<{ ticket: SupportTicket; messages: TicketMessage[] } | null> {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const ticketDoc = await adminDb.collection("supportTickets").doc(ticketId).get();
    if (!ticketDoc.exists) return null;

    const messagesSnap = await adminDb
      .collection("supportTickets")
      .doc(ticketId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages: TicketMessage[] = messagesSnap.docs.map((d) => d.data() as TicketMessage);
    const ticket: SupportTicket = {
      id: ticketDoc.id,
      ...(ticketDoc.data() as Omit<SupportTicket, "id">),
    };
    return { ticket, messages };
  } catch {
    return null;
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  order: "Order Issue",
  shipping: "Shipping",
  product: "Product Query",
  return: "Return / Refund",
  payment: "Payment",
  consultation: "Consultation",
  other: "Other",
};

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ locale: string; ticketId: string }>;
}) {
  const { locale, ticketId } = await params;
  const result = await getAdminTicket(ticketId);

  // In mock mode (no Firebase) show placeholder
  if (!result) {
    notFound();
  }

  const { ticket, messages } = result;
  const data = ticket as SupportTicket & { guestEmail?: string; guestName?: string };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href={`/${locale}/admin/support`}
        className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Inbox
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main thread */}
        <div className="lg:col-span-2">
          <div className="bg-surface mb-6 rounded-2xl p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="font-heading text-foreground text-xl font-bold">{ticket.subject}</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  <span className="font-mono font-semibold text-green-700">
                    {ticket.ticketNumber}
                  </span>
                  {" · "}
                  {CATEGORY_LABELS[ticket.category] ?? ticket.category}
                </p>
              </div>
              <StatusBadge status={ticket.status} type="ticket" />
            </div>
            <AdminTicketActions ticket={ticket} messages={messages} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface rounded-2xl p-5 shadow-sm">
            <h2 className="text-foreground mb-3 text-sm font-semibold">Customer</h2>
            <dl className="space-y-2 text-sm">
              {data.guestName && (
                <div>
                  <dt className="text-muted-foreground text-xs">Name</dt>
                  <dd className="text-foreground">{data.guestName}</dd>
                </div>
              )}
              {data.guestEmail && (
                <div>
                  <dt className="text-muted-foreground text-xs">Email</dt>
                  <dd className="text-foreground break-all">{data.guestEmail}</dd>
                </div>
              )}
              {ticket.userId && (
                <div>
                  <dt className="text-muted-foreground text-xs">User ID</dt>
                  <dd className="text-foreground font-mono text-xs">{ticket.userId}</dd>
                </div>
              )}
              {ticket.orderId && (
                <div>
                  <dt className="text-muted-foreground text-xs">Related Order</dt>
                  <dd>
                    <Link
                      href={`/${locale}/admin/orders/${ticket.orderId}`}
                      className="text-primary text-xs hover:underline"
                    >
                      View Order →
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-surface rounded-2xl p-5 shadow-sm">
            <h2 className="text-foreground mb-3 text-sm font-semibold">Ticket Info</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground text-xs">Priority</dt>
                <dd className="text-foreground capitalize">{ticket.priority}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Messages</dt>
                <dd className="text-foreground">{messages.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
