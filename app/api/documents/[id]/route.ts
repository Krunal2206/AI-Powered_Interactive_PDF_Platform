import { NextRequest, NextResponse } from "next/server";
import { authorizeDocumentAccess, handleApiError } from "@/lib/errorHandling";
import { IdParam } from "@/types/api";
import { deleteDocumentServer } from "@/lib/documentDeletionServer";

/**
 * Endpoint for deleting a document and all related artifacts
 * (Cloudinary PDF, chunk embeddings, chat history, and Firestore document).
 */
export async function DELETE(
  request: NextRequest,
  { params }: IdParam,
) {
  try {
    const { id: documentId } = await params;
    const auth = await authorizeDocumentAccess(documentId);
    if (auth.error) return auth.error;

    await deleteDocumentServer(documentId);

    return NextResponse.json({
      success: true,
      message: "Document and all associated resources deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
