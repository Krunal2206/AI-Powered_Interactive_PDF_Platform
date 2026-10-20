"use client";

import {
  useState,
  useCallback,
  type ComponentPropsWithoutRef,
  type ElementType,
  type JSX,
  type ReactNode,
} from "react";
import { Bot, Copy, Check, FileText } from "lucide-react";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatDisplayMessage } from "@/hooks/useChat";
import Link from "next/link";

type MarkdownElementProps<Tag extends keyof JSX.IntrinsicElements> =
  ComponentPropsWithoutRef<Extract<Tag, ElementType>> & ExtraProps;

type CodeBlockProps = MarkdownElementProps<"code"> & {
  inline?: boolean;
};

const CodeBlock = ({ inline, children, ...props }: CodeBlockProps) => {
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
};

const MarkdownLink = ({
  children,
  href = "",
  ...props
}: MarkdownElementProps<"a">) => {
  const isInternal = href.startsWith("/") || href.startsWith("#");

  if (isInternal) {
    return (
      <Link href={href} className="text-purple-300 underline" {...props}>
        {children}
      </Link>
    );
  }

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
};

const MarkdownUl = ({ children, ...props }: MarkdownElementProps<"ul">) => (
  <ul className="list-disc list-inside space-y-1 mt-1" {...props}>
    {children}
  </ul>
);

const MarkdownOl = ({ children, ...props }: MarkdownElementProps<"ol">) => (
  <ol className="list-decimal list-inside space-y-1 mt-1" {...props}>
    {children}
  </ol>
);

const MarkdownH1 = ({ children, ...props }: MarkdownElementProps<"h1">) => (
  <h1 className="text-base font-bold mt-2 mb-1" {...props}>
    {children}
  </h1>
);

const MarkdownH2 = ({ children, ...props }: MarkdownElementProps<"h2">) => (
  <h2 className="text-sm font-bold mt-2 mb-1" {...props}>
    {children}
  </h2>
);

const MarkdownH3 = ({ children, ...props }: MarkdownElementProps<"h3">) => (
  <h3 className="text-sm font-semibold mt-1 mb-0.5" {...props}>
    {children}
  </h3>
);

const MarkdownStrong = ({
  children,
  ...props
}: MarkdownElementProps<"strong">) => (
  <strong className="font-semibold" {...props}>
    {children}
  </strong>
);

// ─── Page Citation Badge ──────────────────────────────────────────────────────

const PAGE_CITATION_REGEX = /\[Page\s+(\d+)\]/g;

/**
 * Splits a text node into interleaved text spans and clickable PageCitationBadge
 * components for every `[Page N]` occurrence found in the text.
 */
function renderWithCitations(
  text: string,
  onPageCitation?: (page: number) => void,
): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(PAGE_CITATION_REGEX);

  while ((match = regex.exec(text)) !== null) {
    // Text before the citation
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const pageNum = parseInt(match[1], 10);
    parts.push(
      <PageCitationBadge
        key={`page-${pageNum}-${match.index}`}
        page={pageNum}
        onClick={onPageCitation}
      />,
    );

    lastIndex = regex.lastIndex;
  }

  // Remaining text after the last citation
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

const PageCitationBadge = ({
  page,
  onClick,
}: {
  page: number;
  onClick?: (page: number) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick?.(page)}
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-medium
        bg-purple-500/20 text-purple-300 border border-purple-500/30
        hover:bg-purple-500/30 hover:text-purple-200 hover:border-purple-400/50
        transition-all duration-150 cursor-pointer align-baseline
        focus:outline-none focus:ring-1 focus:ring-purple-400/50 mt-2"
      title={`Go to page ${page}`}
      aria-label={`Navigate to page ${page}`}
    >
      <FileText className="w-3 h-3" />
      <span>Page {page}</span>
    </button>
  );
};

// ─── CitationParagraph ────────────────────────────────────────────────────────
// Wraps the default <p> renderer so that [Page N] patterns inside text nodes
// are replaced with clickable badges.

const makeCitationParagraph = (onPageCitation?: (page: number) => void) => {
  const CitationParagraph = ({
    children,
    ...props
  }: MarkdownElementProps<"p">) => (
    <p className="mb-1 last:mb-0" {...props}>
      {injectCitations(children, onPageCitation)}
    </p>
  );
  CitationParagraph.displayName = "CitationParagraph";
  return CitationParagraph;
};

const makeCitationLi = (onPageCitation?: (page: number) => void) => {
  const CitationLi = ({
    children,
    ...props
  }: MarkdownElementProps<"li">) => (
    <li {...props}>{injectCitations(children, onPageCitation)}</li>
  );
  CitationLi.displayName = "CitationLi";
  return CitationLi;
};

/**
 * Recursively walk React children. When a raw string contains
 * `[Page N]`, replace it with interleaved text + badge nodes.
 */
function injectCitations(
  children: ReactNode,
  onPageCitation?: (page: number) => void,
): ReactNode {
  if (typeof children === "string") {
    if (PAGE_CITATION_REGEX.test(children)) {
      PAGE_CITATION_REGEX.lastIndex = 0;
      return <>{renderWithCitations(children, onPageCitation)}</>;
    }
    return children;
  }

  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === "string") {
        if (PAGE_CITATION_REGEX.test(child)) {
          PAGE_CITATION_REGEX.lastIndex = 0;
          return (
            <span key={i}>{renderWithCitations(child, onPageCitation)}</span>
          );
        }
        return child;
      }
      return child;
    });
  }

  return children;
}

// ─── ChatMessage Component ────────────────────────────────────────────────────

interface ChatMessageProps {
  message: ChatDisplayMessage;
  onPageCitation?: (page: number) => void;
}

export const ChatMessage = ({ message, onPageCitation }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const CitationParagraph = useCallback(
    () => makeCitationParagraph(onPageCitation),
    [onPageCitation],
  )();

  const CitationLi = useCallback(
    () => makeCitationLi(onPageCitation),
    [onPageCitation],
  )();

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative group max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
            : "bg-slate-800 text-slate-100"
        }`}
      >
        {/* Copy button for AI messages */}
        {!isUser && message.content !== "" && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer border border-slate-700/50 flex items-center justify-center"
            title="Copy response"
            aria-label="Copy response"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400 animate-scale-in" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        <div className="flex items-start space-x-2">
          {!isUser && <Bot className="w-4 h-4 mt-1 text-purple-400 shrink-0" />}
          <div className="flex-1 min-w-0 pr-4">
            {isUser ? (
              // User messages are plain text — no need to parse markdown
              <p className="text-sm leading-relaxed wrap-break-word">
                {message.content}
              </p>
            ) : (
              // AI responses are formatted as Markdown
              <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none wrap-break-word">
                {!isUser && message.content === "" ? (
                  <span
                    className="flex space-x-1 mt-1"
                    role="status"
                    aria-label="AI is thinking"
                  >
                    <span className="sr-only">AI is thinking...</span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: CodeBlock,
                      a: MarkdownLink,
                      ul: MarkdownUl,
                      ol: MarkdownOl,
                      p: CitationParagraph,
                      li: CitationLi,
                      h1: MarkdownH1,
                      h2: MarkdownH2,
                      h3: MarkdownH3,
                      strong: MarkdownStrong,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            )}
            <p
              suppressHydrationWarning
              className="text-xs mt-2 opacity-70"
            >
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
