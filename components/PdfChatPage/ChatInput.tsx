"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Lock } from "lucide-react";

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput = ({
  inputMessage,
  setInputMessage,
  onSendMessage,
  isLoading,
  disabled = false,
}: ChatInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      !disabled
    ) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const isInputDisabled = isLoading || disabled;

  return (
    <div className="border-t border-slate-800 p-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <Textarea
            id="chat-input"
            rows={1}
            aria-label={
              disabled
                ? "Chat is disabled until document is processed"
                : "Ask about this document"
            }
            placeholder={
              disabled
                ? "Process the document first to start chatting..."
                : "Ask about this document..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`bg-slate-800 border-slate-700 focus:border-purple-500 pr-12 text-white min-h-[44px] max-h-32 resize-none py-2.5 leading-normal ${
              disabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={isInputDisabled}
          />
          <Button
            onClick={onSendMessage}
            disabled={!inputMessage.trim() || isInputDisabled}
            size="sm"
            aria-label={disabled ? "Chat disabled" : "Send message"}
            className="absolute right-1.5 bottom-1.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 p-0"
          >
            {disabled ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">
        {disabled
          ? "Document processing required to enable chat"
          : "Press Enter to send • Shift+Enter for new line"}
      </p>
    </div>
  );
};
