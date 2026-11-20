/**
 * Universal error handling utilities (safe for both client and server components).
 * Provides consistent error narrowing and message extraction following LSP.
 */

/**
 * Safely extracts a human-readable error message from an unknown thrown error.
 *
 * @param error - The error caught in a try/catch block
 * @param fallback - Fallback message if no error message can be resolved (default: "Unknown error")
 * @returns Human-readable error message string
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = "Unknown error",
): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }
  if (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string" &&
    (error as { message: string }).message.trim().length > 0
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
}

/**
 * Ensures an unknown thrown value is converted to a standard Error instance.
 *
 * @param error - The caught value
 * @param fallbackMessage - Fallback message if error is not an Error instance
 * @returns An instance of Error
 */
export function toError(
  error: unknown,
  fallbackMessage: string = "An error occurred",
): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(getErrorMessage(error, fallbackMessage));
}
