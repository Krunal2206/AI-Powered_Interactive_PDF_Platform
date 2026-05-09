"use client";

import { useState } from "react";
import { PDFToolbar } from "./PDFToolbar";
import { PDFDocument } from "./PDFDocument";
import { Document as DocumentType } from "@/types/upload";

interface PDFViewerProps {
  document: DocumentType;
  isFullscreen: boolean;
}

export const PDFViewer = ({ document, isFullscreen }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [searchTerm, setSearchTerm] = useState("");

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(2.0, prev + 0.2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.2));
  };

  const handleDownload = () => {
    if (document) {
      window.open(document.cloudinaryUrl, "_blank");
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
      />

      <PDFDocument
        url={document.cloudinaryUrl}
        pageNumber={pageNumber}
        scale={scale}
        onLoadSuccess={onDocumentLoadSuccess}
        onDownload={handleDownload}
      />
    </div>
  );
};
