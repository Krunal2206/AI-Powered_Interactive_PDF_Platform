import React from "react";
import { Progress } from "@/components/ui/progress";

interface FileProgressBarProps {
  progress: number;
  className?: string;
}

export const FileProgressBar: React.FC<FileProgressBarProps> = ({
  progress,
  className = "",
}) => {
  return (
    <div className={`flex-1 max-w-xs mx-4 space-y-1 ${className}`}>
      <Progress value={progress} className="h-2 bg-slate-700" />
      <p className="text-xs text-slate-400 text-center">
        {Math.round(progress)}%
      </p>
    </div>
  );
};
