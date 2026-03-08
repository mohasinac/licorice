"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[LocaleError boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="bg-destructive/10 rounded-full p-5">
            <AlertTriangle className="text-destructive h-12 w-12" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-foreground text-3xl font-semibold">
            Something went wrong
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed">
            An unexpected error occurred. You can try again or return to the home page.
          </p>
          {error.digest && (
            <p className="text-foreground/40 font-mono text-xs">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} variant="primary" size="md">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline" size="md" className="w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
