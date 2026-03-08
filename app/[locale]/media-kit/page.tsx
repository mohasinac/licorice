import type { Metadata } from "next";
import { BRAND_NAME } from "@/constants/site";
import { getMediaKitFiles } from "@/lib/db";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaKitDownloads } from "./MediaKitDownloads";

export const metadata: Metadata = {
  title: `Media Kit — ${BRAND_NAME}`,
  description:
    "Download official brand assets, logos, product images, and press materials for Licorice Herbals.",
};

export default async function MediaKitPage() {
  const files = await getMediaKitFiles(true);

  return (
    <div className="bg-background">
      {/* Hero */}
      <div className="ayur-hero py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-accent mb-3 text-sm font-semibold tracking-widest uppercase">
            For Press & Partners
          </p>
          <h1 className="font-heading text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Media Kit
          </h1>
          <p className="text-muted-foreground mt-5 text-xl leading-relaxed">
            Download official {BRAND_NAME} brand assets, logos, product images, and press materials.
          </p>
          <hr className="ayur-divider mt-8 w-32" />
        </div>
      </div>

      {/* Downloads */}
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        {files.length === 0 ? (
          <div className="text-center">
            <SectionHeading title="Coming Soon" align="center" className="mb-4" />
            <p className="text-muted-foreground">
              Our media kit is being updated. Please check back soon or contact us for brand assets.
            </p>
          </div>
        ) : (
          <MediaKitDownloads files={files} />
        )}

        {/* Contact section */}
        <div className="mt-20 rounded-2xl border border-border bg-card p-8 text-center">
          <SectionHeading title="Need Something Specific?" align="center" className="mb-4" />
          <p className="text-muted-foreground mx-auto max-w-lg">
            Looking for custom brand assets, high-resolution product shots, or interview
            opportunities? Reach out to our press team.
          </p>
          <a
            href="mailto:press@licoriceherbal.in"
            className="bg-primary text-primary-foreground mt-6 inline-block rounded-xl px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Contact Press Team
          </a>
        </div>
      </div>
    </div>
  );
}
