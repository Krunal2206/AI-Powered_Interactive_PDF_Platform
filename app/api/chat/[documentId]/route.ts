import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDocument } from "@/lib/firebaseops";
import { ChatService } from "@/lib/chatService";
import { getDocumentSessions } from "@/lib/firebaseChatOps";
import { isDocumentProcessed } from "@/lib/firebaseChunkOps";
import { chatLimiter, applyRateLimit } from "@/lib/rateLimit";

export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blocked = applyRateLimit(chatLimiter, userId);
    if (blocked) return blocked;

    const { documentId } = await params;
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

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

    const chatService = new ChatService(
      documentId,
      userId,
      sessionId || undefined,
    );

    const response = await chatService.chat(message.trim(), () => {});

    // Pass userId so we only retrieve sessions belonging to this user
    const sessions = await getDocumentSessions(documentId, userId);
    const currentSessionId =
      sessions.length > 0 ? sessions[0].id : (sessionId ?? null);

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
