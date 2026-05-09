"use client";

import { Bot } from "lucide-react";

export const LoadingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-slate-800 rounded-2xl px-4 py-3 max-w-[280px]">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-purple-400" />
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
