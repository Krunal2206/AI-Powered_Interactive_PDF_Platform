import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ChatService } from "@/lib/chatService";
import { isDocumentProcessed } from "@/lib/firebaseChunkOps";
import { chatLimiter, applyRateLimit } from "@/lib/rateLimit";
import { authorizeDocumentAccess, handleChatError } from "@/lib/errorHandling";

type RouteParams = {
  params: Promise<{ documentId: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply rate limiting
    const blocked = await applyRateLimit(chatLimiter, userId);
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

    // Validate message length
    if (message.trim().length > 2000) {
      return NextResponse.json(
        { error: "Message too long. Maximum 2000 characters." },
        { status: 400 },
      );
    }

    // Validate document
    const docAuth = await authorizeDocumentAccess(documentId);
    if (docAuth.error) return docAuth.error;

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

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await chatService.chat(message.trim(), (token) => {
            const chunk = encoder.encode(token);
            controller.enqueue(chunk);
          });

          const currentSessionId = chatService.sessionId ?? sessionId ?? null;
          const meta = `\n__SESSION__:${currentSessionId}`;
          controller.enqueue(encoder.encode(meta));
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    return handleChatError(error);
  }
}
