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
import { formatFileSize, getStatusTextColor } from "@/lib/documentUtils";
import Image from "next/image";

interface DocumentCardProps {
  document: Document;
  onView: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onDownload: (document: Document) => void;
}

const getThumbnailUrl = (cloudinaryUrl: string): string => {
  return cloudinaryUrl.replace(/\.pdf$/i, ".jpg");
};

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onEdit,
  onDownload,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const thumbnailUrl =
    document.thumbnailUrl || getThumbnailUrl(document.cloudinaryUrl);

  return (
    <div className="group relative aspect-3/4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-purple-500/10 hover:scale-105 overflow-hidden">
      {/* PDF thumbnail — fills top 60% of card */}
      <div className="absolute inset-0 bottom-[40%]">
        {!thumbnailError ? (
          <Image
            src={thumbnailUrl}
            alt={`Preview of ${document.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 25vw, 20vw"
            className="w-full h-full object-cover object-top"
            onError={() => setThumbnailError(true)}
          />
        ) : (
          // Fallback when Cloudinary can't generate a thumbnail
          <div className="w-full h-full flex items-center justify-center bg-slate-800/80">
            <FileText size={48} className="text-slate-600" />
          </div>
        )}
        {/* Gradient fade from thumbnail into card body */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-900 to-transparent" />
      </div>

      {/* Menu button — always on top */}
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-300 bg-slate-900/60 hover:text-purple-400 hover:bg-purple-500/20 backdrop-blur-sm transition-all duration-300 cursor-pointer"
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
              className="hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-all duration-300"
            >
              <Eye size={16} className="mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(document);
              }}
              className="hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-all duration-300"
            >
              <Edit3 size={16} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDownload(document);
              }}
              className="hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-all duration-300"
            >
              <Download size={16} className="mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(document.id);
              }}
              className="hover:bg-red-600 text-red-400 hover:text-white cursor-pointer transition-all duration-300"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Card body — bottom 40% */}
      <div
        className="absolute inset-x-0 bottom-0 h-[40%] p-3 flex flex-col justify-between"
        onClick={() => onView(document)}
      >
        <div>
          <h3 className="text-slate-200 font-medium text-sm mb-1 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
            {document.title}
          </h3>
          {document.description && (
            <p className="text-slate-500 text-xs line-clamp-1">
              {document.description}
            </p>
          )}
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {formatFileSize(document.fileSize)}
            </span>
            <span
              className={`text-xs font-medium ${getStatusTextColor(document.status)}`}
            >
              {document.status}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {formatDistanceToNow(document.uploadedAt, { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/5 group-hover:to-purple-900/10 rounded-lg transition-all duration-300 pointer-events-none" />
    </div>
  );
};

export default DocumentCard;
