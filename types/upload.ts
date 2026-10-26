import { Timestamp } from "firebase/firestore";

export interface CloudinaryData {
  public_id: string;
  secure_url: string;
  resource_type: string;
  bytes: number;
}

export interface UploadedFile {
  file: File;
  id: string;
  status: "uploading" | "success" | "error";
  progress: number;
  cloudinaryData?: CloudinaryData;
  errorMessage?: string;
}

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface Document {
  id: string;
  title: string;
  originalFilename: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  fileSize: number;
  uploadedAt: Date;
  userId: string;
  status: "uploading" | "processing" | "ready" | "error";
  pageCount?: number;
  description?: string;
  totalChats: number;
  processingMetadata?: {
    totalChunks: number;
    vectorized: boolean;
    lastProcessedAt: Date;
  };
}

export interface DocumentUploadData {
  title: string;
  originalFilename: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  fileSize: number;
  userId: string;
  status: "ready";
  pageCount?: number;
  description?: string;
  totalChats: number;
  processingMetadata?: {
    totalChunks: number;
    vectorized: boolean;
    lastProcessedAt: Date;
  };
}

export interface DocumentUpdateData {
  title?: string;
  description?: string;
  status?: Document["status"];
  pageCount?: number;
  totalChats?: number;
  processingMetadata?: {
    totalChunks: number;
    vectorized: boolean;
    lastProcessedAt: Date;
  };
}

export interface UploadUsageEntry {
  id: string;
  at: Timestamp;
  status: "reserved" | "completed";
  documentId?: string;
}

export type ReserveResult = { ok: true } | { ok: false; used: number };