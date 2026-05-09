"use client";

import { Bot } from "lucide-react";

export const ChatHeader = () => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 p-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">AI Assistant</h3>
          <p className="text-sm text-slate-400">Ask me about this document</p>
        </div>
      </div>
    </div>
  );
};
