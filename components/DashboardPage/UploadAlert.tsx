import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UploadIcon } from "lucide-react";

interface UploadAlertProps {
  isVisible: boolean;
  message?: string;
}

export const UploadAlert: React.FC<UploadAlertProps> = ({
  isVisible,
  message = "Uploading files... Please wait.",
}) => {
  if (!isVisible) return null;

  return (
    <Alert className="mt-6 bg-purple-500/10 border-purple-500/30">
      <UploadIcon className="h-4 w-4 text-purple-400" />
      <AlertDescription className="text-purple-300">{message}</AlertDescription>
    </Alert>
  );
};
