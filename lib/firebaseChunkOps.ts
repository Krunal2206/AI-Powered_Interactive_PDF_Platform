import { db } from "@/firebase";
import { PDFChunk } from "./pdfProcessor";
import {
  storeDocumentEmbeddings,
  deleteDocumentFromVector,
} from "./vectorStore";
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDocs,
  query,
  QuerySnapshot,
  Timestamp,
  where,
  writeBatch,
  updateDoc,
} from "firebase/firestore";

const CHUNKS_COLLECTION = "pdf-chunks";
const PROCESSING_STATUS_COLLECTION = "processing-status";

export interface ProcessingStatus {
  id?: string;
  documentId: string;
  status:
    | "pending"
    | "processing"
    | "generating-embeddings"
    | "completed"
    | "failed";
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  stats?: {
    totalPages: number;
    totalCharacters: number;
    totalChunks: number;
    processingTime: number;
    embeddingsGenerated?: boolean;
    embeddingTime?: number;
  };
}

export interface StoredPDFChunk extends PDFChunk {
  createdAt: Date;
  updatedAt: Date;
  hasEmbedding?: boolean;
  embeddingGeneratedAt?: Date;
}

function convertTimestamp(value: any): Date {
  if (value instanceof Date) return value;
  if (value?.toDate) return value.toDate();
  return new Date();
}

/**
 * Store PDF chunks in Firestore and generate embeddings
 */
export async function storePDFChunks(
  chunks: PDFChunk[],
  generateEmbeddings: boolean = true,
): Promise<{
  success: boolean;
  chunksStored: number;
  embeddingsGenerated: boolean;
  error?: string;
}> {
  if (chunks.length === 0) {
    return {
      success: true,
      chunksStored: 0,
      embeddingsGenerated: false,
    };
  }

  try {
    console.log(
      `Storing ${chunks.length} chunks with embeddings: ${generateEmbeddings}`,
    );

    // Store chunks in Firestore
    const batch = writeBatch(db);
    const chunksCollection = collection(db, CHUNKS_COLLECTION);

    for (const chunk of chunks) {
      const chunkDoc = doc(chunksCollection);
      batch.set(chunkDoc, {
        ...chunk,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        hasEmbedding: false,
        embeddingGeneratedAt: null,
      });
    }

    await batch.commit();
    console.log(`Successfully stored ${chunks.length} chunks in Firestore`);

    // Generate and store embeddings if requested
    let embeddingsGenerated = false;
    if (generateEmbeddings) {
      try {
        const embeddingResult = await storeDocumentEmbeddings(chunks);
        embeddingsGenerated = embeddingResult.stored > 0;

        if (embeddingsGenerated && embeddingResult.storedChunkIds.length > 0) {
          // Mark only the chunks that were actually stored successfully
          await markChunksWithEmbeddings(embeddingResult.storedChunkIds);
          console.log(
            `Marked ${embeddingResult.storedChunkIds.length}/${chunks.length} chunks as embedded`,
          );
          if (embeddingResult.storedChunkIds.length < chunks.length) {
            console.warn(
              `Partial embedding: ${chunks.length - embeddingResult.storedChunkIds.length} chunks failed`,
            );
          }
        } else {
          console.warn("Failed to generate embeddings:", embeddingResult.error);
        }
      } catch (embeddingError) {
        console.error("Error generating embeddings:", embeddingError);
        // Don't fail the entire operation if embedding generation fails
      }
    }

    return {
      success: true,
      chunksStored: chunks.length,
      embeddingsGenerated,
    };
  } catch (error) {
    console.error("Error storing PDF chunks:", error);
    return {
      success: false,
      chunksStored: 0,
      embeddingsGenerated: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark chunks as having embeddings generated
 */
async function markChunksWithEmbeddings(chunkIds: string[]): Promise<void> {
  if (chunkIds.length === 0) return;

  try {
    // Fetch only the specific chunks that were successfully embedded
    const chunksCollection = collection(db, CHUNKS_COLLECTION);
    const batch = writeBatch(db);

    // Firestore `in` queries are limited to 30 items — process in batches
    const batchSize = 30;
    for (let i = 0; i < chunkIds.length; i += batchSize) {
      const idBatch = chunkIds.slice(i, i + batchSize);
      const q = query(chunksCollection, where("id", "in", idBatch));
      const querySnapshot = await getDocs(q);
      querySnapshot.docs.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, {
          hasEmbedding: true,
          embeddingGeneratedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      });
    }

    await batch.commit();
  } catch (error) {
    console.error("Error marking chunks with embeddings:", error);
  }
}

/**
 * Get all chunks for a document
 */
export async function getDocumentChunks(
  documentId: string,
): Promise<StoredPDFChunk[]> {
  try {
    const q = query(
      collection(db, CHUNKS_COLLECTION),
      where("metadata.documentId", "==", documentId),
    );

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

    const chunks = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        embeddingGeneratedAt: data.embeddingGeneratedAt
          ? convertTimestamp(data.embeddingGeneratedAt)
          : undefined,
      } as StoredPDFChunk;
    });

    // Sort by chunkIndex on the client side to avoid needing a composite index
    return chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
  } catch (error) {
    console.error("Error fetching document chunks:", error);
    throw new Error("Failed to fetch document chunks");
  }
}

/**
 * Delete all chunks for a document (both Firestore and vector embeddings)
 */
export async function deleteDocumentChunks(documentId: string): Promise<void> {
  try {
    console.log(`Deleting chunks and embeddings for document ${documentId}`);

    // Delete from Firestore
    const q = query(
      collection(db, CHUNKS_COLLECTION),
      where("metadata.documentId", "==", documentId),
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.docs.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
    });

    await batch.commit();
    console.log(
      `Successfully deleted Firestore chunks for document ${documentId}`,
    );

    // Delete from vector store
    try {
      await deleteDocumentFromVector(documentId);
      console.log(
        `Successfully deleted vector embeddings for document ${documentId}`,
      );
    } catch (vectorError) {
      console.error("Error deleting vector embeddings:", vectorError);
      // Don't fail the operation if vector deletion fails
    }
  } catch (error) {
    console.error("Error deleting document chunks:", error);
    throw new Error("Failed to delete document chunks");
  }
}

/**
 * Generate embeddings for existing chunks that don't have them
 */
export async function generateMissingEmbeddings(documentId: string): Promise<{
  success: boolean;
  generated: number;
  error?: string;
}> {
  try {
    console.log(`Checking for missing embeddings for document ${documentId}`);

    const chunks = await getDocumentChunks(documentId);
    const chunksWithoutEmbeddings = chunks.filter(
      (chunk) => !chunk.hasEmbedding,
    );

    if (chunksWithoutEmbeddings.length === 0) {
      console.log("All chunks already have embeddings");
      return {
        success: true,
        generated: 0,
      };
    }

    console.log(
      `Generating embeddings for ${chunksWithoutEmbeddings.length} chunks`,
    );

    // Convert to PDFChunk format for embedding generation
    const pdfChunks: PDFChunk[] = chunksWithoutEmbeddings.map((chunk) => ({
      id: chunk.id,
      text: chunk.text,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      metadata: chunk.metadata,
    }));

    const embeddingResult = await storeDocumentEmbeddings(pdfChunks);

    if (
      embeddingResult.stored > 0 &&
      embeddingResult.storedChunkIds.length > 0
    ) {
      // Mark only the chunks that were actually stored successfully
      await markChunksWithEmbeddings(embeddingResult.storedChunkIds);

      return {
        success: true,
        generated: embeddingResult.stored,
      };
    } else {
      return {
        success: false,
        generated: 0,
        error: embeddingResult.error,
      };
    }
  } catch (error) {
    console.error("Error generating missing embeddings:", error);
    return {
      success: false,
      generated: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create processing status record
 */
export async function createProcessingStatus(
  documentId: string,
): Promise<string> {
  try {
    const statusDoc = await addDoc(
      collection(db, PROCESSING_STATUS_COLLECTION),
      {
        documentId,
        status: "pending",
        startedAt: Timestamp.now(),
      },
    );
    return statusDoc.id;
  } catch (error) {
    console.error("Error creating processing status:", error);
    throw new Error("Failed to create processing status");
  }
}

/**
 * Update processing status with embedding information
 */
export async function updateProcessingStatus(
  statusId: string,
  status: ProcessingStatus["status"],
  error?: string,
  stats?: ProcessingStatus["stats"],
): Promise<void> {
  try {
    const statusDoc = doc(db, PROCESSING_STATUS_COLLECTION, statusId);
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (status === "completed" || status === "failed") {
      updateData.completedAt = Timestamp.now();
    }

    if (error) {
      updateData.error = error;
    }

    if (stats) {
      updateData.stats = stats;
    }

    await updateDoc(statusDoc, updateData);
  } catch (error) {
    console.error("Error updating processing status:", error);
    throw new Error("Failed to update processing status");
  }
}

/**
 * Get processing status for a document
 */
export async function getProcessingStatus(
  documentId: string,
): Promise<ProcessingStatus | null> {
  try {
    const q = query(
      collection(db, PROCESSING_STATUS_COLLECTION),
      where("documentId", "==", documentId),
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Sort by startedAt on client side and get the most recent
    const docs = querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          documentId: data.documentId,
          status: data.status,
          startedAt: data.startedAt,
          completedAt: data.completedAt,
          error: data.error,
          stats: data.stats,
        };
      })
      .sort((a, b) => {
        const aTime = convertTimestamp(a.startedAt).getTime();
        const bTime = convertTimestamp(b.startedAt).getTime();
        return bTime - aTime; // Most recent first
      });

    const latestDoc = docs[0];

    return {
      id: latestDoc.id,
      documentId: latestDoc.documentId,
      status: latestDoc.status,
      startedAt: convertTimestamp(latestDoc.startedAt),
      completedAt: latestDoc.completedAt
        ? convertTimestamp(latestDoc.completedAt)
        : undefined,
      error: latestDoc.error,
      stats: latestDoc.stats,
    };
  } catch (error) {
    console.error("Error fetching processing status:", error);
    throw new Error("Failed to fetch processing status");
  }
}

/**
 * Check if document has been processed and has embeddings
 */
export async function isDocumentProcessed(
  documentId: string,
): Promise<boolean> {
  try {
    const chunks = await getDocumentChunks(documentId);

    // Document is considered processed if it has chunks with embeddings
    return chunks.length > 0 && chunks.every((chunk) => chunk.hasEmbedding);
  } catch (error) {
    console.error("Error checking if document is processed:", error);
    return false;
  }
}

/**
 * Get processing statistics for a document
 */
export async function getProcessingStats(documentId: string): Promise<{
  totalChunks: number;
  chunksWithEmbeddings: number;
  processed: boolean;
  lastProcessed?: Date;
  embeddingsReady: boolean;
} | null> {
  try {
    const [chunks, status] = await Promise.all([
      getDocumentChunks(documentId),
      getProcessingStatus(documentId),
    ]);

    const chunksWithEmbeddings = chunks.filter(
      (chunk) => chunk.hasEmbedding,
    ).length;

    return {
      totalChunks: chunks.length,
      chunksWithEmbeddings,
      processed: chunks.length > 0,
      embeddingsReady:
        chunks.length > 0 && chunksWithEmbeddings === chunks.length,
      lastProcessed: status?.completedAt,
    };
  } catch (error) {
    console.error("Error getting processing stats:", error);
    return null;
  }
}
