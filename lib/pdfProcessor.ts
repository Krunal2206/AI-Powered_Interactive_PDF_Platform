import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Import pdf-parse statically - the dynamic import was causing issues
import pdfParse from "pdf-parse";

export interface PDFChunk {
  id: string;
  text: string;
  pageNumber: number; // Estimated page based on position
  chunkIndex: number;
  metadata: {
    documentId: string;
    fileName: string;
    totalPages: number;
    chunkSize: number;
    startCharIndex: number;
    endCharIndex: number;
  };
}

export interface PDFProcessingResult {
  chunks: PDFChunk[];
  totalPages: number;
  totalCharacters: number;
  processingTime: number;
}

export interface PDFExtractionOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
}

export class PDFProcessor {
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(options: PDFExtractionOptions = {}) {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: options.chunkSize || 1000,
      chunkOverlap: options.chunkOverlap || 200,
      separators: options.separators || [
        "\n\n",
        "\n",
        ".",
        "!",
        "?",
        ";",
        " ",
        "",
      ],
    });
  }

  /**
   * Extract text from PDF buffer using pdf-parse
   */
  async extractTextFromBuffer(
    pdfBuffer: Buffer,
    documentId: string,
    fileName: string
  ): Promise<PDFProcessingResult> {
    const startTime = Date.now();

    try {
      console.log(
        `Starting PDF processing for ${fileName}, buffer size: ${pdfBuffer.length} bytes`
      );

      // Validate buffer
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error("Invalid PDF buffer: empty or null");
      }

      // Check if buffer starts with PDF header
      const pdfHeader = pdfBuffer.subarray(0, 4).toString();
      if (pdfHeader !== "%PDF") {
        throw new Error("Invalid PDF file: missing PDF header");
      }

      // Parse PDF using pdf-parse
      const pdfData = await pdfParse(pdfBuffer);

      console.log(
        `PDF parsed successfully: ${pdfData.numpages} pages, ${pdfData.text.length} characters`
      );

      const fullText = pdfData.text;
      const totalPages = pdfData.numpages;

      if (!fullText || fullText.trim().length === 0) {
        throw new Error(
          "No text content found in PDF. This might be a scanned PDF that requires OCR."
        );
      }

      // Split text into chunks
      const textChunks = await this.textSplitter.splitText(fullText);

      console.log(`Text split into ${textChunks.length} chunks`);

      // Create PDFChunk objects with metadata
      const chunks: PDFChunk[] = this.createChunksWithMetadata(
        textChunks,
        fullText,
        documentId,
        fileName,
        totalPages
      );

      const processingTime = Date.now() - startTime;

      console.log(`PDF processing completed in ${processingTime}ms`);

      return {
        chunks,
        totalPages,
        totalCharacters: fullText.length,
        processingTime,
      };
    } catch (error) {
      console.error("Error extracting text from PDF:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to extract text from PDF";

      if (error instanceof Error) {
        if (error.message.includes("Invalid PDF")) {
          errorMessage = "Invalid PDF file format";
        } else if (error.message.includes("No text content")) {
          errorMessage =
            "PDF contains no extractable text (possibly scanned images)";
        } else if (error.message.includes("ENOENT")) {
          errorMessage = "PDF file not found or not accessible";
        } else {
          errorMessage = `PDF processing error: ${error.message}`;
        }
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Extract text from PDF URL (Cloudinary URL) with better error handling
   */
  async extractTextFromUrl(
    pdfUrl: string,
    documentId: string,
    fileName: string
  ): Promise<PDFProcessingResult> {
    const startTime = Date.now();

    try {
      console.log(`Fetching PDF from URL: ${pdfUrl}`);

      // Validate URL
      if (!pdfUrl || !pdfUrl.startsWith("http")) {
        throw new Error("Invalid PDF URL provided");
      }

      // Fetch with timeout and proper headers
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(pdfUrl, {
        method: "GET",
        headers: {
          Accept: "application/pdf,*/*",
          "User-Agent": "PDF-Chat-App/1.0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`HTTP Response: ${response.status} ${response.statusText}`);
      console.log(`Content-Type: ${response.headers.get("content-type")}`);
      console.log(`Content-Length: ${response.headers.get("content-length")}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch PDF: ${response.status} ${response.statusText}`
        );
      }

      // Check content type
      const contentType = response.headers.get("content-type");
      if (
        contentType &&
        !contentType.includes("pdf") &&
        !contentType.includes("application/octet-stream")
      ) {
        console.warn(`Unexpected content type: ${contentType}`);
      }

      // Get the PDF data
      const arrayBuffer = await response.arrayBuffer();
      console.log(`Downloaded PDF: ${arrayBuffer.byteLength} bytes`);

      if (arrayBuffer.byteLength === 0) {
        throw new Error("Downloaded PDF is empty");
      }

      const buffer = Buffer.from(arrayBuffer);

      // Process the downloaded PDF
      return this.extractTextFromBuffer(buffer, documentId, fileName);
    } catch (error) {
      console.error("Error fetching PDF from URL:", error);

      let errorMessage = "Failed to fetch PDF from URL";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage =
            "PDF download timed out (file too large or slow connection)";
        } else if (error.message.includes("fetch")) {
          errorMessage = "Network error while downloading PDF";
        } else if (error.message.includes("Invalid PDF URL")) {
          errorMessage = "Invalid PDF URL provided";
        } else {
          errorMessage = `PDF download error: ${error.message}`;
        }
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Create chunks with metadata and estimated page numbers
   */
  private createChunksWithMetadata(
    textChunks: string[],
    fullText: string,
    documentId: string,
    fileName: string,
    totalPages: number
  ): PDFChunk[] {
    const chunks: PDFChunk[] = [];
    let currentCharIndex = 0;

    for (let i = 0; i < textChunks.length; i++) {
      const chunkText = textChunks[i];

      // Find the actual position of this chunk in the full text
      const startCharIndex = fullText.indexOf(chunkText, currentCharIndex);
      const endCharIndex =
        startCharIndex >= 0
          ? startCharIndex + chunkText.length
          : currentCharIndex + chunkText.length;

      // Estimate page number based on character position
      const estimatedPage = Math.max(
        1,
        Math.ceil(
          ((startCharIndex >= 0 ? startCharIndex : currentCharIndex) /
            fullText.length) *
            totalPages
        )
      );

      chunks.push({
        id: `${documentId}-chunk-${i}`,
        text: chunkText.trim(),
        pageNumber: estimatedPage,
        chunkIndex: i,
        metadata: {
          documentId,
          fileName,
          totalPages,
          chunkSize: chunkText.length,
          startCharIndex:
            startCharIndex >= 0 ? startCharIndex : currentCharIndex,
          endCharIndex: endCharIndex,
        },
      });

      // Update current position for next iteration
      currentCharIndex = endCharIndex;
    }

    return chunks;
  }

  /**
   * Process document and return processing status with enhanced error handling
   */
  async processDocument(
    documentId: string,
    cloudinaryUrl: string,
    fileName: string
  ): Promise<{
    success: boolean;
    chunks?: PDFChunk[];
    error?: string;
    stats?: {
      totalPages: number;
      totalCharacters: number;
      totalChunks: number;
      processingTime: number;
    };
  }> {
    try {
      console.log(
        `Processing document ${documentId}: ${fileName} from ${cloudinaryUrl}`
      );

      const result = await this.extractTextFromUrl(
        cloudinaryUrl,
        documentId,
        fileName
      );

      console.log(
        `Successfully processed document ${documentId}: ${result.chunks.length} chunks created`
      );

      return {
        success: true,
        chunks: result.chunks,
        stats: {
          totalPages: result.totalPages,
          totalCharacters: result.totalCharacters,
          totalChunks: result.chunks.length,
          processingTime: result.processingTime,
        },
      };
    } catch (error) {
      console.error(`Failed to process document ${documentId}:`, error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown processing error",
      };
    }
  }
}

// Utility functions
export const createPDFProcessor = (options?: PDFExtractionOptions) => {
  return new PDFProcessor(options);
};

export const extractTextFromPDF = async (
  pdfUrl: string,
  documentId: string,
  fileName: string,
  options?: PDFExtractionOptions
): Promise<PDFProcessingResult> => {
  const processor = new PDFProcessor(options);
  return processor.extractTextFromUrl(pdfUrl, documentId, fileName);
};
