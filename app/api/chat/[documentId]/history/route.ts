import { NextResponse } from "next/server";
import { getDocumentSessions, getChatHistory } from "@/lib/firebaseChatOps";
import { auth } from "@clerk/nextjs/server";
import { throwIfUnauthorized } from "@/lib/errorHandling";

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const { userId } = await auth();
    throwIfUnauthorized(userId);

    const { documentId } = params;

    // Get all sessions for this document
    const sessions = await getDocumentSessions(documentId);

    // Get chat history for the most recent session if it exists
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
      { status: 500 }
    );
  }
}
