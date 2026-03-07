import type { Metadata } from "next";
import { getNewsletterSubscribers } from "@/lib/db";
import { Mail, Users, Download } from "lucide-react";

export const metadata: Metadata = { title: "Newsletter — Admin — Licorice Herbals" };

export default async function AdminNewsletterPage() {
  const subscribers = await getNewsletterSubscribers();

  // Build CSV download link (inline data URI for simplicity — no file creation)
  const csvRows = [
    "Email,Subscribed At",
    ...subscribers.map((s) => `${s.email},${s.subscribedAt.toISOString()}`),
  ];
  const csvData = `data:text/csv;charset=utf-8,${encodeURIComponent(csvRows.join("\n"))}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-foreground text-2xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <a
          href={csvData}
          download="newsletter-subscribers.csv"
          className="bg-primary text-primary-foreground hover:bg-secondary flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border-border flex items-center gap-4 rounded-2xl border bg-white p-5">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <Users className="text-primary h-5 w-5" />
          </div>
          <div>
            <p className="text-foreground text-lg font-bold">{subscribers.length}</p>
            <p className="text-muted-foreground text-xs">Total Subscribers</p>
          </div>
        </div>
        <div className="border-border flex items-center gap-4 rounded-2xl border bg-white p-5">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <Mail className="text-primary h-5 w-5" />
          </div>
          <div>
            <p className="text-foreground text-lg font-bold">
              {
                subscribers.filter((s) => {
                  const d = new Date();
                  d.setDate(d.getDate() - 30);
                  return s.subscribedAt >= d;
                }).length
              }
            </p>
            <p className="text-muted-foreground text-xs">Last 30 Days</p>
          </div>
        </div>
      </div>

      {/* Subscriber table */}
      {subscribers.length === 0 ? (
        <div className="bg-surface flex flex-col items-center rounded-2xl py-16 text-center shadow-sm">
          <Mail className="text-muted-foreground mb-3 h-10 w-10" />
          <p className="text-foreground font-medium">No subscribers yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Subscribers will appear here once users sign up via the newsletter form.
          </p>
        </div>
      ) : (
        <div className="bg-surface overflow-hidden rounded-2xl shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-medium tracking-wider uppercase">
                <th className="text-muted-foreground px-4 py-3">#</th>
                <th className="text-muted-foreground px-4 py-3">Email</th>
                <th className="text-muted-foreground px-4 py-3">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub, i) => (
                <tr key={sub.email} className="hover:bg-background border-b last:border-0">
                  <td className="text-muted-foreground px-4 py-3 text-sm">{i + 1}</td>
                  <td className="text-foreground px-4 py-3 text-sm font-medium">{sub.email}</td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {sub.subscribedAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
