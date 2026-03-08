"use client";

import { useState } from "react";
import { CheckCircle, XCircle, CircleCheckBig, Video, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ConsultationBooking } from "@/lib/types";
import { apiFetch } from "@/lib/api-fetch";

interface Props {
  consultation: ConsultationBooking;
}

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"] as const;

export function ConsultationCard({ consultation }: Props) {
  const [status, setStatus] = useState(consultation.status);
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    try {
      await apiFetch(`/api/admin/consultations/${consultation.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus as typeof status);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-foreground font-semibold">{consultation.name}</p>
          <p className="text-muted-foreground text-sm">{consultation.email}</p>
          {consultation.phone && (
            <p className="text-muted-foreground text-sm">{consultation.phone}</p>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <span className="text-muted-foreground text-xs">Date</span>
          <p className="text-foreground">{consultation.preferredDate}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Time</span>
          <p className="text-foreground">{consultation.preferredTime}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Mode</span>
          <p className="text-foreground flex items-center gap-1">
            {consultation.mode === "in-person" ? (
              <>
                <MapPin className="h-3.5 w-3.5" /> In-Person
              </>
            ) : (
              <>
                <Video className="h-3.5 w-3.5" /> Remote
              </>
            )}
          </p>
        </div>
        {consultation.concern && consultation.concern.length > 0 && (
          <div className="sm:col-span-2">
            <span className="text-muted-foreground text-xs">Concerns</span>
            <p className="text-foreground">{consultation.concern.join(", ")}</p>
          </div>
        )}
        {consultation.message && (
          <div className="sm:col-span-2">
            <span className="text-muted-foreground text-xs">Message</span>
            <p className="text-foreground">{consultation.message}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {status === "pending" && (
          <>
            <button
              onClick={() => updateStatus("confirmed")}
              disabled={loading}
              className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Confirm
            </button>
            <button
              onClick={() => updateStatus("cancelled")}
              disabled={loading}
              className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="h-3.5 w-3.5" /> Cancel
            </button>
          </>
        )}
        {status === "confirmed" && (
          <button
            onClick={() => updateStatus("completed")}
            disabled={loading}
            className="flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <CircleCheckBig className="h-3.5 w-3.5" /> Mark Complete
          </button>
        )}
        {!["completed", "cancelled"].includes(status) && (
          <select
            value={status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={loading}
            className="bg-surface text-foreground rounded-lg border px-2 py-1.5 text-xs disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
