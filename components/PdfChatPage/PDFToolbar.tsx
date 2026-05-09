"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, ZoomIn, ZoomOut } from "lucide-react";

interface PDFToolbarProps {
  pageNumber: number;
  numPages: number;
  scale: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDownload: () => void;
}

export const PDFToolbar = ({
  pageNumber,
  numPages,
  scale,
  searchTerm,
  setSearchTerm,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onDownload,
}: PDFToolbarProps) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 p-2 sm:p-4">
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevPage}
              disabled={pageNumber <= 1}
              className="border-slate-700 hover:text-slate-300 hover:bg-slate-800/50 cursor-pointer px-3"
            >
              ←
            </Button>
            <span className="text-sm text-slate-300 min-w-[60px] sm:min-w-[80px] text-center">
              {pageNumber} / {numPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={pageNumber >= numPages}
              className="border-slate-700 hover:text-slate-300 hover:bg-slate-800/50 cursor-pointer px-3"
            >
              →
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onZoomOut}
              className="border-slate-700 hover:text-slate-300 hover:bg-slate-800/50 cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-300 min-w-[45px] sm:min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onZoomIn}
              className="border-slate-700 hover:text-slate-300 hover:bg-slate-800/50 cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search in document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-40 sm:w-64 bg-slate-800 border-slate-700 focus:border-purple-500 text-white text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="border-slate-700 hover:text-slate-300 hover:bg-slate-800/50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
