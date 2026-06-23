import { db } from "@/firebase";
import {
  Document,
  DocumentUpdateData,
  DocumentUploadData,
} from "@/types/upload";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  orderBy,
  query,
  QuerySnapshot,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const COLLECTION_NAME = "pdf-documents";

function convertTimestamp(value: any): Date {
  if (value instanceof Date) return value;
  if (value?.toDate) return value.toDate();
  return new Date();
}

export async function addDocument(
  documentData: DocumentUploadData,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...documentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      uploadAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document:", error);
    throw new Error("Failed to add document");
  }
}

export async function getUserDocuments(userId: string): Promise<Document[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as Document;
      return {
        id: doc.id,
        title: data.title,
        originalFilename: data.originalFilename,
        cloudinaryPublicId: data.cloudinaryPublicId,
        cloudinaryUrl: data.cloudinaryUrl,
        fileSize: data.fileSize,
        uploadedAt: convertTimestamp(data.uploadedAt),
        userId: data.userId,
        mimeType: data.mimeType,
        status: data.status,
        thumbnailUrl: data.thumbnailUrl,
        pageCount: data.pageCount,
        description: data.description,
        chatEnabled: data.chatEnabled,
        totalChats: data.totalChats,
      };
    });
  } catch (error) {
    console.error("Error fetching user documents:", error);
    throw new Error("Failed to fetch documents");
  }
}

export async function getDocument(
  documentId: string,
): Promise<Document | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        uploadedAt: convertTimestamp(docSnap.data().uploadedAt),
      } as Document;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    throw new Error("Failed to fetch document");
  }
}

export async function updateDocument(
  documentId: string,
  updateData: DocumentUpdateData,
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, documentId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating document:", error);
    throw new Error("Failed to update document");
  }
}

export async function deleteDocument(documentId: string): Promise<void> {
  try {
    const document = await getDocument(documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    try {
      const res = await fetch(`/api/documents/${documentId}/cloudinary`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error(
          "Cloudinary deletion failed:",
          body.error ?? res.statusText,
        );
      }
    } catch (cloudinaryError) {
      console.error("Error calling Cloudinary delete route:", cloudinaryError);
    }

    try {
      const res = await fetch(`/api/documents/${documentId}/process`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error(
          "Chunk/embedding deletion failed:",
          body.error ?? res.statusText,
        );
      }
    } catch (chunkError) {
      console.error("Error deleting chunks/embeddings:", chunkError);
    }

    try {
      await deleteChatData(documentId);
    } catch (chatError) {
      console.error("Error deleting chat data:", chatError);
    }

    const docRef = doc(db, COLLECTION_NAME, documentId);
    await deleteDoc(docRef);

    console.log(`Document ${documentId} fully deleted`);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new Error("Failed to delete document");
  }
}

export async function deleteChatData(documentId: string): Promise<void> {
  const sessionsRef = collection(db, "chat-sessions");
  const sessionsQuery = query(
    sessionsRef,
    where("documentId", "==", documentId),
  );
  const sessionsSnapshot = await getDocs(sessionsQuery);

  for (const sessionDoc of sessionsSnapshot.docs) {
    const messagesRef = collection(db, "chat-messages");
    const messagesQuery = query(
      messagesRef,
      where("sessionId", "==", sessionDoc.id),
    );
    const messagesSnapshot = await getDocs(messagesQuery);

    const messageDeletes = messagesSnapshot.docs.map((msgDoc) =>
      deleteDoc(msgDoc.ref),
    );
    await Promise.all(messageDeletes);

    await deleteDoc(sessionDoc.ref);
  }
}
