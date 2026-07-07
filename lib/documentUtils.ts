import { Document } from "@/types/upload";

export { formatFileSize } from "@/lib/upload";

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

export const getStatusTextColor = (status: Document["status"]): string => {
  switch (status) {
    case "ready":
      return "text-green-400";
    case "processing":
      return "text-yellow-400";
    case "uploading":
      return "text-blue-400";
    case "error":
      return "text-red-400";
    default:
      return "text-gray-400";
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
): string => {
  console.error(defaultMessage, error);
  return `${defaultMessage}. Please try again.`;
};