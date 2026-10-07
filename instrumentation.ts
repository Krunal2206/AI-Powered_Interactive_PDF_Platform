/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js at startup / build time.
 * We use it to eagerly validate all environment variables so that missing
 * or malformed secrets surface immediately instead of causing opaque 500
 * errors during user interactions.
 *
 */
export async function register() {
  // Only validate server-side environment variables on the server runtime.
  // Client env is validated eagerly via module-level code in lib/env.ts.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/env");
  }
}
