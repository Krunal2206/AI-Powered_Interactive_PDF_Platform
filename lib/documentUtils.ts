import { Document, UploadedFile } from "@/types/upload";

export { formatFileSize } from "@/lib/upload";

export type DocumentOrUploadStatus = Document["status"] | UploadedFile["status"];

export interface StatusConfigItem {
  readonly badgeColor: string;
  readonly textColor: string;
  readonly label: string;
  readonly variant: "secondary" | "destructive" | "default" | "outline";
}

export const STATUS_CONFIG: Record<DocumentOrUploadStatus, StatusConfigItem> = {
  ready: {
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
    textColor: "text-green-400",
    label: "Ready",
    variant: "secondary",
  },
  success: {
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
    textColor: "text-green-400",
    label: "Uploaded",
    variant: "secondary",
  },
  processing: {
    badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    textColor: "text-yellow-400",
    label: "Processing",
    variant: "secondary",
  },
  uploading: {
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    textColor: "text-blue-400",
    label: "Uploading",
    variant: "secondary",
  },
  error: {
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
    textColor: "text-red-400",
    label: "Failed",
    variant: "destructive",
  },
};

export const DEFAULT_STATUS_CONFIG: StatusConfigItem = {
  badgeColor: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  textColor: "text-gray-400",
  label: "Unknown",
  variant: "secondary",
};

export const getStatusConfig = (
  status?: DocumentOrUploadStatus | string | null
): StatusConfigItem => {
  if (!status) return DEFAULT_STATUS_CONFIG;
  return (
    STATUS_CONFIG[status as DocumentOrUploadStatus] ?? DEFAULT_STATUS_CONFIG
  );
};

export const getStatusColor = (status: Document["status"]): string => {
  return getStatusConfig(status).badgeColor;
};

export const getStatusTextColor = (status: Document["status"]): string => {
  return getStatusConfig(status).textColor;
};

export const confirmDelete = (
  message: string = "Are you sure you want to delete this document?",
): boolean => {
  return window.confirm(message);
};

export const handleDocumentError = (
  error: unknown,
  defaultMessage: string
): string => {
  console.error(defaultMessage, error);
  return `${defaultMessage}. Please try again.`;
};