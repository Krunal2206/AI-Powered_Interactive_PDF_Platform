import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { UploadedFile } from "../../types/upload";
import { formatFileSize, getStatusIcon } from "@/lib/upload";
import { FileProgressBar } from "./FileProgressBar";
import { StatusBadge } from "./StatusBadge";

interface FileItemProps {
  fileObj: UploadedFile;
  onRemove: (id: string) => void;
}

export const FileItem: React.FC<FileItemProps> = ({ fileObj, onRemove }) => {
  return (
    <Card className="bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50 transition-colors duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-shrink-0">{getStatusIcon(fileObj.status)}</div>

            <div className="flex-1 min-w-0">
              <p className="text-slate-300 text-sm font-medium truncate">
                {fileObj.file.name}
              </p>
              <p className="text-slate-500 text-xs">
                {formatFileSize(fileObj.file.size)}
              </p>
              {fileObj.errorMessage && (
                <p className="text-red-400 text-xs mt-1">
                  {fileObj.errorMessage}
                </p>
              )}
            </div>

            {fileObj.status === "uploading" && (
              <FileProgressBar progress={fileObj.progress} />
            )}

            <div className="flex-shrink-0">
              <StatusBadge status={fileObj.status} />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(fileObj.id)}
            className="flex-shrink-0 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            aria-label={`Remove ${fileObj.file.name}`}
          >
            <X size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
