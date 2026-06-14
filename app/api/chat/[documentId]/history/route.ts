import { NextResponse } from "next/server";
import { getDocumentSessions, getChatHistory } from "@/lib/firebaseChatOps";
import { auth } from "@clerk/nextjs/server";
import { throwIfUnauthorized } from "@/lib/errorHandling";
import { getDocument } from "@/lib/firebaseops";

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } },
) {
  try {
    const { userId } = await auth();
    throwIfUnauthorized(userId);

    const { documentId } = await params;

    // Verify the requesting user owns this document
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

    // Now safe to fetch sessions — we know the document belongs to this user
    const sessions = await getDocumentSessions(documentId, userId);

    const history =
      sessions.length > 0 ? await getChatHistory(sessions[0].id) : [];

    return NextResponse.json({
      history,
      sessionId: sessions.length > 0 ? sessions[0].id : null,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 },
    );
  }
}
