export const COLLECTIONS = {
  DOCUMENTS: "pdf-documents",
  CHAT_MESSAGES: "chat-messages",
  CHUNKS: "pdf-chunks",
  PROCESSING_STATUS: "processing-status",
  UPLOAD_USAGE: "upload-usage",
  UPLOAD_USAGE_HISTORY: "history",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
