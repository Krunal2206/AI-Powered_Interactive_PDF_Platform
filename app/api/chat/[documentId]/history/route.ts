import { NextResponse } from "next/server";
import { getDocumentSessions, getChatHistory } from "@/lib/firebaseChatOps";
import { deleteChatData } from "@/lib/firebaseops";
import { authorizeDocumentAccess, handleChatError } from "@/lib/errorHandling";

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } },
) {
  try {
    const { documentId } = await params;
    const auth = await authorizeDocumentAccess(documentId);
    if (auth.error) return auth.error;
    const { userId } = auth;

    const sessions = await getDocumentSessions(documentId, userId);
    const history =
      sessions.length > 0 ? await getChatHistory(sessions[0].id) : [];

    return NextResponse.json({
      history,
      sessionId: sessions.length > 0 ? sessions[0].id : null,
    });
  } catch (error) {
    return handleChatError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { documentId: string } },
) {
  try {
    const { documentId } = await params;
    const auth = await authorizeDocumentAccess(documentId);
    if (auth.error) return auth.error;

    await deleteChatData(documentId);

    return NextResponse.json({
      success: true,
      message: "Chat history cleared",
    });
  } catch (error) {
    return handleChatError(error);
  }
}
