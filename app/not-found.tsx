import Link from "next/link";
import { Leaf } from "lucide-react";

// Root-level not-found — rendered outside the locale layout so we cannot use
// next-intl's Link here. Redirects users back to / which middleware will
// normalize to the correct locale.
export default function RootNotFound() {
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
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          {/* 404 + icon */}
          <div style={{ position: "relative", display: "inline-flex", marginBottom: "2rem" }}>
            <span
              style={{
                fontSize: "7rem",
                fontWeight: 700,
                lineHeight: 1,
                color: "rgba(43,26,107,0.08)",
                userSelect: "none",
              }}
            >
              404
            </span>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  borderRadius: "9999px",
                  backgroundColor: "rgba(43,26,107,0.1)",
                  padding: "1.25rem",
                }}
              >
                <Leaf style={{ width: 40, height: 40, color: "#2b1a6b" }} />
              </div>
            </div>
          </div>

          <h1 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            Page not found
          </h1>
          <p
            style={{
              color: "rgba(26,15,60,0.6)",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              marginBottom: "2rem",
              maxWidth: 320,
              margin: "0 auto 2rem",
            }}
          >
            The page you&apos;re looking for has moved or may never have existed. Let&apos;s get you back on
            track.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#2b1a6b",
                color: "#fff",
                borderRadius: "0.75rem",
                padding: "0.625rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Back to home
            </Link>
            <Link
              href="/shop"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "1px solid #2b1a6b",
                color: "#2b1a6b",
                backgroundColor: "transparent",
                borderRadius: "0.75rem",
                padding: "0.625rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Browse products
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
