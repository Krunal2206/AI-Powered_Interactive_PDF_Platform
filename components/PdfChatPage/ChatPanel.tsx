"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Document as DocumentType } from "@/types/upload";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { LoadingIndicator } from "./LoadingIndicator";
import { usePDFProcessing } from "@/hooks/usePDFProcessing";
import { ProcessingStatus } from "./ProcessingStatus";

interface ChatPanelProps {
  document: DocumentType;
  isVisible: boolean;
}

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export const ChatPanel = ({ document, isVisible }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    processingState,
    processDocument,
    checkProcessingStatus,
    reprocessDocument,
  } = usePDFProcessing();

  useEffect(() => {
    // Check if document is already processed when component mounts
    if (document?.id) {
      checkProcessingStatus(document.id);
    }
  }, [document?.id, checkProcessingStatus]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleProcessDocument = async () => {
    if (document?.id) {
      await processDocument(document.id);
    }
  };

  const handleReprocessDocument = async () => {
    if (document?.id) {
      await reprocessDocument(document.id);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check if document is processed before allowing chat
    if (!processingState.isProcessed) {
      const warningMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content:
          "Please process the document first before asking questions. Click the 'Process Document' button above.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, warningMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // TODO: Replace with actual AI API call
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: `Based on the document "${document?.title}", I can help you with: "${inputMessage}". Here's what I found in the PDF...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  if (!isVisible) return null;

  return (
    <div className="w-full lg:w-96 flex flex-col bg-slate-900/30 backdrop-blur-sm">
      <ChatHeader />

      {/* Processing Status Section */}
      <ProcessingStatus
        document={document}
        processingState={processingState}
        onProcess={handleProcessDocument}
        onReprocess={handleReprocessDocument}
      />

      <ScrollArea className="flex-1 p-4 h-32">
        <div className="space-y-4">
          {/* Welcome message when no messages */}
          {messages.length === 0 && (
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
