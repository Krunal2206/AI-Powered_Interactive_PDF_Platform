"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, FileCode, FileDown } from "lucide-react";
import { ChatDisplayMessage } from "@/hooks/useChat";

interface ExportChatButtonProps {
  messages: ChatDisplayMessage[];
  documentTitle: string;
}

type ExportFormat = "txt" | "md" | "pdf";

interface FormatOption {
  format: ExportFormat;
  label: string;
  icon: typeof FileText;
  description: string;
}

const formatOptions: FormatOption[] = [
  {
    format: "txt",
    label: "Plain Text",
    icon: FileText,
    description: "Simple text format",
  },
  {
    format: "md",
    label: "Markdown",
    icon: FileCode,
    description: "Formatted markdown",
  },
  {
    format: "pdf",
    label: "PDF Document",
    icon: FileDown,
    description: "Print-ready PDF",
  },
];

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function generatePlainText(
  messages: ChatDisplayMessage[],
  documentTitle: string,
): string {
  const header = `Chat Export — ${documentTitle}\nExported on ${formatTimestamp(new Date())}\n${"=".repeat(60)}\n\n`;

  const body = messages
    .map((msg) => {
      const role = msg.role === "user" ? "You" : "AI Assistant";
      const time = formatTimestamp(msg.timestamp);
      return `[${time}] ${role}:\n${msg.content}\n`;
    })
    .join("\n" + "-".repeat(40) + "\n\n");

  return header + body;
}

function generateMarkdown(
  messages: ChatDisplayMessage[],
  documentTitle: string,
): string {
  const header = `# Chat Export — ${documentTitle}\n\n> Exported on ${formatTimestamp(new Date())}\n\n---\n\n`;

  const body = messages
    .map((msg) => {
      const role = msg.role === "user" ? "**You**" : "**AI Assistant** 🤖";
      const time = formatTimestamp(msg.timestamp);
      return `### ${role}\n*${time}*\n\n${msg.content}\n`;
    })
    .join("\n---\n\n");

  return header + body;
}

function generatePdfHtml(
  messages: ChatDisplayMessage[],
  documentTitle: string,
): string {
  const msgHtml = messages
    .map((msg) => {
      const isUser = msg.role === "user";
      const role = isUser ? "You" : "AI Assistant";
      const time = formatTimestamp(msg.timestamp);
      const bgColor = isUser ? "#f3f0ff" : "#f8f9fa";
      const borderColor = isUser ? "#8b5cf6" : "#6b7280";
      // Escape HTML in message content
      const escapedContent = msg.content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");

      return `
        <div style="margin-bottom:16px;padding:16px;border-radius:10px;background:${bgColor};border-left:4px solid ${borderColor};">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <strong style="color:${isUser ? "#6d28d9" : "#374151"}">${role}</strong>
            <span style="font-size:12px;color:#9ca3af;">${time}</span>
          </div>
          <div style="color:#1f2937;line-height:1.6;white-space:pre-wrap;word-wrap:break-word;">${escapedContent}</div>
        </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Chat Export — ${documentTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 24px;
      color: #1f2937;
      background: white;
    }
    h1 { font-size: 24px; color: #111827; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #9ca3af; margin-bottom: 32px; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <h1>📄 Chat Export — ${documentTitle}</h1>
  <p class="subtitle">Exported on ${formatTimestamp(new Date())} · ${messages.length} messages</p>
  <hr/>
  ${msgHtml}
</body>
</html>`;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printPdf(html: string) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(html);
  doc.close();

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };
}

export const ExportChatButton = ({
  messages,
  documentTitle,
}: ExportChatButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (messages.length === 0) return null;

  const sanitizedTitle = documentTitle.replace(/[^a-zA-Z0-9-_ ]/g, "").trim();

  const handleExport = (format: ExportFormat) => {
    setIsOpen(false);

    switch (format) {
      case "txt":
        downloadFile(
          generatePlainText(messages, documentTitle),
          `${sanitizedTitle}-chat.txt`,
          "text/plain",
        );
        break;
      case "md":
        downloadFile(
          generateMarkdown(messages, documentTitle),
          `${sanitizedTitle}-chat.md`,
          "text/markdown",
        );
        break;
      case "pdf":
        printPdf(generatePdfHtml(messages, documentTitle));
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200 cursor-pointer"
        title="Export chat"
        aria-label="Export chat conversation"
      >
        <Download className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-slate-800 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Export as
            </p>
          </div>
          {formatOptions.map((option) => (
            <button
              key={option.format}
              onClick={() => handleExport(option.format)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-purple-500/10 transition-colors duration-150 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors duration-150">
                <option.icon className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors duration-150" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {option.label}
                </p>
                <p className="text-xs text-slate-500">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
