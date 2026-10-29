"use client";

import ErrorPage from "@/components/ErrorPage";
import { ArrowLeft } from "lucide-react";

export default function DashboardError({
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
      title="Dashboard ran into a problem"
      description="An unexpected error occurred. You can try refreshing this section or go back to the dashboard."
      sourceTag="[app/dashboard/error.tsx]"
      minHeightClass="min-h-75"
      backHref="/dashboard"
      backLabel="Back to dashboard"
      backIcon={ArrowLeft}
    />
  );
}

