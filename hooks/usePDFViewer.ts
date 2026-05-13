import { useState, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface UsePDFViewerReturn {
  currentPage: number;
  totalPages: number;
  scale: number;
  setScale: (scale: number) => void;
  goToPage: (pageNumber: number) => void;
  highlightText: (text: string) => void;
  isLoading: boolean;
  error: any;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onDocumentLoadError: (error: any) => void;
}

export function usePDFViewer(url: string): UsePDFViewerReturn {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const goToPage = useCallback(
    (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
      }
    },
    [totalPages]
  );

  const highlightText = useCallback((text: string) => {
    // Implementation would depend on the PDF viewer library being used
    // This is a placeholder for the actual implementation
    console.log("Highlighting text:", text);
  }, []);

  const handleDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setTotalPages(numPages);
      setIsLoading(false);
    },
    []
  );

  const handleDocumentLoadError = useCallback((error: any) => {
    console.error("Error loading PDF:", error);
    setError(error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Cleanup effect
    return () => {
      setCurrentPage(1);
      setTotalPages(0);
      setScale(1.0);
      setIsLoading(false);
      setError(null);
    };
  }, [url]);

  return {
    currentPage,
    totalPages,
    scale,
    setScale,
    goToPage,
    highlightText,
    isLoading,
    error,
    onDocumentLoadSuccess: handleDocumentLoadSuccess,
    onDocumentLoadError: handleDocumentLoadError,
  };
}
