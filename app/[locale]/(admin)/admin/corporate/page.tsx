// app/[locale]/(admin)/admin/corporate/page.tsx — Admin corporate inquiries
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { CorporateInquiry } from "@/lib/types";

export const metadata: Metadata = { title: "Corporate Inquiries — Admin" };

async function getCorporateInquiries(): Promise<CorporateInquiry[]> {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("corporateInquiries")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<CorporateInquiry, "id">),
    }));
  } catch {
    return [];
  }
}

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  won: "Won",
  lost: "Lost",
};

const STATUS_OPTIONS = ["new", "in_progress", "won", "lost"] as const;

async function patchStatus(id: string, status: string, adminNote?: string) {
  "use server";
  // Server action is handled client-side via fetch; this is a placeholder
  void [id, status, adminNote];
}

export default async function AdminCorporatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const inquiries = await getCorporateInquiries();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href={`/${locale}/admin`}
        className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <Briefcase className="text-primary h-6 w-6" />
        <h1 className="font-heading text-foreground text-2xl font-bold">Corporate Inquiries</h1>
        {inquiries.filter((i) => i.status === "new").length > 0 && (
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            {inquiries.filter((i) => i.status === "new").length} new
          </span>
        )}
      </div>

      {inquiries.length === 0 && (
        <div className="bg-surface rounded-2xl p-10 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">No corporate inquiries yet.</p>
        </div>
      )}

      {inquiries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="bg-surface w-full rounded-2xl shadow-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium tracking-wider uppercase">
                <th className="text-muted-foreground px-4 py-3">Company</th>
                <th className="text-muted-foreground px-4 py-3">Contact</th>
                <th className="text-muted-foreground px-4 py-3">Units</th>
                <th className="text-muted-foreground px-4 py-3">Budget/Unit</th>
                <th className="text-muted-foreground px-4 py-3">Branding</th>
                <th className="text-muted-foreground px-4 py-3">Status</th>
                <th className="text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <CorporateRow key={inquiry.id} inquiry={inquiry} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CorporateRow({ inquiry }: { inquiry: CorporateInquiry }) {
  return (
    <tr className="hover:bg-background border-b text-sm last:border-0">
      <td className="px-4 py-3">
        <p className="text-foreground font-medium">{inquiry.companyName}</p>
        {inquiry.deliveryDateRequired && (
          <p className="text-muted-foreground text-xs">By: {inquiry.deliveryDateRequired}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <p className="text-foreground">{inquiry.contactPerson}</p>
        <p className="text-muted-foreground text-xs">{inquiry.email}</p>
        <p className="text-muted-foreground text-xs">{inquiry.phone}</p>
      </td>
      <td className="px-4 py-3 text-right">{inquiry.units}</td>
      <td className="px-4 py-3 text-right">
        {inquiry.budgetPerUnit ? `₹${inquiry.budgetPerUnit}` : "—"}
      </td>
      <td className="px-4 py-3">{inquiry.customBranding ? "Yes" : "No"}</td>
      <td className="px-4 py-3">
        <StatusBadge status={inquiry.status} />
      </td>
      <td className="px-4 py-3">
        <CorporateStatusSelect inquiry={inquiry} />
      </td>
    </tr>
  );
}

function CorporateStatusSelect({ inquiry }: { inquiry: CorporateInquiry }) {
  // Rendered as client interactivity through inline form
  return (
    <form
      action={async (formData: FormData) => {
        "use server";
        const status = formData.get("status") as string;
        try {
          const { adminDb } = await import("@/lib/firebase/admin");
          await adminDb.collection("corporateInquiries").doc(inquiry.id).update({ status });
        } catch {
          // ignore
        }
      }}
      className="flex items-center gap-2"
    >
      <select
        name="status"
        defaultValue={inquiry.status}
        className="bg-surface text-foreground rounded-lg border px-2 py-1 text-xs"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium hover:bg-gray-200"
      >
        Save
      </button>
    </form>
  );
}
