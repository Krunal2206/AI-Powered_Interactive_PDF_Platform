import { NextRequest, NextResponse } from "next/server";
import { updateDocument } from "@/lib/firebaseops";
import { createPDFProcessor } from "@/lib/pdfProcessor";
import {
  storePDFChunks,
  createProcessingStatus,
  updateProcessingStatus,
  deleteDocumentChunks,
  isDocumentProcessed,
  generateMissingEmbeddings,
  getProcessingStats,
} from "@/lib/firebaseChunkOps";
import { applyRateLimit, processLimiter } from "@/lib/rateLimit";
import { authorizeDocumentAccess, handleChatError } from "@/lib/errorHandling";

type RouteParams = {
  params: Promise<{ id: string }>;
};
  
export async function POST(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id: documentId } = await params;
    const auth = await authorizeDocumentAccess(documentId);
    if (auth.error) return auth.error;
    const { userId, document } = auth;

    const blocked = await applyRateLimit(processLimiter, userId);
    if (blocked) return blocked;

    const alreadyProcessed = await isDocumentProcessed(documentId);
    if (alreadyProcessed) {
      const stats = await getProcessingStats(documentId);
      return NextResponse.json({
        message: "Document already processed",
        processed: true,
        stats,
      });
    }

    const statusId = await createProcessingStatus(documentId);

    try {
      await updateProcessingStatus(statusId, "processing");
      await updateDocument(documentId, { status: "processing" });

      const processor = createPDFProcessor({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const result = await processor.processDocument(
        documentId,
        document.cloudinaryUrl,
        document.originalFilename,
      );

      if (!result.success || !result.chunks) {
        throw new Error(result.error || "Failed to process document");
      }

      await updateProcessingStatus(statusId, "generating-embeddings");

      const storeResult = await storePDFChunks(result.chunks, true);
      if (!storeResult.success) {
        throw new Error(storeResult.error || "Failed to store document chunks");
      }

      const finalStats = {
        ...result.stats!,
        embeddingsGenerated: storeResult.embeddingsGenerated,
        embeddingTime: Date.now() - (result.stats?.processingTime || 0),
      };

      await updateProcessingStatus(
        statusId,
        "completed",
        undefined,
        finalStats,
      );
      await updateDocument(documentId, {
        status: "ready",
        pageCount: result.stats?.totalPages,
      });

      return NextResponse.json({
        success: true,
        message: "Document processed successfully",
        stats: finalStats,
        embeddings: {
          generated: storeResult.embeddingsGenerated,
          chunksStored: storeResult.chunksStored,
        },
      });
    } catch (processingError) {
      console.error("Processing error:", processingError);
      await updateProcessingStatus(
        statusId,
        "failed",
        processingError instanceof Error
          ? processingError.message
          : "Unknown error",
      );
      await updateDocument(documentId, { status: "error" });

      return NextResponse.json(
        {
          error: "Failed to process document",
          details:
            processingError instanceof Error
              ? processingError.message
              : "Unknown error",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    return handleChatError(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id: documentId } = await params;
    const auth = await authorizeDocumentAccess(documentId);
    if (auth.error) return auth.error;
    const { document } = auth;

    const [processed, stats] = await Promise.all([
      isDocumentProcessed(documentId),
      getProcessingStats(documentId),
    ]);

    return NextResponse.json({
      documentId,
      processed,
      status: document.status,
      stats,
    });
  } catch (error) {
    return handleChatError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id: documentId } = await params;
    const auth = await authorizeDocumentAccess(documentId);
    if (auth.error) return auth.error;

    await deleteDocumentChunks(documentId);
    await updateDocument(documentId, { status: "ready" });

    return NextResponse.json({
      success: true,
      message: "Document chunks and embeddings deleted successfully",
    });
  } catch (error) {
    return handleChatError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id: documentId } = await params;
    const auth = await authorizeDocumentAccess(documentId);
    if (auth.error) return auth.error;

    const result = await generateMissingEmbeddings(documentId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Generated ${result.generated} missing embeddings`,
        generated: result.generated,
      });
    }

    return NextResponse.json(
      { error: "Failed to generate embeddings", details: result.error },
      { status: 500 },
    );
  } catch (error) {
    return handleChatError(error);
  }
}
