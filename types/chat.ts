import { Timestamp } from "firebase/firestore";

export interface ChatMessage {
  id: string;
  documentId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Timestamp;
}

export interface ProcessingStats {
  totalPages: number;
  totalCharacters: number;
  totalChunks: number;
  processingTime: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  isProcessed: boolean;
  error: string | null;
  stats: ProcessingStats | null;
}
