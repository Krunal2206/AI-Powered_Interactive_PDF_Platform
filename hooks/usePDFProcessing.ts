// hooks/usePDFProcessing.ts
import { useState, useCallback } from "react";
import { Document } from "@/types/upload";

interface ProcessingStats {
  totalPages: number;
  totalCharacters: number;
  totalChunks: number;
  processingTime: number;
}

interface ProcessingState {
  isProcessing: boolean;
  isProcessed: boolean;
  error: string | null;
  stats: ProcessingStats | null;
}

interface UsePDFProcessingReturn {
  processingState: ProcessingState;
  processDocument: (documentId: string) => Promise<void>;
  checkProcessingStatus: (documentId: string) => Promise<void>;
  resetProcessingState: () => void;
  reprocessDocument: (documentId: string) => Promise<void>;
}

export const usePDFProcessing = (): UsePDFProcessingReturn => {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    isProcessed: false,
    error: null,
    stats: null,
  });

  const resetProcessingState = useCallback(() => {
    setProcessingState({
      isProcessing: false,
      isProcessed: false,
      error: null,
      stats: null,
    });
  }, []);

  const checkProcessingStatus = useCallback(async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/process`);
      const data = await response.json();

      if (response.ok) {
        setProcessingState((prev) => ({
          ...prev,
          isProcessed: data.processed,
          error: null,
        }));
      } else {
        setProcessingState((prev) => ({
          ...prev,
          error: data.error || "Failed to check processing status",
        }));
      }
    } catch (error) {
      console.error("Error checking processing status:", error);
      setProcessingState((prev) => ({
        ...prev,
        error: "Network error while checking status",
      }));
    }
  }, []);

  const processDocument = useCallback(async (documentId: string) => {
    setProcessingState((prev) => ({
      ...prev,
      isProcessing: true,
      error: null,
    }));

    try {
      const response = await fetch(`/api/documents/${documentId}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProcessingState({
          isProcessing: false,
          isProcessed: true,
          error: null,
          stats: data.stats || null,
        });
      } else {
        setProcessingState({
          isProcessing: false,
          isProcessed: false,
          error: data.error || "Failed to process document",
          stats: null,
        });
      }
    } catch (error) {
      console.error("Error processing document:", error);
      setProcessingState({
        isProcessing: false,
        isProcessed: false,
        error: "Network error during processing",
        stats: null,
      });
    }
  }, []);

  const reprocessDocument = useCallback(
    async (documentId: string) => {
      // First delete existing chunks
      try {
        const deleteResponse = await fetch(
          `/api/documents/${documentId}/process`,
          {
            method: "DELETE",
          }
        );

        if (deleteResponse.ok) {
          // Then process again
          await processDocument(documentId);
        } else {
          const errorData = await deleteResponse.json();
          setProcessingState((prev) => ({
            ...prev,
            error: errorData.error || "Failed to clear existing data",
          }));
        }
      } catch (error) {
        console.error("Error reprocessing document:", error);
        setProcessingState((prev) => ({
          ...prev,
          error: "Network error during reprocessing",
        }));
      }
    },
    [processDocument]
  );

  return {
    processingState,
    processDocument,
    checkProcessingStatus,
    resetProcessingState,
    reprocessDocument,
  };
};
