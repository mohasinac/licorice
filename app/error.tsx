"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Root error boundary — rendered outside the locale layout so we cannot use
// next-intl's Link or any locale-aware primitives here.
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RootError boundary]", error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          backgroundColor: "#faf9f7",
          color: "#1a0f3c",
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9999px",
              backgroundColor: "rgba(192,57,43,0.1)",
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <AlertTriangle style={{ width: 48, height: 48, color: "#c0392b" }} />
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: "rgba(26,15,60,0.6)",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            An unexpected error occurred. You can try again or return to the home page.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.7rem",
                color: "rgba(26,15,60,0.4)",
                fontFamily: "monospace",
                marginBottom: "1.5rem",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#2b1a6b",
                color: "#fff",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <RefreshCw style={{ width: 16, height: 16 }} />
              Try again
            </button>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "1px solid #2b1a6b",
                color: "#2b1a6b",
                backgroundColor: "transparent",
                borderRadius: "0.75rem",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
