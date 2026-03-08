// app/[locale]/account/support/page.tsx - Customer support tickets list
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getServerUser } from "@/lib/auth";
import { TicketCard } from "@/components/support/TicketCard";
import type { SupportTicket } from "@/lib/types";
import { PlusCircle, MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "My Support Tickets" };

async function getUserTickets(userId: string): Promise<SupportTicket[]> {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("supportTickets")
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc")
      .limit(50)
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

export default async function AccountSupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("account");
  const user = await getServerUser();
  if (!user) redirect(`/${locale}/login`);

  const tickets = await getUserTickets(user.uid);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-foreground text-2xl font-bold">{t("supportTitle")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {tickets.length > 0
              ? `${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`
              : t("noTickets")}
          </p>
        </div>
        <Link
          href={`/${locale}/contact`}
          className="bg-primary text-primary-foreground hover:bg-secondary flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          {t("newTicket")}
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
          <p className="text-foreground font-medium">{t("noTickets")}</p>
          <p className="text-muted-foreground mt-1 text-sm">{t("needHelpCreate")}</p>
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
