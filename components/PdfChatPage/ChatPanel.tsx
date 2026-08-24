"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Document as DocumentType } from "@/types/upload";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { LoadingIndicator } from "./LoadingIndicator";
import { usePDFProcessing } from "@/hooks/usePDFProcessing";
import { ProcessingStatus } from "./ProcessingStatus";
import { useChat } from "@/hooks/useChat";
import { useUser } from "@clerk/nextjs";
import { InlineErrorBoundary } from "@/components/ErrorBoundary";
import { ExportChatButton } from "./ExportChatButton";

interface ChatPanelProps {
  document: DocumentType;
  isVisible: boolean;
}

const ChatPanelInner = ({ document, isVisible }: ChatPanelProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    sendMessage,
    clearError,
    invalidateHistory,
  } = useChat(document.id, user?.id ?? "");

  const {
    processingState,
    processDocument,
    checkProcessingStatus,
    reprocessDocument,
  } = usePDFProcessing();

  useEffect(() => {
    if (document?.id) {
      checkProcessingStatus(document.id);
    }
  }, [document?.id, checkProcessingStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleProcessDocument = async () => {
    if (document?.id) await processDocument(document.id);
  };

  const handleReprocessDocument = async () => {
    if (!document?.id) return;
    await reprocessDocument(document.id);
    await invalidateHistory();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    if (!processingState.isProcessed) return;

    const msg = inputMessage;
    setInputMessage("");
    await sendMessage(msg);
  };

  if (!isVisible) return null;

  return (
    <div className="w-full lg:w-[480px] flex flex-col bg-slate-900/30 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <ChatHeader />
        </div>
        <div className="pr-3">
          <ExportChatButton messages={messages} documentTitle={document.title} />
        </div>
      </div>

      <ProcessingStatus
        processingState={processingState}
        onProcess={handleProcessDocument}
        onReprocess={handleReprocessDocument}
      />

      <ScrollArea className="flex-1 p-4 h-32">
        <div className="space-y-4">
          {isLoadingHistory && messages.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              <div className="max-w-64 mx-auto space-y-3">
                <div className="h-4 w-3/4 mx-auto bg-slate-700/50 rounded animate-pulse" />
                <div className="h-4 w-1/2 mx-auto bg-slate-700/50 rounded animate-pulse" />
                <div className="h-4 w-2/3 mx-auto bg-slate-700/50 rounded animate-pulse" />
              </div>
            </div>
          )}
          {!isLoadingHistory && messages.length === 0 && !isLoading && (
            <div className="text-center text-slate-400 py-8">
              <div className="max-w-64 mx-auto">
                <h3 className="text-sm font-medium mb-2">Ready to chat!</h3>
                <p className="text-xs">
                  {processingState.isProcessed
                    ? "Ask me anything about this document."
                    : "Process the document first to start chatting."}
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && <LoadingIndicator />}

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3 flex items-start justify-between gap-2">
              <p className="text-red-400 text-sm">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0 shrink-0 cursor-pointer"
                aria-label="Dismiss error"
              >
                ×
              </Button>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      <ChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={!processingState.isProcessed}
      />
    </div>
  );
};

export const ChatPanel = ({ document, isVisible }: ChatPanelProps) => {
  return (
    <InlineErrorBoundary section="Chat">
      <ChatPanelInner document={document} isVisible={isVisible} />
    </InlineErrorBoundary>
  );
};
