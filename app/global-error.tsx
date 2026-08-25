"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error("[app/global-error.tsx]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0f0a1f",
          color: "#e2e8f0",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            marginBottom: "0.5rem",
          }}
        >
          The application failed to load
        </h2>
        <p
          style={{
            color: "#94a3b8",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
          }}
        >
          Something went wrong at startup. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#9333ea",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1.25rem",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
