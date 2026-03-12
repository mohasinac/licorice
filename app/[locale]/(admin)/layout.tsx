import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex h-screen overflow-hidden bg-[var(--background)]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}
