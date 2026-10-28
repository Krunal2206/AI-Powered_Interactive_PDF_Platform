"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ErrorPageProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
  readonly title?: string;
  readonly description?: string;
  readonly sourceTag?: string;
  readonly minHeightClass?: string;
  readonly backHref?: string;
  readonly backLabel?: string;
  readonly backIcon?: LucideIcon;
  readonly showStackTrace?: boolean;
}

export default function ErrorPage({
  error,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred. You can try again or head back home.",
  sourceTag = "[ErrorPage]",
  minHeightClass = "min-h-screen",
  backHref = "/",
  backLabel = "Back home",
  backIcon: BackIcon = Home,
  showStackTrace = true,
}: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    if (sourceTag) {
      console.error(sourceTag, error);
    }
  }, [error, sourceTag]);

  const handleReset = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${minHeightClass} p-8 text-center`}
    >
      <div className="p-4 rounded-full bg-red-500/10 mb-6">
        <AlertTriangle className="w-10 h-10 text-red-400" />
      </div>

      <h2 className="text-xl font-semibold text-slate-200 mb-2">{title}</h2>

      <p className="text-slate-400 text-sm mb-2 max-w-md">{description}</p>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 mb-6 text-left max-w-lg w-full">
          <p className="text-xs font-mono text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg p-3 break-words">
            {error.message}
          </p>
          {showStackTrace && error.stack && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-slate-500 hover:text-slate-400 select-none">
                Show stack trace
              </summary>
              <pre className="mt-2 text-red-400/80 bg-red-950/20 border border-red-800/30 rounded-lg p-3 max-h-64 overflow-y-auto whitespace-pre-wrap break-words">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mt-4">
        <Button
          onClick={handleReset}
          className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>

        <Button
          variant="outline"
          asChild
          className="border-white/20 hover:bg-white/10 hover:text-white cursor-pointer"
        >
          <Link href={backHref}>
            <BackIcon className="w-4 h-4 mr-2" />
            {backLabel}
          </Link>
        </Button>
      </div>
    </div>
  );
}
