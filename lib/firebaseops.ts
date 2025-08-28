import { db } from "@/firebase";
import { Document, DocumentUpdateData, DocumentUploadData } from "@/types/upload";
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
  documentData: DocumentUploadData
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...documentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      uploadAt: Timestamp.now(),
    });
    return docRef.id; // Return the document ID
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
      orderBy("createdAt", "desc")
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
      };
    })
  } catch (error) {
    console.error("Error fetching user documents:", error);
    throw new Error("Failed to fetch documents");
  }
}

export async function deleteDocument(documentId: string): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, documentId);
        await deleteDoc(docRef);
        console.log("Document deleted successfully");        
    } catch (error) {
        console.error("Error deleting document:", error);
        throw new Error("Failed to delete document");
    }
}

export async function getDocument(documentId: string): Promise<Document | null> {
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
  updateData: DocumentUpdateData
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