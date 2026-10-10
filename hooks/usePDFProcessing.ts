import { useState, useCallback } from "react";

interface ProcessingStats {
  totalPages: number;
  totalCharacters: number;
  totalChunks: number;
  processingTime: number;
}

interface ProcessingState {
  isChecking: boolean;
  isProcessing: boolean;
  isProcessed: boolean;
  error: string | null;
  stats: ProcessingStats | null;
}

export interface ProcessingStatusResult {
  processed: boolean;
  status?: string;
}

interface UsePDFProcessingReturn {
  processingState: ProcessingState;
  processDocument: (documentId: string) => Promise<void>;
  checkProcessingStatus: (
    documentId: string,
  ) => Promise<ProcessingStatusResult | null>;
  resetProcessingState: () => void;
  reprocessDocument: (documentId: string) => Promise<void>;
}

export const usePDFProcessing = (): UsePDFProcessingReturn => {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isChecking: true,
    isProcessing: false,
    isProcessed: false,
    error: null,
    stats: null,
  });

  const resetProcessingState = useCallback(() => {
    setProcessingState({
      isChecking: false,
      isProcessing: false,
      isProcessed: false,
      error: null,
      stats: null,
    });
  }, []);

  const checkProcessingStatus = useCallback(
    async (documentId: string): Promise<ProcessingStatusResult | null> => {
      try {
        const response = await fetch(`/api/documents/${documentId}/process`);
        const data = await response.json();

        if (response.ok) {
          setProcessingState((prev) => ({
            ...prev,
            isChecking: false,
            isProcessed: data.processed,
            error: null,
          }));
          return { processed: data.processed, status: data.status };
        }

        setProcessingState((prev) => ({
          ...prev,
          isChecking: false,
          error: data.error || "Failed to check processing status",
        }));

        return null;
      } catch (error) {
        console.error("Error checking processing status:", error);
        setProcessingState((prev) => ({
          ...prev,
          isChecking: false,
          error: "Network error while checking status",
        }));
        return null;
      }
    },
    [],
  );

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
          isChecking: false,
          isProcessing: false,
          isProcessed: true,
          error: null,
          stats: data.stats || null,
        });
      } else {
        setProcessingState({
          isChecking: false,
          isProcessing: false,
          isProcessed: false,
          error: data.error || "Failed to process document",
          stats: null,
        });
      }
    } catch (error) {
      console.error("Error processing document:", error);
      setProcessingState({
        isChecking: false,
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
          },
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
    [processDocument],
  );

  return {
    processingState,
    processDocument,
    checkProcessingStatus,
    resetProcessingState,
    reprocessDocument,
  };
};
