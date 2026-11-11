import { useReducer, useCallback } from "react";
import { ProcessingStats, ProcessingState } from "@/types/chat";

export type { ProcessingStats, ProcessingState } from "@/types/chat";

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

const INITIAL_PROCESSING_STATE: ProcessingState = {
  isChecking: true,
  isProcessing: false,
  isProcessed: false,
  error: null,
  stats: null,
};

type ProcessingAction =
  | { type: "RESET" }
  | { type: "CHECK_STATUS_SUCCESS"; processed: boolean }
  | { type: "CHECK_STATUS_ERROR"; error: string }
  | { type: "START_PROCESSING" }
  | { type: "PROCESS_SUCCESS"; stats: ProcessingStats | null }
  | { type: "PROCESS_ERROR"; error: string }
  | { type: "SET_ERROR"; error: string };

function processingReducer(
  state: ProcessingState,
  action: ProcessingAction,
): ProcessingState {
  switch (action.type) {
    case "RESET":
      return {
        isChecking: false,
        isProcessing: false,
        isProcessed: false,
        error: null,
        stats: null,
      };
    case "CHECK_STATUS_SUCCESS":
      return {
        ...state,
        isChecking: false,
        isProcessed: action.processed,
        error: null,
      };
    case "CHECK_STATUS_ERROR":
      return {
        ...state,
        isChecking: false,
        error: action.error,
      };
    case "START_PROCESSING":
      return {
        ...state,
        isProcessing: true,
        error: null,
      };
    case "PROCESS_SUCCESS":
      return {
        isChecking: false,
        isProcessing: false,
        isProcessed: true,
        error: null,
        stats: action.stats,
      };
    case "PROCESS_ERROR":
      return {
        isChecking: false,
        isProcessing: false,
        isProcessed: false,
        error: action.error,
        stats: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
      };
    default:
      return state;
  }
}

export const usePDFProcessing = (): UsePDFProcessingReturn => {
  const [processingState, dispatch] = useReducer(
    processingReducer,
    INITIAL_PROCESSING_STATE,
  );

  const resetProcessingState = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const checkProcessingStatus = useCallback(
    async (documentId: string): Promise<ProcessingStatusResult | null> => {
      try {
        const response = await fetch(`/api/documents/${documentId}/process`);
        const data = await response.json();

        if (response.ok) {
          dispatch({
            type: "CHECK_STATUS_SUCCESS",
            processed: data.processed,
          });
          return { processed: data.processed, status: data.status };
        }

        dispatch({
          type: "CHECK_STATUS_ERROR",
          error: data.error || "Failed to check processing status",
        });

        return null;
      } catch (error) {
        console.error("Error checking processing status:", error);
        dispatch({
          type: "CHECK_STATUS_ERROR",
          error: "Network error while checking status",
        });
        return null;
      }
    },
    [],
  );

  const processDocument = useCallback(async (documentId: string) => {
    dispatch({ type: "START_PROCESSING" });

    try {
      const response = await fetch(`/api/documents/${documentId}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({
          type: "PROCESS_SUCCESS",
          stats: data.stats || null,
        });
      } else {
        dispatch({
          type: "PROCESS_ERROR",
          error: data.details || data.error || "Failed to process document",
        });
      }
    } catch (error) {
      console.error("Error processing document:", error);
      dispatch({
        type: "PROCESS_ERROR",
        error: "Network error during processing",
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
          dispatch({
            type: "SET_ERROR",
            error: errorData.error || "Failed to clear existing data",
          });
        }
      } catch (error) {
        console.error("Error reprocessing document:", error);
        dispatch({
          type: "SET_ERROR",
          error: "Network error during reprocessing",
        });
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
