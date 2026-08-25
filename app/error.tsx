"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error("[app/error.tsx]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="p-4 rounded-full bg-red-500/10 mb-6">
        <AlertTriangle className="w-10 h-10 text-red-400" />
      </div>

      <h2 className="text-xl font-semibold text-slate-200 mb-2">
        Something went wrong
      </h2>

      <p className="text-slate-400 text-sm mb-2 max-w-md">
        An unexpected error occurred. You can try again or head back home.
      </p>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 mb-6 text-left max-w-lg w-full">
          <p className="text-xs font-mono text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg p-3 break-words">
            {error.message}
          </p>
          {error.stack && (
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
          onClick={reset}
          className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>

        <Button
          variant="outline"
          onClick={() => (window.location.href = "/")}
          className="border-white/20 hover:bg-white/10 hover:text-white cursor-pointer"
        >
          <Home className="w-4 h-4 mr-2" />
          Back home
        </Button>
      </div>
    </div>
  );
}
