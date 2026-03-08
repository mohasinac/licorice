import { CheckCircle, Circle, Package, Truck, XCircle } from "lucide-react";
import type { OrderEvent } from "@/lib/types";
import { toSafeDate } from "@/lib/utils";

interface Props {
  events: OrderEvent[];
}

function iconForStatus(status: string) {
  if (status === "delivered") return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
  if (status === "cancelled" || status === "refunded")
    return <XCircle className="h-5 w-5 text-red-400 dark:text-red-500" />;
  if (status === "shipped" || status === "out_for_delivery")
    return <Truck className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
  if (status === "processing" || status === "ready_to_ship")
    return <Package className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
  return <Circle className="h-5 w-5 text-amber-500" />;
}

function formatDate(val: unknown): string {
  const d = toSafeDate(val);
  return d ? d.toLocaleString("en-IN") : "";
}

export function OrderTimeline({ events }: Props) {
  if (events.length === 0)
    return <p className="text-muted-foreground text-sm">No timeline events yet.</p>;

  return (
    <ol className="space-y-6">
      {events.map((event, i) => (
        <li key={i} className="flex gap-3">
          <div className="mt-0.5 shrink-0">{iconForStatus(event.status)}</div>
          <div>
            <p className="text-foreground font-medium capitalize">
              {event.status.replace(/_/g, " ")}
            </p>
            {event.description && (
              <p className="text-muted-foreground text-sm">{event.description}</p>
            )}
            <p className="text-muted-foreground text-xs">
              {formatDate(event.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
