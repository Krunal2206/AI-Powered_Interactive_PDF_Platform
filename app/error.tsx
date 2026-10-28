"use client";

import ErrorPage from "@/components/ErrorPage";

export default function AppError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      sourceTag="[app/error.tsx]"
    />
  );
}

