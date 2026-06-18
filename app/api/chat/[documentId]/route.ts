import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDocument } from "@/lib/firebaseops";
import { ChatService } from "@/lib/chatService";
import { isDocumentProcessed } from "@/lib/firebaseChunkOps";
import { chatLimiter, applyRateLimit } from "@/lib/rateLimit";

export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } },
) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply rate limiting
    const blocked = applyRateLimit(chatLimiter, userId);
    if (blocked) return blocked;

    // Get document ID and message from request
    const { documentId } = await params;
    const body = await request.json();
    const { message, sessionId } = body;

    // Validate message
    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Validate document
    const document = await getDocument(documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }
    if (document.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Validate document processing status
    const processed = await isDocumentProcessed(documentId);
    if (!processed) {
      return NextResponse.json(
        {
          error:
            "Document must be processed before chatting. Click 'Process Document' first.",
        },
        { status: 400 },
      );
    }

    // Create chat service
    const chatService = new ChatService(
      documentId,
      userId,
      sessionId || undefined,
    );

    const response = await chatService.chat(message.trim(), () => {});

    const currentSessionId = chatService.sessionId ?? sessionId ?? null;

    return NextResponse.json({ response, sessionId: currentSessionId });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
