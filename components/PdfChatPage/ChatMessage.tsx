"use client";

import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatDisplayMessage } from "@/hooks/useChat";

export const ChatMessage = ({ message }: { message: ChatDisplayMessage }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[280px] sm:max-w-[320px] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
            : "bg-slate-800 text-slate-100"
        }`}
      >
        <div className="flex items-start space-x-2">
          {!isUser && (
            <Bot className="w-4 h-4 mt-1 text-purple-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            {isUser ? (
              // User messages are plain text — no need to parse markdown
              <p className="text-sm leading-relaxed break-words">
                {message.content}
              </p>
            ) : (
              // AI responses are formatted as Markdown
              <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      return inline ? (
                        <code
                          className="bg-slate-700 rounded px-1 py-0.5 text-xs font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <code
                          className="block bg-slate-700 rounded p-2 text-xs font-mono overflow-x-auto mt-1 whitespace-pre-wrap"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    a({ children, href, ...props }: any) {
                      return (
                        <a
                          href={href}
                          className="text-purple-300 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    },
                    ul({ children, ...props }: any) {
                      return (
                        <ul
                          className="list-disc list-inside space-y-1 mt-1"
                          {...props}
                        >
                          {children}
                        </ul>
                      );
                    },
                    ol({ children, ...props }: any) {
                      return (
                        <ol
                          className="list-decimal list-inside space-y-1 mt-1"
                          {...props}
                        >
                          {children}
                        </ol>
                      );
                    },
                    p({ children, ...props }: any) {
                      return (
                        <p className="mb-1 last:mb-0" {...props}>
                          {children}
                        </p>
                      );
                    },
                    h1({ children, ...props }: any) {
                      return (
                        <h1
                          className="text-base font-bold mt-2 mb-1"
                          {...props}
                        >
                          {children}
                        </h1>
                      );
                    },
                    h2({ children, ...props }: any) {
                      return (
                        <h2 className="text-sm font-bold mt-2 mb-1" {...props}>
                          {children}
                        </h2>
                      );
                    },
                    h3({ children, ...props }: any) {
                      return (
                        <h3
                          className="text-sm font-semibold mt-1 mb-0.5"
                          {...props}
                        >
                          {children}
                        </h3>
                      );
                    },
                    strong({ children, ...props }: any) {
                      return (
                        <strong className="font-semibold" {...props}>
                          {children}
                        </strong>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
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
