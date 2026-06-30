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
  invalidateHistory: () => Promise<void>;
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

  const postChatMessage = async (message: string) => {
    return fetch(`/api/chat/${documentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
    });
  };

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

  const appendStreamChunk = (chunk: string, currentContent: string) => {
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
  };

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

      try {
        const res = await postChatMessage(trimmed);
        await ensureResponseOk(res);

        const assistantId = createAssistantPlaceholder(tempId, userMessage);
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
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        setIsLoading(false);
      }
    },
    [documentId, isLoading, sessionId],
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

  return { messages, isLoading, error, sendMessage, clearError, clearMessages, invalidateHistory };
}
