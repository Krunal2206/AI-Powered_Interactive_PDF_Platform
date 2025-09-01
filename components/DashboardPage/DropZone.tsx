import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UploadIcon } from "lucide-react";

interface DropZoneProps {
  onDrop: (files: File[]) => void;
  isDragActive: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  getRootProps: () => any;
  getInputProps: () => any;
}

export const DropZone: React.FC<DropZoneProps> = ({
  isDragActive,
  isDragAccept,
  isDragReject,
  getRootProps,
  getInputProps,
}) => {
  const borderColor = useMemo(() => {
    if (isDragAccept) return "border-green-500/50 bg-green-500/5";
    if (isDragReject) return "border-red-500/50 bg-red-500/5";
    if (isDragActive) return "border-purple-500/50 bg-purple-500/5";
    return "border-slate-700/50 hover:border-purple-500/50";
  }, [isDragActive, isDragAccept, isDragReject]);

  const iconColor = useMemo(() => {
    return isDragActive
      ? "bg-purple-600/20 text-purple-400"
      : "bg-slate-700/30 text-slate-400 group-hover:bg-purple-600/20 group-hover:text-purple-400";
  }, [isDragActive]);

  const textColor = useMemo(() => {
    return isDragActive ? "text-purple-300" : "text-slate-300";
  }, [isDragActive]);

  return (
    <Card
      className={`
        border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer
        bg-slate-900/20 backdrop-blur-sm group
        ${borderColor}
        ${isDragActive ? "scale-[1.02]" : "hover:scale-[1.01]"}
      `}
    >
      <CardContent className="p-12">
        <div {...getRootProps()} className="text-center">
          <input {...getInputProps()} />

          <div className="mb-6">
            <div
              className={`inline-flex p-4 rounded-full transition-all duration-300 ${iconColor}`}
            >
              <UploadIcon size={48} />
            </div>
          </div>

          <div className="space-y-2">
            <p
              className={`text-lg font-medium transition-colors duration-300 ${textColor}`}
            >
              {isDragActive
                ? "Drop the file here..."
                : "Drag 'n' drop your file here, or click to select file"}
            </p>
            <p className="text-slate-500 text-sm">
              Supports: PDF files only (One file at a time)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
