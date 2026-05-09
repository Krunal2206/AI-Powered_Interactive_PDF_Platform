"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { pdfjs, Document, Page } from "react-pdf";
import { FileText } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFDocumentProps {
  url: string;
  pageNumber: number;
  scale: number;
  onLoadSuccess: (data: { numPages: number }) => void;
  onDownload: () => void;
}

export const PDFDocument = ({
  url,
  pageNumber,
  scale,
  onLoadSuccess,
  onDownload,
}: PDFDocumentProps) => {
  return (
    <div className="flex-1 overflow-auto bg-slate-900/30">
      <div className="flex justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-full">
          <Document
            file={url}
            onLoadSuccess={onLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                <FileText className="w-16 h-16 mb-4" />
                <p>Error loading PDF</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownload}
                  className="mt-2"
                >
                  Download instead
                </Button>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                </div>
              }
              className="max-w-full"
            />
          </Document>
        </div>
      </div>
    </div>
  );
};
