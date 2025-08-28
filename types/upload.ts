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
  mimeType: string;
  status: "uploading" | "processing" | "ready" | "error";
  thumbnailUrl?: string;
  pageCount?: number;
  description?: string;
}

export interface DocumentUploadData {
  title: string;
  originalFilename: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  fileSize: number;
  userId: string;
  mimeType: string;
  status: "ready";
  thumbnailUrl?: string;
  pageCount?: number;
  description?: string;
}

export interface DocumentUpdateData {
  title?: string;
  description?: string;
  status?: Document["status"];
  thumbnailUrl?: string;
  pageCount?: number;
}