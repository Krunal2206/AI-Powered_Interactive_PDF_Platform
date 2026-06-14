"use client";

import { Button } from "@/components/ui/button";
import { getDocument } from "@/lib/firebaseops";
import { useDocumentNavigation } from "@/lib/navigationUtils";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  FileText,
  Maximize2,
  MessageSquare,
  Minimize2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Document as DocumentType } from "@/types/upload";
import { PDFViewer } from "@/components/PdfChatPage/PDFViewer";
import { useResponsive } from "@/hooks/useResponsive";
import { LoadingSpinner } from "@/components/DashboardPage/LoadingSpinner";
import { ErrorMessage } from "@/components/DashboardPage/ErrorMessage";
import { ChatPanel } from "@/components/PdfChatPage/ChatPanel";

const Page = () => {
  const params = useParams();
  const documentId = params.id as string;
  const { user } = useUser();
  const { goToDocument, goToDashboard } = useDocumentNavigation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<DocumentType | null>(null);
  const { isMobile } = useResponsive();
  const [showChat, setShowChat] = useState<boolean | null>(null);

  useEffect(() => {
    if (showChat === null) {
      setShowChat(!isMobile);
    }
  }, [isMobile, showChat]);

  useEffect(() => {
    if (showChat !== null) {
      setShowChat(!isMobile);
    }
  }, [isMobile]);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setShowChat(false);
    }
  };

  const toggleChat = () => {
    setShowChat((prev) => !prev);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !document) {
    return (
      <ErrorMessage
        title={error || "Document not found"}
        message="The document you're looking for doesn't exist or you don't have access to it."
        onBackClick={() => goToDashboard()}
      />
    );
  }

  const chatResolved = showChat !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 inset-0 overflow-auto">
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              onClick={() => goToDocument(documentId)}
              className="cursor-pointer text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 p-2"
            >
              <ArrowLeft size={16} className="mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Back to Document</span>
            </Button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <FileText size={20} className="sm:w-5 sm:h-5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <h1 className="font-semibold text-white text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                  {document?.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Chat with PDF
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {chatResolved && (isMobile || !isFullscreen) && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleChat}
                className={`border-slate-700 hover:text-slate-300 hover:bg-slate-800/50 cursor-pointer p-2 ${
                  showChat ? "bg-purple-500/20 text-purple-400" : ""
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {!isMobile && (
                  <span className="ml-2 hidden sm:inline">Chat</span>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="border-slate-700 hover:text-slate-300 hover:bg-slate-800/50 cursor-pointer p-2"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] relative">
        {document && (
          <>
            <PDFViewer document={document} isFullscreen={isFullscreen} />

            {chatResolved && isMobile && showChat && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
                <div className="w-full bg-slate-900 rounded-t-xl max-h-[85vh] flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                    <h3 className="text-white font-semibold">Chat with PDF</h3>
                    <button
                      onClick={toggleChat}
                      className="text-slate-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <ChatPanel document={document} isVisible={true} />
                  </div>
                </div>
              </div>
            )}

            {chatResolved && !isMobile && !isFullscreen && showChat && (
              <ChatPanel document={document} isVisible={true} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
