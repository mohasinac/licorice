"use server";

import { z } from "zod";
import type { CorporateInquiry } from "@/lib/types";

const corporateInquirySchema = z.object({
  companyName: z.string().min(2, "Company name is required").max(200),
  contactPerson: z.string().min(2, "Contact person is required").max(100),
  designation: z.string().max(100).optional(),
  email: z.string().email("Valid email required"),
  phone: z
    .string()
    .min(10, "Valid phone required")
    .max(15)
    .regex(/^\+?[\d\s-]+$/, "Invalid phone number"),
  units: z.number().int().min(1, "Units must be at least 1"),
  budgetPerUnit: z.number().min(0).optional(),
  totalBudget: z.number().min(0).optional(),
  deliveryDateRequired: z.string().optional(),
  customBranding: z.boolean(),
  message: z.string().max(2000).optional(),
});

export type CorporateInquiryInput = z.infer<typeof corporateInquirySchema>;
export type CorporateInquiryResult =
  | { success: true; inquiryId: string }
  | { success: false; error: string };

export async function submitCorporateInquiry(input: unknown): Promise<CorporateInquiryResult> {
  const parsed = corporateInquirySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const data = parsed.data;

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    const doc: Omit<CorporateInquiry, "id"> = {
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      designation: data.designation,
      email: data.email,
      phone: data.phone,
      units: data.units,
      budgetPerUnit: data.budgetPerUnit,
      totalBudget: data.totalBudget,
      deliveryDateRequired: data.deliveryDateRequired,
      customBranding: data.customBranding,
      message: data.message,
      status: "new",
      createdAt: FieldValue.serverTimestamp() as unknown as Date,
      updatedAt: FieldValue.serverTimestamp() as unknown as Date,
    };

    const ref = await adminDb.collection("corporateInquiries").add(doc);

    // Admin alert email (non-blocking)
    try {
      const resendKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? "orders@licoriceherbal.in";
      const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").filter(Boolean);
      if (resendKey && adminEmails.length) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: fromEmail,
          to: adminEmails,
          subject: `New Corporate Gifting Inquiry — ${data.companyName}`,
          html: `<p><strong>Company:</strong> ${data.companyName}<br/><strong>Contact:</strong> ${data.contactPerson} (${data.designation ?? "—"})<br/><strong>Email:</strong> ${data.email}<br/><strong>Phone:</strong> ${data.phone}<br/><strong>Units:</strong> ${data.units}<br/><strong>Custom Branding:</strong> ${data.customBranding ? "Yes" : "No"}<br/><strong>Message:</strong> ${data.message ?? "—"}</p>`,
        });
      }
    } catch (emailErr) {
      console.warn("[corporate] Admin email failed (non-fatal):", emailErr);
    }

    // Customer acknowledgement (non-blocking)
    try {
      const resendKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? "orders@licoriceherbal.in";
      if (resendKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: fromEmail,
          to: data.email,
          subject: "Corporate Gifting Inquiry Received — Licorice Herbals",
          html: `<p>Hi ${data.contactPerson},</p><p>Thank you for your corporate gifting enquiry. We've received your request for <strong>${data.units} units</strong> from <strong>${data.companyName}</strong>.</p><p>Our team will get back to you within 1–2 business days with a customised quote.</p><p>Warm regards,<br/>Licorice Herbals Team</p>`,
        });
      }
    } catch (emailErr) {
      console.warn("[corporate] Customer email failed (non-fatal):", emailErr);
    }

    return { success: true, inquiryId: ref.id };
  } catch (err) {
    console.error("[corporate] submitCorporateInquiry failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
