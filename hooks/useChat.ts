import { useState, useCallback, useEffect } from "react";
import { ChatMessage } from "@/types/chat";
import { ChatService } from "@/lib/chatService";

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  streamingContent: string;
  sendMessage: (content: string) => Promise<void>;
}

export function useChat(
  documentId: string,
  userId: string,
  initialMessages: ChatMessage[] = []
): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [chatService] = useState(() => new ChatService(documentId, userId));

  // Load initial history
  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        const history = await chatService.getHistory();
        if (mounted) {
          setMessages(history);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
        if (mounted) {
          setError("Failed to load chat history");
        }
      }
    };

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [chatService]);

  const sendMessage = useCallback(
    async (content: string) => {
      setIsLoading(true);
      setError(null);
      setStreamingContent("");

      try {
        await chatService.chat(content, (token) => {
          setStreamingContent((prev) => prev + token);
        });

        // Refresh messages after completion
        const updatedHistory = await chatService.getHistory();
        setMessages(updatedHistory);
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setIsLoading(false);
        setStreamingContent("");
      }
    },
    [chatService]
  );

  return {
    messages,
    isLoading,
    error,
    streamingContent,
    sendMessage,
  };
}
