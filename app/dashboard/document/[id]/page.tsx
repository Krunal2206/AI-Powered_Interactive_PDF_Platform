"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Edit3,
  Trash2,
  FileText,
  Calendar,
  HardDrive,
  Eye,
  MessageCircle,
  X,
  Menu,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { deleteDocument, getDocument } from "@/lib/firebaseops";
import { Document } from "@/types/upload";
import { LoadingSpinner } from "@/components/DashboardPage/LoadingSpinner";
import { ErrorMessage } from "@/components/DashboardPage/ErrorMessage";
import { useDocumentNavigation } from "@/lib/navigationUtils";
import {
  confirmDelete,
  formatFileSize,
  getStatusColor,
} from "@/lib/documentUtils";
import { Document as ReactPDFDocument, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const DocumentViewPage = () => {
  const params = useParams();
  const { user } = useUser();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { goToDashboard, goToDocumentEdit, goToChat } = useDocumentNavigation();
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageWidth, setPageWidth] = useState<number>(800);

  const computePageWidth = useCallback(() => {
    return Math.min(window.innerWidth - 100, 800);
  }, []);

  useEffect(() => {
    setPageWidth(computePageWidth());

    const handleResize = () => setPageWidth(computePageWidth());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [computePageWidth]);

  const documentId = params.id as string;

  useEffect(() => {
    if (documentId && user?.id) {
      fetchDocument();
    }
  }, [documentId, user?.id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const doc = await getDocument(documentId);

      if (!doc) {
        setError("Document not found");
        return;
      }

      // Check if user owns this document
      if (doc.userId !== user?.id) {
        setError("Access denied");
        return;
      }

      setDocument(doc);
    } catch (err) {
      console.error("Error fetching document:", err);
      setError("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = confirmDelete();
    if (!confirmed) return;

    try {
      await deleteDocument(documentId);
      goToDashboard();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document. Please try again.");
    }
  };

  const handleDownload = () => {
    if (document) {
      window.open(document.cloudinaryUrl, "_blank");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !document) {
    return (
      <ErrorMessage
        title={error || "Document not found"}
        message="The document you're looking for doesn't exist or you don't have access to it."
        onBackClick={goToDashboard}
      />
    );
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <Button
            variant="ghost"
            onClick={goToDashboard}
            className="cursor-pointer text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 mb-4 p-2"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Documents
          </Button>
        </div>

        {/* Document Header */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-700/50 p-4 lg:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
            <div className="flex items-center space-x-3 lg:space-x-4 mb-4 lg:mb-0">
              <div className="p-2 lg:p-3 rounded-lg bg-slate-700/30 flex-shrink-0">
                <FileText size={24} className="text-purple-400 lg:w-8 lg:h-8" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg lg:text-2xl font-semibold text-slate-200 mb-1 truncate">
                  {document.title}
                </h1>
                <p className="text-slate-400 text-sm truncate">
                  {document.originalFilename}
                </p>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                document.status
              )} flex-shrink-0 self-start`}
            >
              {document.status}
            </div>
          </div>

          {document.description && (
            <p className="text-slate-300 mb-4 text-sm lg:text-base">
              {document.description}
            </p>
          )}

          {/* Document Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <HardDrive size={16} className="text-slate-400 lg:w-5 lg:h-5" />
              <div>
                <p className="text-slate-400 text-xs lg:text-sm">File Size</p>
                <p className="text-slate-200 text-sm lg:text-base">
                  {formatFileSize(document.fileSize)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar size={16} className="text-slate-400 lg:w-5 lg:h-5" />
              <div>
                <p className="text-slate-400 text-xs lg:text-sm">Uploaded</p>
                <p className="text-slate-200 text-sm lg:text-base">
                  {formatDistanceToNow(document.uploadedAt, {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FileText size={16} className="text-slate-400 lg:w-5 lg:h-5" />
              <div>
                <p className="text-slate-400 text-xs lg:text-sm">Type</p>
                <p className="text-slate-200 text-sm lg:text-base">
                  PDF Document
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="lg:hidden">
            <Button
              onClick={() => setShowMobileActions(!showMobileActions)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white mb-3"
            >
              {showMobileActions ? (
                <>
                  <X size={16} className="mr-2" />
                  Hide Actions
                </>
              ) : (
                <>
                  <Menu size={16} className="mr-2" />
                  Show Actions
                </>
              )}
            </Button>

            {showMobileActions && (
              <div className="grid grid-cols-1 gap-2 mb-4">
                <Button
                  onClick={() => goToChat(documentId)}
                  className="bg-purple-600 hover:bg-purple-700 text-white justify-start"
                  disabled={document.status !== "ready"}
                >
                  <MessageCircle size={16} className="mr-2" />
                  Start Chat
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="border-white/20 hover:bg-white/10 hover:text-white justify-start"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>

                <Button
                  variant="outline"
                  onClick={() => goToDocumentEdit(documentId)}
                  className="border-white/20 hover:bg-white/10 hover:text-white justify-start"
                >
                  <Edit3 size={16} className="mr-2" />
                  Edit
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="border-red-700 text-red-400 hover:bg-red-600/10 justify-start"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="hidden lg:flex flex-wrap gap-3">
            <Button
              onClick={() => goToChat(documentId)}
              className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
              disabled={document.status !== "ready"}
            >
              <MessageCircle size={16} className="mr-2" />
              Start Chat
            </Button>

            <Button
              variant="outline"
              onClick={handleDownload}
              className="border-white/20 hover:bg-white/10 hover:text-white hover:shadow-purple-500/25 shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>

            <Button
              variant="outline"
              onClick={() => goToDocumentEdit(documentId)}
              className="border-white/20 hover:bg-white/10 hover:text-white hover:shadow-purple-500/25 shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <Edit3 size={16} className="mr-2" />
              Edit
            </Button>

            <Button
              variant="outline"
              onClick={handleDelete}
              className="border-red-700 text-red-400 hover:bg-red-600/10 cursor-pointer"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* PDF Preview */}
        {/* <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-200">
              Document Preview
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(document.cloudinaryUrl, "_blank")}
              className="border-white/20 hover:bg-white/10 hover:text-white hover:shadow-purple-500/25 shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <Eye size={16} className="mr-2" />
              Full Screen
            </Button>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
            <div className="relative">
              <iframe
                src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
                  document.cloudinaryUrl
                )}`}
                width="100%"
                height="600px"
                className="rounded-lg border-0"
                title={document.title}
                onLoad={() => {
                  console.log("PDF.js viewer loaded successfully");
                }}
                onError={(e) => {
                  console.error("PDF.js viewer failed to load:", e);
                  // Hide iframe and show fallback
                  (e.target as HTMLIFrameElement).style.display = "none";
                  const fallback =
                    window.document.getElementById("pdf-fallback");
                  if (fallback) fallback.style.display = "block";
                }}
              />

              <div id="pdf-fallback" className="hidden text-center py-12">
                <FileText size={64} className="text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">
                  PDF Preview Not Available
                </h3>
                <p className="text-slate-500 mb-6">
                  The document preview cannot be displayed. This might be due to
                  CORS restrictions or the PDF format.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() =>
                      window.open(document.cloudinaryUrl, "_blank")
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Eye size={16} className="mr-2" />
                    Open in New Tab
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    <Download size={16} className="mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div> */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-700/50 p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h2 className="text-lg lg:text-xl font-semibold text-slate-200">
              Document Preview
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(document.cloudinaryUrl, "_blank")}
              className="border-white/20 hover:bg-white/10 hover:text-white hover:shadow-purple-500/25 shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <Eye size={16} className="mr-2" />
              Full Screen
            </Button>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-2 lg:p-4 border border-slate-700/30">
            <div className="relative">
              <ReactPDFDocument
                file={document.cloudinaryUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth}
                  className="shadow-lg"
                />
              </ReactPDFDocument>

              {numPages > 1 && (
                <div className="flex items-center justify-center mt-4 space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(pageNumber - 1)}
                    disabled={pageNumber <= 1}
                    className="border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    Previous
                  </Button>

                  <span className="text-slate-300 text-sm">
                    Page {pageNumber} of {numPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(pageNumber + 1)}
                    disabled={pageNumber >= numPages}
                    className="border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => goToChat(documentId)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={document.status !== "ready"}
          >
            <MessageCircle size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewPage;
