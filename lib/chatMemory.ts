import { BufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/memory";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

export interface ChatMessage {
  role: "human" | "ai";
  content: string;
  timestamp: Date;
}

export class DocumentChatMemory {
  private memory: BufferMemory;
  private documentId: string;

  constructor(documentId: string, initialMessages: ChatMessage[] = []) {
    this.documentId = documentId;
    const history = new ChatMessageHistory();

    // Initialize with existing messages if any
    initialMessages.forEach((msg) => {
      if (msg.role === "human") {
        history.addMessage(new HumanMessage(msg.content));
      } else {
        history.addMessage(new AIMessage(msg.content));
      }
    });

    this.memory = new BufferMemory({
      chatHistory: history,
      returnMessages: true,
      memoryKey: "chat_history",
    });
  }

  async addUserMessage(content: string) {
    await this.memory.chatHistory.addUserMessage(content);
  }

  async addAIMessage(content: string) {
    await this.memory.chatHistory.addMessage(new AIMessage(content));
  }

  async getMessages() {
    const result = await this.memory.loadMemoryVariables({});
    return result.chat_history;
  }

  async clear() {
    await this.memory.clear();
  }
}

export const createChatMemory = (
  documentId: string,
  messages: ChatMessage[] = []
) => {
  return new DocumentChatMemory(documentId, messages);
};
