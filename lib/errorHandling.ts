import { NextResponse } from "next/server";

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

export const handleChatError = (error: unknown) => {
  console.error("Chat error:", error);

  if (error instanceof ChatError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 },
  );
};

// Fixed: was checking session.user, but Clerk passes userId as a plain string
export const throwIfUnauthorized = (userId: string | null | undefined) => {
  if (!userId) {
    throw new ChatError("Unauthorized", 401, "UNAUTHORIZED");
  }
};

export const throwIfInvalidDocument = (documentId: string) => {
  if (!documentId) {
    throw new ChatError("Document ID is required", 400, "INVALID_DOCUMENT");
  }
};

export const throwIfMissingMessage = (message: string) => {
  if (!message?.trim()) {
    throw new ChatError("Message content is required", 400, "MISSING_MESSAGE");
  }
};
