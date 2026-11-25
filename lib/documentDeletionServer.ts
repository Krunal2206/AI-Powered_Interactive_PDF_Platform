import cloudinary from "@/cloudinary";
import {
  getDocument,
  deleteDocumentRecord,
  deleteChatData,
} from "./documentRepository";
import { deleteDocumentChunks } from "./firebaseChunkOps";

/**
 * Pure server-side document deletion orchestrator (DIP compliance).
 * Directly invokes services (Cloudinary, vector chunks, chat history, Firestore)
 * without making self-referencing HTTP API calls.
 */
export async function deleteDocumentServer(documentId: string): Promise<void> {
  const document = await getDocument(documentId);
  if (!document) {
    throw new Error("Document not found");
  }

  // 1. Delete Cloudinary asset directly (best-effort)
  if (document.cloudinaryPublicId) {
    try {
      const result = await cloudinary.uploader.destroy(
        document.cloudinaryPublicId,
        { resource_type: "image" },
      );
      if (result.result !== "ok" && result.result !== "not found") {
        console.error("Cloudinary deletion returned non-ok status:", result);
      }
    } catch (cloudinaryError) {
      console.error("Error destroying Cloudinary asset:", cloudinaryError);
    }
  }

  // 2. Delete processing chunks & vector embeddings directly (best-effort)
  try {
    await deleteDocumentChunks(documentId);
  } catch (chunkError) {
    console.error("Error deleting document chunks/embeddings:", chunkError);
  }

  // 3. Delete chat messages directly (best-effort)
  try {
    await deleteChatData(documentId);
  } catch (chatError) {
    console.error("Error deleting chat data:", chatError);
  }

  // 4. Delete Firestore document record
  await deleteDocumentRecord(documentId);
}
