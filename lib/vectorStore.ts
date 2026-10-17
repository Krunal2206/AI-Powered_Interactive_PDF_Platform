import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PDFChunk } from "./pdfProcessor";
import { serverEnv } from "./env";

// Helper function to clean text for embedding
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/[\n\r]+/g, " ") // Replace newlines with space
    .trim(); // Remove leading/trailing whitespace
}

// Singleton instance
let vectorStoreInstance: VectorStoreService | null = null;

// Helper functions that match the old interface
export async function storeDocumentEmbeddings(chunks: PDFChunk[]) {
  const vectorStore = getInstance();
  return vectorStore.storeChunkEmbeddings(chunks);
}

export async function deleteDocumentFromVector(documentId: string) {
  const vectorStore = getInstance();
  return vectorStore.deleteDocumentEmbeddings(documentId);
}

// Singleton getter
function getInstance(): VectorStoreService {
  vectorStoreInstance ??= new VectorStoreService();
  return vectorStoreInstance;
}

export interface VectorSearchResult {
  chunkId: string;
  content: string;
  score: number;
  metadata: {
    documentId: string;
    pageNumber: number;
    chunkIndex: number;
    fileName: string;
  };
}

export interface EmbeddingMetadata {
  chunkId: string;
  documentId: string;
  pageNumber: number;
  chunkIndex: number;
  fileName: string;
  totalPages: number;
}

export class VectorStoreService {
  private readonly embeddings: GoogleGenerativeAIEmbeddings;
  private readonly pinecone: Pinecone;
  private readonly indexName: string;
  private vectorStore: PineconeStore | null = null;

  constructor() {
    // Initialize Google Generative AI for embeddings.
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: serverEnv.GOOGLE_API_KEY,
      modelName: "gemini-embedding-001",
    });

    this.pinecone = new Pinecone({
      apiKey: serverEnv.PINECONE_API_KEY,
    });
    this.indexName = serverEnv.PINECONE_INDEX_NAME;
  }

  private async initializeVectorStore(): Promise<PineconeStore> {
    if (this.vectorStore) {
      return this.vectorStore;
    }

    try {
      const pineconeIndex = this.pinecone
        .Index(this.indexName)
        .namespace("pdf-documents");

      this.vectorStore = new PineconeStore(this.embeddings, {
        pineconeIndex,
        textKey: "content",
        namespace: "pdf-documents",
      });

      return this.vectorStore;
    } catch (error) {
      console.error("Failed to initialize vector store:", error);
      throw new Error("Vector store initialization failed");
    }
  }

  async storeChunkEmbeddings(chunks: PDFChunk[]): Promise<{
    success: boolean;
    stored: number;
    skipped: number;
    storedChunkIds: string[];
    error?: string;
  }> {
    try {
      const vectorStore = await this.initializeVectorStore();

      // Skip chunks already in Pinecone with identical text
      const alreadyStored = await this.findAlreadyStoredChunkIds(chunks);
      const chunksToEmbed = chunks.filter(
        (chunk) => !alreadyStored.has(chunk.id),
      );

      if (alreadyStored.size > 0) {
        console.log(
          `[Embeddings] Skipping ${alreadyStored.size} of ${chunks.length} chunks already stored`,
        );
      }

      // Process chunks in smaller batches
      const batchSize = 4;
      const MAX_ATTEMPTS = 3;
      let storedCount = 0;
      const storedChunkIds: string[] = [...alreadyStored];

      // Process chunks in batches
      for (let i = 0; i < chunksToEmbed.length; i += batchSize) {
        const batchChunks = chunksToEmbed.slice(i, i + batchSize);

        // Prepare documents with cleaned text
        const documents = batchChunks.map((chunk) => ({
          pageContent: cleanText(chunk.text).substring(0, 2048),
          metadata: {
            chunkId: chunk.id,
            documentId: chunk.metadata.documentId,
            pageNumber: chunk.pageNumber,
            chunkIndex: chunk.chunkIndex,
            fileName: chunk.metadata.fileName,
            totalPages: chunk.metadata.totalPages,
            chunkSize: chunk.metadata.chunkSize,
          } as EmbeddingMetadata,
        }));

        let batchStored = false;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          try {
            // Same IDs on every attempt, so a retry overwrites, never duplicates
            await vectorStore.addDocuments(documents, {
              ids: batchChunks.map((chunk) => chunk.id),
            });
            batchStored = true;
            break;
          } catch (batchError) {
            console.error(
              `Error processing batch ${Math.floor(i / batchSize) + 1} (attempt ${attempt}/${MAX_ATTEMPTS}):`,
              batchError,
            );
            if (attempt < MAX_ATTEMPTS) {
              await new Promise((resolve) =>
                setTimeout(resolve, attempt * 1000),
              );
            }
          }
        }

        if (batchStored) {
          storedCount += documents.length;
          // Track only the chunk IDs that were actually stored
          batchChunks.forEach((chunk) => storedChunkIds.push(chunk.id));
        }

        if (i + batchSize < chunksToEmbed.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      return {
        success: true,
        stored: storedCount,
        skipped: alreadyStored.size,
        storedChunkIds,
      };
    } catch (error) {
      console.error("Error storing chunk embeddings:", error);
      return {
        success: false,
        stored: 0,
        skipped: 0,
        storedChunkIds: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async searchSimilarChunks(
    query: string,
    documentId: string,
    options: {
      topK?: number;
      scoreThreshold?: number;
    } = {},
  ): Promise<VectorSearchResult[]> {
    try {
      const { topK = 5, scoreThreshold = 0.3 } = options;
      const vectorStore = await this.initializeVectorStore();

      const searchStart = performance.now();
      const results = await vectorStore.similaritySearchWithScore(
        cleanText(query),
        topK,
        { documentId: documentId },
      );
      console.log(
        `[PERF] Search completed in: ${performance.now() - searchStart} ms`,
      );

      const searchResults: VectorSearchResult[] = results
        .filter(([, score]) => score >= scoreThreshold)
        .map(([document, score]) => ({
          chunkId: document.metadata.chunkId,
          content: document.pageContent,
          score,
          metadata: {
            documentId: document.metadata.documentId,
            pageNumber: document.metadata.pageNumber,
            chunkIndex: document.metadata.chunkIndex,
            fileName: document.metadata.fileName,
          },
        }));

      return searchResults;
    } catch (error) {
      console.error("Error searching similar chunks:", error);
      throw new Error("Failed to search similar chunks");
    }
  }

  async deleteDocumentEmbeddings(documentId: string): Promise<{
    success: boolean;
    deleted: number;
    error?: string;
  }> {
    try {
      const pineconeIndex = this.pinecone
        .Index(this.indexName)
        .namespace("pdf-documents");

      const queryResponse = await pineconeIndex.query({
        vector: new Array(3072).fill(0),
        topK: 10000,
        // includeMetadata: true,
        filter: {
          documentId: { $eq: documentId },
        },
      });

      if (!queryResponse.matches?.length) {
        return {
          success: true,
          deleted: 0,
        };
      }

      const vectorIds = queryResponse.matches.map((match) => match.id);

      // Pinecone allows at most 1000 IDs per delete request
      const DELETE_BATCH_SIZE = 1000;
      for (let i = 0; i < vectorIds.length; i += DELETE_BATCH_SIZE) {
        await pineconeIndex.deleteMany(
          vectorIds.slice(i, i + DELETE_BATCH_SIZE),
        );
      }

      return {
        success: true,
        deleted: vectorIds.length,
      };
    } catch (error) {
      console.error("Error deleting document embeddings:", error);
      return {
        success: false,
        deleted: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async findAlreadyStoredChunkIds(
    chunks: PDFChunk[],
  ): Promise<Set<string>> {
    const alreadyStored = new Set<string>();

    try {
      const pineconeIndex = this.pinecone
        .Index(this.indexName)
        .namespace("pdf-documents");

      const batchSize = 100;

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batchChunks = chunks.slice(i, i + batchSize);
        const chunkIds = await pineconeIndex.fetch(
          batchChunks.map((chunk) => chunk.id),
        );

        for (const chunk of batchChunks) {
          const record = chunkIds.records[chunk.id];

          if (
            record?.metadata?.content ===
            cleanText(chunk.text).substring(0, 2048)
          ) {
            alreadyStored.add(chunk.id);
          }
        }
      }
    } catch (error) {
      console.warn(
        "Could not check existing vectors, embedding all chunks:",
        error,
      );
      alreadyStored.clear();
    }

    return alreadyStored;
  }
}
