// app/[locale]/(admin)/admin/consultations/page.tsx — Admin consultations list
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { ConsultationCard } from "@/components/admin/ConsultationCard";
import type { ConsultationBooking } from "@/lib/types";

export const metadata: Metadata = { title: "Consultations — Admin" };

async function getConsultations(): Promise<ConsultationBooking[]> {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("consultations")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ConsultationBooking, "id">),
    }));
  } catch {
    return [];
  }
}

export default async function AdminConsultationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const consultations = await getConsultations();

  const upcoming = consultations.filter((c) => ["pending", "confirmed"].includes(c.status));
  const past = consultations.filter((c) => ["completed", "cancelled"].includes(c.status));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href={`/${locale}/admin`}
        className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <Calendar className="text-primary h-6 w-6" />
        <h1 className="font-heading text-foreground text-2xl font-bold">Consultations</h1>
        {upcoming.length > 0 && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            {upcoming.length} upcoming
          </span>
        )}
      </div>

      {consultations.length === 0 && (
        <div className="bg-surface rounded-2xl p-10 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">No consultation bookings yet.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
            Upcoming
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((c) => (
              <ConsultationCard key={c.id} consultation={c} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
            Past
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {past.map((c) => (
              <ConsultationCard key={c.id} consultation={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
