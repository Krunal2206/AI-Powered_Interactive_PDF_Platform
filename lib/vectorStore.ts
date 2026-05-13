import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PDFChunk } from "./pdfProcessor";

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
  if (!vectorStoreInstance) {
    vectorStoreInstance = new VectorStoreService();
  }
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
  startCharIndex: number;
  endCharIndex: number;
  totalPages: number;
}

export class VectorStoreService {
  private embeddings: GoogleGenerativeAIEmbeddings;
  private pinecone: Pinecone;
  private indexName: string;
  private vectorStore: PineconeStore | null = null;

  constructor() {
    // Initialize Google Generative AI for embeddings
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY!,
      modelName: "models/embedding-001",
    });

    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    this.indexName = process.env.PINECONE_INDEX_NAME || "pdf-chat-embeddings";
  }

  private async initializeVectorStore(): Promise<PineconeStore> {
    if (this.vectorStore) {
      return this.vectorStore;
    }

    try {
      const pineconeIndex = this.pinecone.Index(this.indexName);

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

  private async embedText(text: string): Promise<number[] | null> {
    try {
      // Clean and prepare text
      const cleanedText = cleanText(text).substring(0, 2048); // Limit length

      // Generate embedding
      const embedding = await this.embeddings.embedQuery(cleanedText);

      // Verify embedding
      if (!embedding || embedding.length !== 768) {
        console.warn(`Invalid embedding dimension: ${embedding?.length}`);
        return null;
      }

      return embedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      return null;
    }
  }

  async storeChunkEmbeddings(chunks: PDFChunk[]): Promise<{
    success: boolean;
    stored: number;
    error?: string;
  }> {
    try {
      console.log(`Starting to store embeddings for ${chunks.length} chunks`);
      const vectorStore = await this.initializeVectorStore();

      // Process chunks in smaller batches
      const batchSize = 4;
      let storedCount = 0;

      // Process chunks in batches
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batchChunks = chunks.slice(i, i + batchSize);
        console.log(
          `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            chunks.length / batchSize
          )}`
        );

        // Prepare documents with cleaned text
        const documents = batchChunks.map((chunk) => ({
          pageContent: cleanText(chunk.text).substring(0, 2048),
          metadata: {
            chunkId: chunk.id,
            documentId: chunk.metadata.documentId,
            pageNumber: chunk.pageNumber,
            chunkIndex: chunk.chunkIndex,
            fileName: chunk.metadata.fileName,
            startCharIndex: chunk.metadata.startCharIndex,
            endCharIndex: chunk.metadata.endCharIndex,
            totalPages: chunk.metadata.totalPages,
            chunkSize: chunk.metadata.chunkSize,
          } as EmbeddingMetadata,
        }));

        try {
          // First verify we can generate embeddings
          const testEmbedding = await this.embedText(documents[0].pageContent);
          if (!testEmbedding) {
            console.warn("Failed to generate test embedding, skipping batch");
            continue;
          }

          // If test embedding succeeded, process the batch
          await vectorStore.addDocuments(documents);
          storedCount += documents.length;
          console.log(
            `Successfully stored batch with ${documents.length} chunks`
          );

          // Add a small delay between batches
          if (i + batchSize < chunks.length) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (batchError) {
          console.error(
            `Error processing batch ${Math.floor(i / batchSize) + 1}:`,
            batchError
          );
          continue; // Continue with next batch even if this one fails
        }
      }

      console.log(`Successfully stored ${storedCount} embeddings`);
      return {
        success: true,
        stored: storedCount,
      };
    } catch (error) {
      console.error("Error storing chunk embeddings:", error);
      return {
        success: false,
        stored: 0,
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
    } = {}
  ): Promise<VectorSearchResult[]> {
    try {
      const { topK = 5, scoreThreshold = 0.7 } = options;
      const vectorStore = await this.initializeVectorStore();

      // First verify we can generate a query embedding
      const testEmbedding = await this.embedText(query);
      if (!testEmbedding) {
        throw new Error("Failed to generate query embedding");
      }

      const results = await vectorStore.similaritySearchWithScore(
        cleanText(query),
        topK,
        {
          filter: { documentId: documentId },
        }
      );

      const searchResults: VectorSearchResult[] = results
        .filter(([_, score]) => score >= scoreThreshold)
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

      console.log(
        `Found ${searchResults.length} relevant chunks for query: "${query}"`
      );

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
      console.log(`Deleting embeddings for document: ${documentId}`);
      const pineconeIndex = this.pinecone.Index(this.indexName);

      const queryResponse = await pineconeIndex.query({
        vector: new Array(768).fill(0),
        topK: 10000,
        includeMetadata: true,
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

      const vectors = queryResponse.matches.map((match) => match.id);
      await pineconeIndex.deleteMany({ ids: vectors });

      console.log(
        `Deleted ${vectors.length} vectors for document: ${documentId}`
      );

      return {
        success: true,
        deleted: vectors.length,
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
}
