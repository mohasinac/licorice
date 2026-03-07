import type { Metadata } from "next";
import { ContactPageClient } from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact Us — Licorice Herbals",
  description:
    "Get in touch with Licorice Herbals for product queries, order support, or partnership enquiries.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
