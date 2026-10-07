import { z } from "zod";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** A non-empty string — used for required env vars. */
const requiredString = (name: string) =>
  z.string().min(1, `${name} is required and must not be empty`);

/** A non-empty string that must also be a valid URL. */
const requiredUrl = (name: string) =>
  requiredString(name).url(`${name} must be a valid URL`);

// ─── Server-side Environment Variables ────────────────────────────────────────
// These are secret / server-only — never prefixed with NEXT_PUBLIC_

const serverSchema = z.object({
  // Clerk Auth
  CLERK_SECRET_KEY: requiredString("CLERK_SECRET_KEY"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: requiredString("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: requiredString("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: requiredString("CLOUDINARY_API_SECRET"),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default("pdf-documents"),

  // Google Gemini
  GOOGLE_API_KEY: requiredString("GOOGLE_API_KEY"),

  // Pinecone
  PINECONE_API_KEY: requiredString("PINECONE_API_KEY"),
  PINECONE_INDEX_NAME: z.string().default("pdf-chat-embeddings"),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: requiredUrl("UPSTASH_REDIS_REST_URL"),
  UPSTASH_REDIS_REST_TOKEN: requiredString("UPSTASH_REDIS_REST_TOKEN"),

  // Resend
  RESEND_API_KEY: requiredString("RESEND_API_KEY"),
  CONTACT_RECEIVER_EMAIL: requiredString("CONTACT_RECEIVER_EMAIL").email(
    "CONTACT_RECEIVER_EMAIL must be a valid email address",
  ),
});

// ─── Client-side Environment Variables ────────────────────────────────────────
// Prefixed with NEXT_PUBLIC_ — safe to expose in the browser bundle

const clientSchema = z.object({
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: requiredString(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  ),
  NEXT_PUBLIC_CLERK_MANAGE_PROFILE_URL: z.string().optional(),

  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: requiredString(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
  ),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: requiredString(
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  ),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: requiredString(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  ),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: requiredString(
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  ),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: requiredString(
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  ),
  NEXT_PUBLIC_FIREBASE_APP_ID: requiredString("NEXT_PUBLIC_FIREBASE_APP_ID"),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  // App URLs
  NEXT_PUBLIC_BASE_URL: requiredUrl("NEXT_PUBLIC_BASE_URL"),
  NEXT_PUBLIC_APP_URL: requiredUrl("NEXT_PUBLIC_APP_URL"),
  NEXT_PUBLIC_SITE_URL: requiredUrl("NEXT_PUBLIC_SITE_URL"),
});

// ─── Validation & Export ──────────────────────────────────────────────────────

/**
 * Formats Zod validation errors into a human-readable summary grouped by
 * variable name, suitable for printing in the terminal during build / startup.
 */
function formatErrors(issues: z.ZodError["issues"]): string {
  const lines: string[] = [];

  for (const issue of issues) {
    const path = issue.path.join(".") || "(root)";
    lines.push(`  ✗ ${path}: ${issue.message}`);
  }

  return lines.join("\n");
}

/**
 * Validates server-side environment variables.
 *
 * Call this at the top of any server-side entry point (API route, Server
 * Action, instrumentation hook) to fail fast with a clear message rather
 * than an opaque runtime crash.
 *
 * On the client this is a no-op that returns `undefined` so the module can
 * be safely imported anywhere without leaking server secrets.
 */
function validateServerEnv() {
  // Skip validation on the client — server vars are not available there.
  if (typeof window !== "undefined") return undefined as never;

  const result = serverSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      "\n❌ Invalid server environment variables:\n" +
        formatErrors(result.error.issues) +
        "\n\nPlease check your .env / hosting environment and add the missing values.\n",
    );
    throw new Error(
      "Missing or invalid server environment variables — see console output above.",
    );
  }

  return result.data;
}

function validateClientEnv() {
  const result = clientSchema.safeParse({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_MANAGE_PROFILE_URL:
      process.env.NEXT_PUBLIC_CLERK_MANAGE_PROFILE_URL,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  if (!result.success) {
    console.error(
      "\n❌ Invalid client environment variables:\n" +
        formatErrors(result.error.issues) +
        "\n\nPlease check your .env / hosting environment and add the missing values.\n",
    );
    throw new Error(
      "Missing or invalid client environment variables — see console output above.",
    );
  }

  return result.data;
}

// Eagerly validate on module load so failures surface at build / startup time.
export const serverEnv =
  typeof window === "undefined" ? validateServerEnv() : (undefined as never);

export const clientEnv = validateClientEnv();

// Re-export schemas for testing / downstream use
export { serverSchema, clientSchema };
