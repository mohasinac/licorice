"use client";

import { Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import type { PaymentSettings } from "@/lib/types";
import { WHATSAPP_NUMBER } from "@/constants/site";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

interface WhatsAppPaymentInstructionsProps {
  orderNumber: string;
  total: number;
  settings: Pick<
    PaymentSettings,
    "whatsappUpiId" | "whatsappBusinessNumber" | "whatsappQrImageUrl"
  >;
}

export function WhatsAppPaymentInstructions({
  orderNumber,
  total,
  settings,
}: WhatsAppPaymentInstructionsProps) {
  const upiId = settings.whatsappUpiId ?? "licoriceherbal@upi";
  const whatsappNumber = settings.whatsappBusinessNumber ?? WHATSAPP_NUMBER;
  const message = encodeURIComponent(
    `Hi, I've paid ${fmt(total)} for Order #${orderNumber}. Please find screenshot attached.`,
  );
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`;

  function copyUpi() {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied!");
  }

  return (
    <div className="border-border space-y-6 rounded-2xl border p-6">
      <div>
        <h2 className="font-heading text-foreground mb-1 text-2xl font-bold">
          Payment Instructions
        </h2>
        <p className="text-muted-foreground text-sm">
          Order #{orderNumber} — Amount: {fmt(total)}
        </p>
      </div>

      <ol className="text-foreground space-y-3 text-sm">
        {[
          "Open your UPI app (PhonePe, Google Pay, Paytm, etc.)",
          `Send ${fmt(total)} to the UPI ID below`,
          "Open WhatsApp and send us the payment screenshot",
          "Your order will be confirmed within 2–4 hours",
        ].map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="bg-primary text-primary-foreground flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-bold">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {/* UPI ID */}
      <div className="bg-muted rounded-xl p-4">
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
          UPI ID
        </p>
        <div className="flex items-center gap-2">
          <code className="text-foreground flex-1 font-mono text-lg font-semibold">{upiId}</code>
          <button
            onClick={copyUpi}
            className="text-primary hover:text-primary/80 rounded-lg p-1.5 transition-colors"
            aria-label="Copy UPI ID"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* QR Code (optional) */}
      {settings.whatsappQrImageUrl && (
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.whatsappQrImageUrl}
            alt="UPI QR Code"
            className="h-48 w-48 rounded-xl border object-contain"
          />
        </div>
      )}

      <Button asChild className="w-full" size="lg">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" />
          Open WhatsApp
        </a>
      </Button>
    </div>
  );
}
