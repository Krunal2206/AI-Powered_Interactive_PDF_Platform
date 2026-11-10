import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDocument } from "@/lib/firebaseops";
import { Document } from "@/types/upload";

// ─── Error Classes (Open/Closed Principle) ───────────────────────────────────

export interface ErrorWithResponse {
  toResponse(): NextResponse;
}

export class ApiError extends Error implements ErrorWithResponse {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /**
   * Polymorphic response generator (Open/Closed Principle).
   * Subclasses can override or extend without modifying handleApiError.
   */
  toResponse(): NextResponse {
    return NextResponse.json(
      {
        error: this.message,
        ...(this.code && { code: this.code }),
        ...(this.details !== undefined && { details: this.details }),
      },
      { status: this.statusCode },
    );
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Access denied") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

/** @deprecated Use ApiError instead */
export const ChatError = ApiError;
export type ChatError = ApiError;

// ─── Extensible Error Transformers ───────────────────────────────────────────

export type ErrorTransformer = (error: unknown) => NextResponse | null;

const errorTransformers: ErrorTransformer[] = [];

/**
 * Register an error transformer to handle external or third-party error types
 * without modifying handleApiError (Open/Closed Principle).
 */
export function registerErrorTransformer(
  transformer: ErrorTransformer,
): () => void {
  errorTransformers.push(transformer);
  return () => {
    const index = errorTransformers.indexOf(transformer);
    if (index > -1) {
      errorTransformers.splice(index, 1);
    }
  };
}

// ─── Response Helpers ─────────────────────────────────────────────────────────

export function apiError(
  message: string,
  statusCode = 500,
  details?: string,
): NextResponse {
  return NextResponse.json(
    { error: message, ...(details && { details }) },
    { status: statusCode },
  );
}

export const handleApiError = (error: unknown): NextResponse => {
  console.error("API error:", error);

  // 1. Polymorphic response conversion for classes implementing ErrorWithResponse
  if (
    error &&
    typeof error === "object" &&
    "toResponse" in error &&
    typeof (error as ErrorWithResponse).toResponse === "function"
  ) {
    return (error as ErrorWithResponse).toResponse();
  }

  // 2. Custom registered error transformers (Open to extension)
  for (const transformer of errorTransformers) {
    const response = transformer(error);
    if (response) return response;
  }

  // 3. Duck-typed errors containing statusCode
  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof (error as { statusCode: unknown }).statusCode === "number"
  ) {
    const err = error as { statusCode: number; message?: string; code?: string };
    return NextResponse.json(
      {
        error: err.message || "An error occurred",
        ...(err.code && { code: err.code }),
      },
      { status: err.statusCode },
    );
  }

  // 4. Standard generic Error
  if (error instanceof Error) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }

  // 5. Unknown throwables
  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 },
  );
};

/** @deprecated Use handleApiError instead */
export const handleChatError = handleApiError;

// ─── Auth and Document access guards ──────────────────────────────────────────

export type AuthSuccess = { userId: string; error?: never };
export type AuthFailure = { error: NextResponse; userId?: never };

export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  const { userId } = await auth();

  if (!userId) {
    return { error: apiError("Unauthorized", 401) };
  }

  return { userId };
}

type AuthorizeSuccess = { userId: string; document: Document; error?: never };
type AuthorizeFailure = {
  error: NextResponse;
  userId?: never;
  document?: never;
};

export async function authorizeDocumentAccess(
  documentId: string,
): Promise<AuthorizeSuccess | AuthorizeFailure> {
  const authResult = await requireAuth();

  if (authResult.error) {
    return authResult;
  }

  const { userId } = authResult;
  const document = await getDocument(documentId);

  if (!document) {
    return { error: apiError("Document not found", 404) };
  }

  if (document.userId !== userId) {
    return { error: apiError("Access denied", 403) };
  }

  return { userId, document };
}
