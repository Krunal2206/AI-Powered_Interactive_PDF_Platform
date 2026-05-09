"use client";

import { Bot } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export const ChatMessage = ({ message }: { message: Message }) => {
  return (
    <div
      className={`flex ${
        message.type === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[280px] sm:max-w-[320px] rounded-2xl px-4 py-3 ${
          message.type === "user"
            ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
            : "bg-slate-800 text-slate-100"
        }`}
      >
        <div className="flex items-start space-x-2">
          {message.type === "bot" && (
            <Bot className="w-4 h-4 mt-1 text-purple-400 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm leading-relaxed">{message.content}</p>
            <p className="text-xs mt-2 opacity-70">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
