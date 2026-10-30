import { NextResponse } from "next/server";
import { getChatHistory } from "@/lib/firebaseChatOps";
import { deleteChatData } from "@/lib/firebaseops";
import { authorizeDocumentAccess, handleApiError } from "@/lib/errorHandling";

type RouteParams = {
  params: Promise<{ documentId: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { documentId } = await params;
    const auth = await authorizeDocumentAccess(documentId);
    if (auth.error) return auth.error;
    const { userId } = auth;

    const history = await getChatHistory(documentId, userId);

    return NextResponse.json({
      history,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
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
    return handleApiError(error);
  }
}
