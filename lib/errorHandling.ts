import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDocument } from "@/lib/firebaseops";
import { Document } from "@/types/upload";

// ─── Error class ──────────────────────────────────────────────────────────────

export class ChatError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ChatError";
  }
}

// ─── Response helpers ─────────────────────────────────────────────────────────

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


export const handleChatError = (error: unknown): NextResponse => {
  console.error("API error:", error);

  if (error instanceof ChatError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 },
  );
};

// ─── Document access guard ────────────────────────────────────────────────────
// Combines auth check + document existence + ownership into one call.
// Use this in every API route that operates on a document.
 
type AuthorizeSuccess = { userId: string; document: Document; error?: never };
type AuthorizeFailure = { error: NextResponse; userId?: never; document?: never };
 
export async function authorizeDocumentAccess(
  documentId: string,
): Promise<AuthorizeSuccess | AuthorizeFailure> {
  const { userId } = await auth();
 
  if (!userId) {
    return { error: apiError("Unauthorized", 401) };
  }
 
  const document = await getDocument(documentId);
 
  if (!document) {
    return { error: apiError("Document not found", 404) };
  }
 
  if (document.userId !== userId) {
    return { error: apiError("Access denied", 403) };
  }
 
  return { userId, document };
}