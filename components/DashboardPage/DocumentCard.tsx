"use client";

import {
  Download,
  Edit3,
  Eye,
  FileText,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";
import { Button } from "../ui/button";
import { Document } from "@/types/upload";
import { formatDistanceToNow } from "date-fns";

interface DocumentCardProps {
  document: Document;
    onView: (document: Document) => void;
    onEdit: (document: Document) => void;
    onDelete: (documentId: string) => void;
    onDownload: (document: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onEdit,
  onDownload,
  onDelete
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status: Document["status"]) => {
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

  return (
    <div className="group relative aspect-[3/4] bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-purple-500/10 hover:scale-105 overflow-hidden">
      <div
        className="absolute inset-0 p-4 pointer-events-none flex flex-col"
      >
        <div className="flex items-start justify-between mb-4 pointer-events-auto">
          <div className="p-3 rounded-lg bg-slate-700/30 group-hover:bg-purple-600/20 transition-colors duration-300">
            <FileText
              size={24}
              className="text-slate-400 group-hover:text-purple-400 transition-colors duration-300"
            />
          </div>

          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-slate-800 border-slate-700"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onView(document);
                }}
                className="hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <Eye size={16} className="mr-2" />
                View
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                    onEdit(document);
                }}
                className="hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <Edit3 size={16} className="mr-2" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                    onDownload(document);
                }}
                className="hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <Download size={16} className="mr-2" />
                Download
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                    onDelete(document.id);
                }}
                className="hover:bg-red-600 text-red-400 hover:text-white"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-300 font-medium text-sm mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
              {document.title}
            </h3>

            {document.description && (
              <p className="text-slate-500 text-xs mb-2 line-clamp-2">
                {document.description}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {formatFileSize(document.fileSize)}
              </span>
              <span
                className={`text-xs font-medium ${getStatusColor(
                  document.status
                )}`}
              >
                {document.status}
              </span>
            </div>

            <div className="text-xs text-slate-500">
              {formatDistanceToNow(document.uploadedAt, { addSuffix: true })}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:to-purple-900/10 rounded-lg transition-all duration-300" />
      </div>
    </div>
  );
};

export default DocumentCard;
