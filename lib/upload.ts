import React from "react";
import { UploadedFile } from "@/types/upload";
import { CheckCircle, AlertCircle, File } from "lucide-react";

export const generateFileId = (): string =>
  Math.random().toString(36).substr(2, 9);

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getStatusIcon = (status: UploadedFile["status"]) => {
  const iconProps = { size: 20 };
  switch (status) {
    case "success":
      return React.createElement(CheckCircle, {
        ...iconProps,
        className: "text-green-500",
      });
    case "error":
      return React.createElement(AlertCircle, {
        ...iconProps,
        className: "text-red-500",
      });
    default:
      return React.createElement(File, {
        ...iconProps,
        className: "text-slate-400",
      });
  }
};
