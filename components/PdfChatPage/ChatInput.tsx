"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const isInputDisabled = isLoading || disabled;

  return (
    <div className="border-t border-slate-800 p-4">
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Input
            placeholder={
              disabled
                ? "Process the document first to start chatting..."
                : "Ask about this document..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`bg-slate-800 border-slate-700 focus:border-purple-500 pr-12 text-white ${
              disabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={isInputDisabled}
          />
          <Button
            onClick={onSendMessage}
            disabled={!inputMessage.trim() || isInputDisabled}
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
