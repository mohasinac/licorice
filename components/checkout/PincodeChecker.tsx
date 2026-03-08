"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-fetch";

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
  const t = useTranslations("checkout");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceabilityResult | null>(null);

  async function check() {
    if (!/^\d{6}$/.test(pincode)) return;
    setResult(null);
    setLoading(true);
    try {
      const data = await apiFetch<ServiceabilityResult>(`/api/pincode-check?pincode=${pincode}`, {
        silent: true,
      });
      setResult(data);
      onResult?.(data);
    } catch {
      const fallback = { serviceable: false, error: t("checkError") };
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
        {t("checkDelivery")}
      </Button>

      {result && (
        <div
          className={[
            "flex items-start gap-2 rounded-lg p-2 text-sm",
            result.serviceable ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
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
                <p className="font-medium">{t("deliveryAvailable")}</p>
                {result.eta && <p className="text-xs">{result.eta}</p>}
                {result.codAvailable === false && (
                  <p className="text-xs">{t("codUnavailable")}</p>
                )}
              </>
            ) : (
              <p>{result.error ?? t("deliveryUnavailable")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
