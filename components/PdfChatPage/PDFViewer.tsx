"use client";

import { useState, useEffect } from "react";
import { PDFToolbar } from "./PDFToolbar";
import { PDFDocument } from "./PDFDocument";
import { Document as DocumentType } from "@/types/upload";
import { useToast } from "@/hooks/useToast";

interface PDFViewerProps {
  document: DocumentType;
  isFullscreen: boolean;
}

export const PDFViewer = ({ document, isFullscreen }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [matchCount, setMatchCount] = useState<number>(0);
  const toast = useToast();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setMatchCount(0);
    }
  }, [searchTerm]);

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(2, prev + 0.2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.2));
  };

  const handleDownload = async () => {
    try {
      if (document) {
        const response = await fetch(document.cloudinaryUrl);
        if (!response.ok) throw new Error("Failed to fetch document");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = window.document.createElement("a");
        a.href = url;
        a.download = document.originalFilename || `${document.title}.pdf`;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error("Failed to download document. Please try again.");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div
      className={`${
        isFullscreen ? "w-full" : "flex-1"
      } flex flex-col border-r border-slate-800 lg:border-r-0`}
    >
      <PDFToolbar
        pageNumber={pageNumber}
        numPages={numPages}
        scale={scale}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onPrevPage={goToPrevPage}
        onNextPage={goToNextPage}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onDownload={handleDownload}
        matchCount={matchCount}
      />

      <PDFDocument
        url={document.cloudinaryUrl}
        pageNumber={pageNumber}
        scale={scale}
        searchTerm={searchTerm}
        onLoadSuccess={onDocumentLoadSuccess}
        onDownload={handleDownload}
        onSearchMatches={setMatchCount}
      />
    </div>
  );
};
