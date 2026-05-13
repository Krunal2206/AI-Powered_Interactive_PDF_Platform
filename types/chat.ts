// types/chat.ts
import { Timestamp } from "firebase/firestore";

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Timestamp;
  metadata?: {
    documentId?: string;
    chunkReferences?: string[];
    pageReferences?: number[];
    citations?: {
      pageNumber: number;
      text: string;
    }[];
    tokens?: number;
  };
}

export interface ChatSession {
  id: string;
  documentId: string;
  userId: string;
  messages: string[]; // Array of message IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
  title?: string;
  lastMessage?: string;
  messageCount: number;
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
