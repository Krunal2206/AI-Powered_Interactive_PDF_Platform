import { Document } from "@/types/upload";

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getStatusColor = (status: Document["status"]): string => {
  switch (status) {
    case "ready":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "processing":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "uploading":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "error":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

export const confirmDelete = (
  message: string = "Are you sure you want to delete this document?",
): boolean => {
  return window.confirm(message);
};

export const handleDocumentError = (
  error: unknown,
  defaultMessage: string
): void => {
  console.error(defaultMessage, error);
  alert(`${defaultMessage}. Please try again.`);
};