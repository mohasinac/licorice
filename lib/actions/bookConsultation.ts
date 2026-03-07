"use server";

import { z } from "zod";
import { isFirebaseReady } from "@/lib/utils";
import type { ConsultationBooking } from "@/lib/types";

const bookConsultationSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email required"),
  phone: z
    .string()
    .min(10, "Valid phone required")
    .max(15)
    .regex(/^\+?[\d\s-]+$/, "Invalid phone number"),
  concern: z.array(z.string()).min(1, "Select at least one concern"),
  preferredDate: z.string().min(1, "Date is required"),
  preferredTime: z.string().min(1, "Time slot is required"),
  message: z.string().max(1000).optional(),
});

export type BookConsultationInput = z.infer<typeof bookConsultationSchema>;
export type BookConsultationResult =
  | { success: true; bookingId: string }
  | { success: false; error: string };

export async function bookConsultation(input: unknown): Promise<BookConsultationResult> {
  const parsed = bookConsultationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const data = parsed.data;

  if (!isFirebaseReady()) {
    console.log("[consultation] Mock booking:", data);
    return { success: true, bookingId: "mock-booking-id" };
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    const doc: Omit<ConsultationBooking, "id"> = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      concern: data.concern,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      message: data.message,
      status: "pending",
      createdAt: FieldValue.serverTimestamp() as unknown as Date,
    };

    const ref = await adminDb.collection("consultations").add(doc);

    // Optionally send confirmation email via Resend (non-blocking)
    try {
      const resendKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? "orders@licoriceherbal.in";
      if (resendKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: fromEmail,
          to: data.email,
          subject: "Consultation Booking Received — Licorice Herbals",
          html: `<p>Hi ${data.name},</p><p>Thank you for booking a free consultation with Licorice Herbals. We've received your request for <strong>${data.preferredDate}</strong> at <strong>${data.preferredTime}</strong>.</p><p>We'll confirm your slot within 24 hours via email or phone.</p><p>Warm regards,<br/>Licorice Herbals Team</p>`,
        });
      }
    } catch (emailErr) {
      console.warn("[consultation] Email send failed (non-fatal):", emailErr);
    }

    return { success: true, bookingId: ref.id };
  } catch (err) {
    console.error("[consultation] bookConsultation failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
