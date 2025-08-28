import React from "react";
import { Button } from "@/components/ui/button";
import { UploadedFile } from "../../types/upload";
import { FileItem } from "./FileItem";

interface FileListProps {
  files: UploadedFile[];
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
  onDone: () => void;
  isUploading: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemoveFile,
  onClearAll,
  onDone,
  isUploading,
}) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-medium text-gray-300 mb-4">
        Uploaded File{files.length > 1 ? "s" : ""}
      </h2>

      <div className="space-y-3">
        {files.map((fileObj) => (
          <FileItem
            key={fileObj.id}
            fileObj={fileObj}
            onRemove={onRemoveFile}
          />
        ))}
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button
          variant="outline"
          onClick={onClearAll}
          disabled={isUploading}
          className="border-slate-700 hover:text-slate-300 hover:bg-slate-800/50 cursor-pointer"
        >
          Clear All
        </Button>
        <Button
          onClick={onDone}
          disabled={isUploading}
          className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
        >
          Done
        </Button>
      </div>
    </div>
  );
};
