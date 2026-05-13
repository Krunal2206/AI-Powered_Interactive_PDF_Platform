import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";
import { VectorStoreService } from "./vectorStore";
import {
  addChatMessage,
  createChatSession,
  getChatHistory,
} from "./firebaseChatOps";
import { ChatMessage } from "@/types/chat";

const SYSTEM_TEMPLATE = `You are a helpful AI assistant for answering questions about PDF documents.
Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not about the context, politely inform them that you can only answer questions about the document.
Always format your responses in Markdown.

Context: {context}

Question: {question}`;

export class ChatService {
  private model: GoogleGenerativeAI;
  private documentId: string;
  private sessionId?: string;
  private userId: string;
  private vectorStore?: VectorStoreService;

  constructor(documentId: string, userId: string, sessionId?: string) {
    this.model = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
    this.documentId = documentId;
    this.userId = userId;
    this.sessionId = sessionId;
  }

  private async initVectorStore() {
    if (!this.vectorStore) {
      this.vectorStore = new VectorStoreService();
    }
  }

  private async getRelevantDocuments(query: string): Promise<Document[]> {
    try {
      await this.initVectorStore();
      if (!this.vectorStore) {
        throw new Error("Vector store not initialized");
      }
      const chunks = await this.vectorStore.searchSimilarChunks(query, this.documentId, { topK: 3 });
      return chunks.map(chunk => new Document({ pageContent: chunk.content }));
    } catch (error) {
      console.error("Error retrieving relevant documents:", error);
      throw error;
    }
  }

  private async generateResponse(
    prompt: string,
    context: string,
    history: ChatMessage[]
  ): Promise<string> {
    const model = this.model.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    });

    const formattedPrompt = SYSTEM_TEMPLATE
      .replace("{context}", context)
      .replace("{question}", prompt);

    const result = await chat.sendMessage([{ text: formattedPrompt }]);
    const response = result.response.text();
    return response;
  }

  public async chat(message: string, onToken: (token: string) => void): Promise<string> {
    try {
      // Get or create session
      if (!this.sessionId) {
        this.sessionId = await createChatSession(this.userId, this.documentId);
      }

      // Store user message
      await addChatMessage(this.sessionId, message, "user");

      // Get relevant documents
      const relevantDocs = await this.getRelevantDocuments(message);
      const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

      // Get chat history
      const history = await getChatHistory(this.sessionId);

      // Generate response using Gemini
      const response = await this.generateResponse(message, context, history);

      // Store assistant message
      await addChatMessage(this.sessionId, response, "assistant");

      return response;
    } catch (error) {
      console.error("Error in chat:", error);
      throw error;
    }
  }

  public async getHistory(): Promise<ChatMessage[]> {
    if (!this.sessionId) return [];
    return await getChatHistory(this.sessionId);
  }
}