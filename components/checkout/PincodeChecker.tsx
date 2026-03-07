"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ServiceabilityResult {
  serviceable: boolean;
  eta?: string;
  codAvailable?: boolean;
  error?: string;
}

interface PincodeCheckerProps {
  pincode: string;
  onResult?: (result: ServiceabilityResult) => void;
}

export function PincodeChecker({ pincode, onResult }: PincodeCheckerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceabilityResult | null>(null);

  async function check() {
    if (!/^\d{6}$/.test(pincode)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pincode-check?pincode=${pincode}`);
      const data: ServiceabilityResult = await res.json();
      setResult(data);
      onResult?.(data);
    } catch {
      const fallback = { serviceable: false, error: "Could not check serviceability." };
      setResult(fallback);
      onResult?.(fallback);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={check}
        loading={loading}
        disabled={!/^\d{6}$/.test(pincode)}
      >
        Check Delivery
      </Button>

      {result && (
        <div
          className={[
            "flex items-start gap-2 rounded-lg p-2 text-sm",
            result.serviceable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
          ].join(" ")}
        >
          {loading ? (
            <Loader2 className="mt-0.5 h-4 w-4 animate-spin" />
          ) : result.serviceable ? (
            <CheckCircle className="mt-0.5 h-4 w-4 flex-none" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          )}
          <div>
            {result.serviceable ? (
              <>
                <p className="font-medium">Delivery available</p>
                {result.eta && <p className="text-xs">{result.eta}</p>}
                {result.codAvailable === false && (
                  <p className="text-xs">COD not available at this pincode.</p>
                )}
              </>
            ) : (
              <p>{result.error ?? "Delivery not available at this pincode."}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
