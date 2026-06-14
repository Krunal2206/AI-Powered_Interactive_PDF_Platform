import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { ChatSession, ChatMessage } from "@/types/chat";

export const createChatSession = async (userId: string, documentId: string) => {
  try {
    const sessionsRef = collection(db, "chat-sessions");
    const newSession: Omit<ChatSession, "id"> = {
      documentId,
      userId,
      messages: [],
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      messageCount: 0,
    };

    const docRef = await addDoc(sessionsRef, newSession);
    return docRef.id;
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
};

export const addChatMessage = async (
  sessionId: string,
  content: string,
  role: "user" | "assistant",
  metadata?: ChatMessage["metadata"],
) => {
  try {
    const messagesRef = collection(db, "chat-messages");
    const sessionRef = doc(db, "chat-sessions", sessionId);

    const newMessage: Omit<ChatMessage, "id"> = {
      sessionId,
      content,
      role,
      createdAt: serverTimestamp() as Timestamp,
      ...(metadata !== undefined && { metadata }),
    };

    const messageDoc = await addDoc(messagesRef, newMessage);

    await updateDoc(sessionRef, {
      lastMessage: content,
      messageCount: (await getDoc(sessionRef)).data()?.messageCount + 1 || 1,
      updatedAt: serverTimestamp(),
    });

    return messageDoc.id;
  } catch (error) {
    console.error("Error adding chat message:", error);
    throw error;
  }
};

export const getChatHistory = async (sessionId: string) => {
  try {
    const messagesRef = collection(db, "chat-messages");
    const q = query(
      messagesRef,
      where("sessionId", "==", sessionId),
      orderBy("createdAt", "asc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];
  } catch (error) {
    console.error("Error getting chat history:", error);
    throw error;
  }
};

export const getUserSessions = async (userId: string) => {
  try {
    const sessionsRef = collection(db, "chat-sessions");
    const q = query(
      sessionsRef,
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatSession[];
  } catch (error) {
    console.error("Error getting user sessions:", error);
    throw error;
  }
};

export const getDocumentSessions = async (
  documentId: string,
  userId?: string,
) => {
  try {
    const sessionsRef = collection(db, "chat-sessions");

    // When userId is provided (server-side calls), always filter by it
    // to prevent one user from reading another user's chat sessions
    const q = userId
      ? query(
          sessionsRef,
          where("documentId", "==", documentId),
          where("userId", "==", userId),
          orderBy("updatedAt", "desc"),
        )
      : query(
          sessionsRef,
          where("documentId", "==", documentId),
          orderBy("updatedAt", "desc"),
        );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatSession[];
  } catch (error) {
    console.error("Error getting document sessions:", error);
    throw error;
  }
};
