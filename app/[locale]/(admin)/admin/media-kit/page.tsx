import { Metadata } from "next";
import { getMediaKitFiles } from "@/lib/db";
import { AdminMediaKitManager } from "./AdminMediaKitManager";

export const metadata: Metadata = {
  title: "Media Kit — Admin",
};

export default async function AdminMediaKitPage() {
  const files = await getMediaKitFiles();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-foreground text-3xl font-bold">Media Kit</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {files.length} file{files.length !== 1 ? "s" : ""} — manage downloadable brand assets for
          press and partners
        </p>
      </div>
      <AdminMediaKitManager initialFiles={files} />
    </div>
  );
}
