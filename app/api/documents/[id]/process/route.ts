import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDocument, updateDocument } from "@/lib/firebaseops";
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId } = await params;

    // Get document from database
    const document = await getDocument(documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (document.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Rate limit: 5 processing operations per 10 minutes
    const blocked = await applyRateLimit(processLimiter, userId);
    if (blocked) return blocked;

    // Check if document is already processed
    const alreadyProcessed = await isDocumentProcessed(documentId);
    if (alreadyProcessed) {
      const stats = await getProcessingStats(documentId);
      return NextResponse.json({
        message: "Document already processed",
        processed: true,
        stats,
      });
    }

    // Create processing status
    const statusId = await createProcessingStatus(documentId);

    try {
      // Update processing status to "processing"
      await updateProcessingStatus(statusId, "processing");

      // Update document status
      await updateDocument(documentId, { status: "processing" });

      // Initialize PDF processor
      const processor = createPDFProcessor({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      console.log(`Starting PDF processing for document ${documentId}`);

      // Process the document
      const result = await processor.processDocument(
        documentId,
        document.cloudinaryUrl,
        document.originalFilename
      );

      if (!result.success || !result.chunks) {
        throw new Error(result.error || "Failed to process document");
      }

      console.log(
        `PDF processed successfully, storing ${result.chunks.length} chunks`
      );

      // Update status to indicate embedding generation
      await updateProcessingStatus(statusId, "generating-embeddings");

      // Store chunks and generate embeddings
      const storeResult = await storePDFChunks(result.chunks, true);

      if (!storeResult.success) {
        throw new Error(storeResult.error || "Failed to store document chunks");
      }

      const finalStats = {
        ...result.stats!,
        embeddingsGenerated: storeResult.embeddingsGenerated,
        embeddingTime: Date.now() - (result.stats?.processingTime || 0),
      };

      // Update processing status to completed
      await updateProcessingStatus(
        statusId,
        "completed",
        undefined,
        finalStats
      );

      // Update document status to ready
      await updateDocument(documentId, {
        status: "ready",
        pageCount: result.stats?.totalPages,
      });

      console.log(
        `Document ${documentId} processed successfully with embeddings`
      );

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

      // Update processing status to failed
      await updateProcessingStatus(
        statusId,
        "failed",
        processingError instanceof Error
          ? processingError.message
          : "Unknown error"
      );

      // Update document status to error
      await updateDocument(documentId, { status: "error" });

      return NextResponse.json(
        {
          error: "Failed to process document",
          details:
            processingError instanceof Error
              ? processingError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId } = await params;

    // Get document from database
    const document = await getDocument(documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (document.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check processing status and get detailed stats
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
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId } = await params;

    // Get document from database
    const document = await getDocument(documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (document.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete all chunks and embeddings for this document
    await deleteDocumentChunks(documentId);

    // Update document status
    await updateDocument(documentId, { status: "ready" });

    return NextResponse.json({
      success: true,
      message: "Document chunks and embeddings deleted successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete document chunks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// New endpoint to regenerate missing embeddings
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId } = await params;

    // Get document from database
    const document = await getDocument(documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (document.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Generate missing embeddings
    const result = await generateMissingEmbeddings(documentId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Generated ${result.generated} missing embeddings`,
        generated: result.generated,
      });
    } else {
      return NextResponse.json(
        {
          error: "Failed to generate embeddings",
          details: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
