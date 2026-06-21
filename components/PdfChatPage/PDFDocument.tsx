"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { pdfjs, Document, Page } from "react-pdf";
import { FileText } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PDFDocumentProps {
  url: string;
  pageNumber: number;
  scale: number;
  searchTerm: string;
  onLoadSuccess: (data: { numPages: number }) => void;
  onDownload: () => void;
}

function highlightTextLayer(container: HTMLElement, term: string) {
  const existing = container.querySelectorAll("mark[data-pdf-highlight]");
  existing.forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
    parent.normalize();
  });

  if (!term.trim()) return;

  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  const regex = new RegExp(`(${escapedTerm})`, "gi");

  const textLayer = container.querySelector(".textLayer");
  if (!textLayer) return;

  const spans = textLayer.querySelectorAll("span");

  spans.forEach((span) => {
    if (span.children.length > 0) return;

    const text = span.textContent || "";
    if (!regex.test(text)) return;

    regex.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.slice(lastIndex, match.index)),
        );
      }

      const mark = document.createElement("mark");
      mark.dataset.pdfHighlight = "true";
      mark.style.backgroundColor = "#fef08a";
      mark.style.color = "inherit";
      mark.style.borderRadius = "2px";
      mark.textContent = match[1];
      fragment.appendChild(mark);

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    span.textContent = "";
    span.appendChild(fragment);
  });
}

export const PDFDocument = ({
  url,
  pageNumber,
  scale,
  searchTerm,
  onLoadSuccess,
  onDownload,
}: PDFDocumentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageRendered, setPageRendered] = useState(false);

  const applyHighlights = useCallback(() => {
    if (!containerRef.current) return;
    highlightTextLayer(containerRef.current, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (!pageRendered) return;
    applyHighlights();
  }, [searchTerm, applyHighlights, pageRendered]);

  useEffect(() => {
    setPageRendered(false);
  }, [pageNumber, scale]);

  const handleRenderSuccess = useCallback(() => {
    requestAnimationFrame(() => {
      setPageRendered(true);
      if (containerRef.current) {
        highlightTextLayer(containerRef.current, searchTerm);
      }
    });
  }, [searchTerm]);

  return (
    <div className="flex-1 overflow-auto bg-slate-900/30">
      <div className="flex justify-center p-2 sm:p-4">
        <div
          ref={containerRef}
          className="bg-white rounded-lg shadow-2xl max-w-full"
        >
          <Document
            file={url}
            onLoadSuccess={onLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
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
              onRenderSuccess={handleRenderSuccess}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
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
