import type { Metadata } from "next";
import { getConsultationConfig, getConcerns } from "@/lib/db";
import { ConsultationForm } from "./ConsultationForm";

export const metadata: Metadata = {
  title: "Free Skin & Hair Consultation — Licorice Herbals",
  description:
    "Book a free 30-minute personalised Ayurvedic consultation with our expert. Get customised skincare and hair care recommendations.",
};

export default async function ConsultationPage() {
  const [config, concerns] = await Promise.all([getConsultationConfig(), getConcerns()]);
  const consultantName = config.consultantName;
  const consultantBio = config.consultantBio;
  const clinicName = config.clinicName;
  const clinicAddress = config.clinicAddress;
  const clinicMapUrl = config.clinicMapUrl;

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <div className="ayur-hero">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-accent mb-3 text-sm font-semibold tracking-widest uppercase">
            Complimentary
          </p>
          <h1 className="font-heading text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Free Skin &amp; Hair Consultation
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Get a personalised Ayurvedic skincare and hair care plan — completely free.
          </p>
          <hr className="ayur-divider mt-8 w-32" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <ConsultationForm
          consultantName={consultantName}
          consultantBio={consultantBio}
          clinicName={clinicName}
          clinicAddress={clinicAddress}
          clinicMapUrl={clinicMapUrl}
          concerns={concerns}
        />
      </div>
    </div>
  );
}
