import { GoogleGenerativeAI } from "@google/generative-ai";
import { IVectorStoreService, VectorStoreService } from "./vectorStore";
import { addChatMessage, getChatHistory } from "./firebaseChatOps";
import { ChatMessage } from "@/types/chat";
import { serverEnv } from "./env";

interface RelevantDocument {
  pageContent: string;
  pageNumber: number;
}

/**
 * Abstraction for persisting chat messages.
 * By default the service uses Firestore (addChatMessage / getChatHistory),
 * but callers can supply a custom implementation for testing or alternative storage.
 */
export interface ChatPersistence {
  saveMessage(
    userId: string,
    documentId: string,
    content: string,
    role: "user" | "assistant",
  ): Promise<string>;
  getHistory(documentId: string, userId: string): Promise<ChatMessage[]>;
}

const defaultPersistence: ChatPersistence = {
  saveMessage: addChatMessage,
  getHistory: getChatHistory,
};

/**
 * Configuration options for ChatService (Dependency Inversion Principle).
 * Callers can inject custom AI client, model name, vector store, and persistence.
 */
export interface ChatServiceOptions {
  persistence?: ChatPersistence;
  vectorStore?: IVectorStoreService;
  generativeAi?: GoogleGenerativeAI;
  modelName?: string;
}

const SYSTEM_INSTRUCTION = `You are a helpful AI assistant for answering questions about PDF documents.
Use the provided context to answer the user's questions.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not about the context, politely inform them that you can only answer questions about the document.
Always format your responses in Markdown.

IMPORTANT: When your answer uses information from the provided context, you MUST cite the source page(s) using the format [Page N] (e.g. [Page 4], [Page 12]). Place citations inline right after the relevant statement. If multiple pages support a statement, cite each one (e.g. [Page 2] [Page 5]). Only cite pages that actually appear in the provided context.`;

const PROMPT_TEMPLATE = `Context (with source page numbers):
{context}

Question: {question}`;

export class ChatService {
  private readonly model: GoogleGenerativeAI;
  private readonly modelName: string;
  private readonly documentId: string;
  private readonly userId: string;
  private readonly persistence: ChatPersistence;
  private vectorStore?: IVectorStoreService;

  constructor(
    documentId: string,
    userId: string,
    optionsOrPersistence?: ChatServiceOptions | ChatPersistence,
  ) {
    this.documentId = documentId;
    this.userId = userId;

    const isOptions =
      optionsOrPersistence &&
      ("persistence" in optionsOrPersistence ||
        "vectorStore" in optionsOrPersistence ||
        "generativeAi" in optionsOrPersistence ||
        "modelName" in optionsOrPersistence);

    const opts: ChatServiceOptions = isOptions
      ? (optionsOrPersistence as ChatServiceOptions)
      : { persistence: optionsOrPersistence as ChatPersistence | undefined };

    this.persistence = opts.persistence ?? defaultPersistence;
    this.model =
      opts.generativeAi ?? new GoogleGenerativeAI(serverEnv.GOOGLE_API_KEY);
    this.modelName = opts.modelName ?? "gemini-2.5-flash";
    this.vectorStore = opts.vectorStore;
  }

  private async initVectorStore(): Promise<IVectorStoreService> {
    this.vectorStore ??= new VectorStoreService();
    return this.vectorStore;
  }

  private async getRelevantDocuments(
    query: string,
  ): Promise<RelevantDocument[]> {
    try {
      const store = await this.initVectorStore();
      const chunks = await store.searchSimilarChunks(
        query,
        this.documentId,
        { topK: 5 },
      );
      return chunks.map((chunk) => ({
        pageContent: chunk.content,
        pageNumber: chunk.metadata.pageNumber,
      }));
    } catch (error) {
      console.error("Error retrieving relevant documents:", error);
      throw error;
    }
  }

  private async generateResponse(
    prompt: string,
    context: string,
    history: ChatMessage[],
    onToken: (token: string) => void,
  ): Promise<string> {
    const model = this.model.getGenerativeModel({
      model: this.modelName,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const formattedPrompt = PROMPT_TEMPLATE.replace(
      "{context}",
      context,
    ).replace("{question}", prompt);

    const generationStart = performance.now();
    const result = await chat.sendMessageStream([{ text: formattedPrompt }]);

    let fullText = "";
    let firstToken = true;
    for await (const chunk of result.stream) {
      const token =
        typeof chunk.text === "function" ? chunk.text() : chunk.text;

      if (firstToken) {
        const firstTokenTime = performance.now() - generationStart;

        console.log(
          `[PERF] First Gemini token: ${firstTokenTime.toFixed(2)} ms`,
        );

        firstToken = false;
      }

      fullText += token;
      onToken(token);
    }

    console.log(
      `[PERF] Total Gemini stream: ${(performance.now() - generationStart).toFixed(2)} ms`,
    );

    return fullText;
  }

  public async chat(
    message: string,
    onToken: (token: string) => void,
  ): Promise<string> {
    try {
      const saveUserMessageStart = performance.now();
      // Store user message via persistence layer
      await this.persistence.saveMessage(this.userId, this.documentId, message, "user");

      console.log(
        `[PERF] Save user message: ${(performance.now() - saveUserMessageStart).toFixed(2)} ms`,
      );

      const getRelevantDocsStart = performance.now();
      // Get relevant documents
      const relevantDocs = await this.getRelevantDocuments(message);

      console.log(
        `[PERF] Get relevant docs: ${(performance.now() - getRelevantDocsStart).toFixed(2)} ms`,
      );
      const context = relevantDocs
        .map((doc) => `[Page ${doc.pageNumber}]:\n${doc.pageContent}`)
        .join("\n\n");

      const historyStart = performance.now();
      // Get chat history via persistence layer
      const fullHistory = await this.persistence.getHistory(this.documentId, this.userId);
      const history = fullHistory.slice(-20);

      console.log(
        `[PERF] Get chat history: ${(performance.now() - historyStart).toFixed(2)} ms`,
      );

      const generateResponseStart = performance.now();
      // Generate response using Gemini
      const response = await this.generateResponse(
        message,
        context,
        history,
        onToken,
      );

      console.log(
        `[PERF] Generate response: ${(performance.now() - generateResponseStart).toFixed(2)} ms`,
      );

      const saveAssistantMessageStart = performance.now();
      // Store assistant message via persistence layer
      await this.persistence.saveMessage(this.userId, this.documentId, response, "assistant");

      console.log(
        `[PERF] Save assistant message: ${(performance.now() - saveAssistantMessageStart).toFixed(2)} ms`,
      );

      return response;
    } catch (error) {
      console.error("Error in chat:", error);
      throw error;
    }
  }
}
