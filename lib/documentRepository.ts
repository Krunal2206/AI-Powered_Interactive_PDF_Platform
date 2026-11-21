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
  Firestore,
  getDoc,
  getDocs,
  orderBy,
  query,
  QuerySnapshot,
  Timestamp,
  updateDoc,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { convertTimestamp } from "./timestampUtils";
import { COLLECTIONS } from "@/constants/collections";
import { batchDeleteDocs } from "./batchUtils";

const COLLECTION_NAME = COLLECTIONS.DOCUMENTS;

export async function addDocument(
  documentData: DocumentUploadData,
  firestore: Firestore = db,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(firestore, COLLECTION_NAME), {
      ...documentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      uploadedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document:", error);
    throw new Error("Failed to add document");
  }
}

export async function getUserDocuments(
  userId: string,
  firestore: Firestore = db,
): Promise<Document[]> {
  try {
    const q = query(
      collection(firestore, COLLECTION_NAME),
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
        status: data.status,
        pageCount: data.pageCount,
        description: data.description,
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
  firestore: Firestore = db,
): Promise<Document | null> {
  try {
    const docRef = doc(firestore, COLLECTION_NAME, documentId);
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
  firestore: Firestore = db,
): Promise<void> {
  try {
    const docRef = doc(firestore, COLLECTION_NAME, documentId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating document:", error);
    throw new Error("Failed to update document");
  }
}

export async function deleteDocumentRecord(
  documentId: string,
  firestore: Firestore = db,
): Promise<void> {
  const docRef = doc(firestore, COLLECTION_NAME, documentId);
  await deleteDoc(docRef);
}

export async function getUserDocumentCount(
  userId: string,
  firestore: Firestore = db,
): Promise<number> {
  try {
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where("userId", "==", userId),
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error counting user documents:", error);
    throw new Error("Failed to count documents");
  }
}

export async function deleteChatData(
  documentId: string,
  firestore: Firestore = db,
): Promise<void> {
  const messagesQuery = query(
    collection(firestore, COLLECTIONS.CHAT_MESSAGES),
    where("documentId", "==", documentId),
  );
  const messagesSnapshot = await getDocs(messagesQuery);

  await batchDeleteDocs(messagesSnapshot.docs, firestore);
}
