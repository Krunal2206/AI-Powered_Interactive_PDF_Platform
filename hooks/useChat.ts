import { useState, useCallback, useEffect } from "react";

export interface ChatDisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UseChatReturn {
  messages: ChatDisplayMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
  clearMessages: () => void;
}

export function useChat(documentId: string, userId: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatDisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Load existing chat history on mount
  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      if (!documentId || !userId) return;

      try {
        const res = await fetch(`/api/chat/${documentId}/history`);
        if (!res.ok || !mounted) return;

        const data = await res.json();

        // Firestore Timestamps are serialized to { seconds, nanoseconds } over JSON
        const history: ChatDisplayMessage[] = (data.history || []).map(
          (msg: any) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: msg.createdAt?.seconds
              ? new Date(msg.createdAt.seconds * 1000)
              : new Date(msg.createdAt || Date.now()),
          }),
        );

        if (mounted) {
          setMessages(history);
          setSessionId(data.sessionId ?? null);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    };

    loadHistory();
    return () => {
      mounted = false;
    };
  }, [documentId, userId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const tempId = `temp-${Date.now()}`;

      // Optimistically add the user message so the UI feels instant
      const userMessage: ChatDisplayMessage = {
        id: tempId,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/chat/${documentId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content.trim(), sessionId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to send message");
        }

        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
        }

        const assistantMessage: ChatDisplayMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };

        // Replace temp optimistic message with confirmed one, then append assistant reply
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempId),
          { ...userMessage, id: `user-${Date.now()}` },
          assistantMessage,
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        // Roll back the optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        setIsLoading(false);
      }
    },
    [documentId, sessionId, isLoading],
  );

  const clearError = useCallback(() => setError(null), []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearError, clearMessages };
}
