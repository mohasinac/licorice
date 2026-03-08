"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Calendar, Clock, CheckCircle2, Leaf, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { sanitizeHtml } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { bookConsultation } from "@/lib/actions/bookConsultation";
import type { Concern } from "@/lib/types";

const TIME_SLOTS = [
  "9:30 AM – 10:00 AM",
  "10:00 AM – 10:30 AM",
  "11:00 AM – 11:30 AM",
  "12:00 PM – 12:30 PM",
  "2:00 PM – 2:30 PM",
  "3:00 PM – 3:30 PM",
  "4:00 PM – 4:30 PM",
  "5:00 PM – 5:30 PM",
];

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required").max(15),
  concern: z.array(z.string()).min(1, "Select at least one concern"),
  preferredDate: z.string().min(1, "Date is required"),
  preferredTime: z.string().min(1, "Time slot is required"),
  mode: z.enum(["remote", "in-person"]),
  message: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  consultantName: string;
  consultantBio: string;
  clinicName: string;
  clinicAddress: string;
  clinicMapUrl?: string;
  concerns: Concern[];
}

// Get tomorrow's date in YYYY-MM-DD format (earliest bookable date)
function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function ConsultationForm({
  consultantName,
  consultantBio,
  clinicName,
  clinicAddress,
  clinicMapUrl,
  concerns,
}: Props) {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { concern: [], mode: "remote" },
  });

  const selectedConcerns = watch("concern") ?? [];
  const selectedMode = watch("mode");

  function toggleConcern(id: string) {
    const next = selectedConcerns.includes(id)
      ? selectedConcerns.filter((c) => c !== id)
      : [...selectedConcerns, id];
    setValue("concern", next, { shouldValidate: true });
  }

  async function onSubmit(data: FormData) {
    const result = await bookConsultation(data);
    if (result.success) {
      setSuccess(true);
      toast.success("Booking received! We'll confirm within 24 hours.");
    } else {
      toast.error(result.error);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="font-heading text-foreground text-2xl font-bold">Booking Received!</h2>
        <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
          Thank you for booking a free consultation with Licorice Herbals. We&apos;ll confirm your
          slot within 24 hours via email or phone.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      {/* Consultant bio */}
      <div className="flex flex-col gap-6">
        <div className="ayur-card rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
              <Leaf className="text-primary h-8 w-8" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold">{consultantName}</h3>
              <p className="text-accent text-sm font-semibold">Ayurvedic Practitioner</p>
            </div>
          </div>
          <div
            className="text-muted-foreground text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(consultantBio) }}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-4 w-4 text-green-700" />
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">Completely Free</p>
              <p className="text-muted-foreground text-xs">No charges, no strings attached</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
              <Clock className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">30 Minutes</p>
              <p className="text-muted-foreground text-xs">
                Focused consultation on your specific concerns
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
              <Calendar className="h-4 w-4 text-purple-700" />
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">Mon – Sat</p>
              <p className="text-muted-foreground text-xs">9:30 AM – 6:30 PM IST</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Consultation mode toggle */}
        <div>
          <p className="text-foreground mb-2 text-sm font-medium">
            Consultation Type <span className="text-destructive ml-0.5">*</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue("mode", "remote", { shouldValidate: true })}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                selectedMode === "remote"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              <Video className="h-4 w-4" /> Remote (Phone / Video)
            </button>
            <button
              type="button"
              onClick={() => setValue("mode", "in-person", { shouldValidate: true })}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                selectedMode === "in-person"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              <MapPin className="h-4 w-4" /> In-Person
            </button>
          </div>
          {selectedMode === "in-person" && (
            <div className="mt-3 rounded-xl border border-primary/15 bg-primary/5 p-3">
              <p className="text-foreground text-sm font-semibold">{clinicName}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">{clinicAddress}</p>
              {clinicMapUrl && (
                <a
                  href={clinicMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary mt-1.5 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                >
                  <MapPin className="h-3 w-3" /> View on Google Maps
                </a>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full Name"
            placeholder="Priya Sharma"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Phone"
            placeholder="+91 98765 43210"
            type="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
        <Input
          label="Email"
          placeholder="priya@example.com"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Concerns */}
        <div>
          <p className="text-foreground mb-2 text-sm font-medium">
            Skin / Hair Concerns <span className="text-destructive ml-0.5">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {concerns.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleConcern(c.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-all duration-200 ${
                  selectedConcerns.includes(c.id)
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          {errors.concern && (
            <p className="text-destructive mt-1 text-xs">{errors.concern.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Preferred Date"
            type="date"
            min={getTomorrowDate()}
            error={errors.preferredDate?.message}
            {...register("preferredDate")}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Preferred Time <span className="text-destructive">*</span>
            </label>
            <select
              {...register("preferredTime")}
              className="border-border text-foreground w-full rounded-xl border bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="">Select time slot</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.preferredTime && (
              <p className="text-destructive mt-1 text-xs">{errors.preferredTime.message}</p>
            )}
          </div>
        </div>

        <Textarea
          label="Message (Optional)"
          placeholder="Tell us more about your concerns or any specific questions you have…"
          rows={3}
          {...register("message")}
        />

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Book Free Consultation
        </Button>
      </form>
    </div>
  );
}
