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
  isLoadingHistory: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
  clearMessages: () => void;
  invalidateHistory: () => Promise<void>;
}

interface SerializedTimestamp {
  seconds?: number;
}

interface ChatHistoryResponse {
  history?: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt?: SerializedTimestamp | string;
  }>;
  sessionId?: string | null;
}

export function useChat(documentId: string, userId: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatDisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Load existing chat history on mount
  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      if (!documentId || !userId) {
        setIsLoadingHistory(false);
        return;
      }

      setIsLoadingHistory(true);
      try {
        const res = await fetch(`/api/chat/${documentId}/history`);
        if (!mounted) return;

        if (!res.ok) {
          console.error("Failed to load chat history:", res.status);
          setIsLoadingHistory(false);
          return;
        }

        const data: ChatHistoryResponse = await res.json();

        // Firestore Timestamps are serialized to { seconds, nanoseconds } over JSON
        const history: ChatDisplayMessage[] = (data.history || []).map(
          (msg) => {
            const createdAt = msg.createdAt;
            const timestampValue =
              typeof createdAt === "string" ? createdAt : Date.now();
            const timestamp =
              typeof createdAt === "object" &&
              typeof createdAt.seconds === "number"
                ? new Date(createdAt.seconds * 1000)
                : new Date(timestampValue);

            return {
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp,
            };
          },
        );

        if (mounted) {
          setMessages(history);
          setSessionId(data.sessionId ?? null);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      } finally {
        if (mounted) {
          setIsLoadingHistory(false);
        }
      }
    };

    loadHistory();
    return () => {
      mounted = false;
    };
  }, [documentId, userId]);

  const postChatMessage = useCallback(async (message: string) => {
    return fetch(`/api/chat/${documentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
    });
  }, [documentId, sessionId]);

  const ensureResponseOk = async (res: Response) => {
    if (res.ok) return;
    const data = await res.json();
    throw new Error(data.error || "Failed to send message");
  };

  const createAssistantPlaceholder = (
    tempId: string,
    userMessage: ChatDisplayMessage,
  ) => {
    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev.filter((m) => m.id !== tempId),
      { ...userMessage, id: `user-${Date.now()}` },
      { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
    ]);
    return assistantId;
  };

  const updateAssistantMessage = (assistantId: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantId ? { ...msg, content } : msg,
      ),
    );
  };

  const appendStreamChunk = useCallback((chunk: string, currentContent: string) => {
    if (!chunk.includes("__SESSION__:")) {
      return currentContent + chunk;
    }

    const [text, meta] = chunk.split("__SESSION__:");
    const nextContent = text ? currentContent + text : currentContent;
    const newSessionId = meta.trim();

    if (newSessionId && newSessionId !== "null" && !sessionId) {
      setSessionId(newSessionId);
    }

    return nextContent;
  }, [sessionId]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      const tempId = `temp-${Date.now()}`;
      const userMessage: ChatDisplayMessage = {
        id: tempId,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      let assistantId: string | null = null;

      try {
        const res = await postChatMessage(trimmed);
        await ensureResponseOk(res);

        assistantId = createAssistantPlaceholder(tempId, userMessage);
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          fullContent = appendStreamChunk(
            decoder.decode(value, { stream: true }),
            fullContent,
          );
          updateAssistantMessage(assistantId, fullContent);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        setMessages((prev) => prev.filter((m) => m.id !== tempId && (assistantId ? m.id !== assistantId : true)));
      } finally {
        setIsLoading(false);
      }
    },
    [appendStreamChunk, isLoading, postChatMessage],
  );

  const clearError = useCallback(() => setError(null), []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  const invalidateHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${documentId}/history`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Failed to delete chat history:", await res.text());
      }
    } catch (err) {
      console.error("Error invalidating chat history:", err);
    }
    setMessages([]);
    setSessionId(null);
  }, [documentId]);

  return { messages, isLoading, isLoadingHistory, error, sendMessage, clearError, clearMessages, invalidateHistory };
}
