import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/db";
import { ConsultationForm } from "./ConsultationForm";

export const metadata: Metadata = {
  title: "Free Skin & Hair Consultation — Licorice Herbals",
  description:
    "Book a free 30-minute personalised Ayurvedic consultation with our expert. Get customised skincare and hair care recommendations.",
};

export default async function ConsultationPage() {
  const config = await getSiteConfig();
  const consultantName = config?.consultantName ?? "Dr. Ayesha Sharma";
  const consultantBio =
    config?.consultantBio ??
    "Certified Ayurvedic practitioner with 10+ years of experience in herbal skincare and hair care.";

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <div className="bg-primary/5 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-primary mb-2 text-sm font-semibold tracking-widest uppercase">
            Complimentary
          </p>
          <h1 className="font-heading text-foreground text-4xl font-bold">
            Free Skin &amp; Hair Consultation
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Get a personalised Ayurvedic skincare and hair care plan — completely free.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <ConsultationForm consultantName={consultantName} consultantBio={consultantBio} />
      </div>
    </div>
  );
}
