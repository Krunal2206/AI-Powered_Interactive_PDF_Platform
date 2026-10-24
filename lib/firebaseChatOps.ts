import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/firebase";
import { ChatMessage } from "@/types/chat";

export const addChatMessage = async (
  userId: string,
  documentId: string,
  content: string,
  role: "user" | "assistant",
) => {
  try {
    const messagesRef = collection(db, "chat-messages");

    const newMessage: Omit<ChatMessage, "id"> = {
      documentId,
      userId,
      role,
      content,
      createdAt: serverTimestamp() as Timestamp,
    };

    const messageDoc = await addDoc(messagesRef, newMessage);

    if (role == "user") {
      try {
        await updateDoc(doc(db, "pdf-documents", documentId), {
          totalChats: increment(1),
        });
      } catch (counterError) {
        console.error("Error incrementing totalChats:", counterError);
      }
    }

    return messageDoc.id;
  } catch (error) {
    console.error("Error adding chat message:", error);
    throw error;
  }
};

export const getChatHistory = async (documentId: string, userId: string) => {
  try {
    const messagesRef = collection(db, "chat-messages");
    const q = query(
      messagesRef,
      where("documentId", "==", documentId),
      where("userId", "==", userId),
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