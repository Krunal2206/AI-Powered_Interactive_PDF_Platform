import React from "react";
import { UploadedFile } from "@/types/upload";
import { CheckCircle, AlertCircle, File } from "lucide-react";

interface StatusIconProps {
  readonly status: UploadedFile["status"];
  readonly size?: number;
}

export function StatusIcon({ status, size = 20 }: StatusIconProps) {
  switch (status) {
    case "success":
      return <CheckCircle size={size} className="text-green-500" />;
    case "error":
      return <AlertCircle size={size} className="text-red-500" />;
    default:
      return <File size={size} className="text-slate-400" />;
  }
}
