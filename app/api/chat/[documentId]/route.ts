import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@/lib/chatService";
import { isDocumentProcessed } from "@/lib/firebaseChunkOps";
import { chatLimiter, applyRateLimit } from "@/lib/rateLimit";
import { authorizeDocumentAccess, handleApiError } from "@/lib/errorHandling";
import { DocumentIdParam } from "@/types/api";

export async function POST(request: NextRequest, { params }: DocumentIdParam) {
  const requestStart = performance.now();

  console.log("[PERF] Chat request started");

  try {
    // Validate document access + authentication
    const { documentId } = await params;
    const docAuth = await authorizeDocumentAccess(documentId);
    if (docAuth.error) return docAuth.error;
    const { userId } = docAuth;

    console.log(
      `[PERF] Document authorization check completed after: ${performance.now() - requestStart} ms`,
    );

    // Apply rate limiting
    const blocked = await applyRateLimit(chatLimiter, userId);
    if (blocked) return blocked;

    console.log(
      `[PERF] Rate limiting check completed after: ${performance.now() - requestStart} ms`,
    );

    // Get message from request
    const body = await request.json();
    const { message } = body;

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

    console.log(
      `[PERF] Document processing check completed after: ${performance.now() - requestStart} ms`,
    );

    // Create chat service
    const chatService = new ChatService(documentId, userId);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await chatService.chat(message.trim(), (token) => {
            const chunk = encoder.encode(token);
            controller.enqueue(chunk);
          });
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        } finally {
          controller.close();
          const requestDuration = performance.now() - requestStart;

          console.log(
            `[PERF] Chat request completed in ${requestDuration.toFixed(2)} ms`,
          );
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
    return handleApiError(error);
  }
}
