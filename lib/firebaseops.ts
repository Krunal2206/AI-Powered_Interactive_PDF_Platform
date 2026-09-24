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
  runTransaction,
  Timestamp,
  updateDoc,
  where,
  getCountFromServer,
} from "firebase/firestore";

const COLLECTION_NAME = "pdf-documents";
// One doc per user (keyed by userId) tracking uploads in the current calendar
// month. Powers the free-tier "10 uploads / month" quota.
const UPLOAD_USAGE_COLLECTION = "upload-usage";

function isTimestampLike(value: unknown): value is { toDate: () => Date } {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  );
}

function convertTimestamp(value: unknown): Date {
  if (value instanceof Date) return value;
  if (isTimestampLike(value)) return value.toDate();
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
      uploadedAt: Timestamp.now(),
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

export async function getUserDocumentCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error counting user documents:", error);
    throw new Error("Failed to count documents");
  }
}

// Calendar-month key in UTC, e.g. "2026-08". The quota resets when this changes.
function currentUploadPeriod(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// How many uploads the user has made in the current calendar month. Reads a
// per-user counter that is only ever incremented (on a successful upload) and
// reset at each month boundary — deleting a document does NOT free a slot.
export async function getMonthlyUploadCount(userId: string): Promise<number> {
  try {
    const usageRef = doc(db, UPLOAD_USAGE_COLLECTION, userId);
    const snapshot = await getDoc(usageRef);
    const data = snapshot.data();
    // Missing doc, or a counter left over from a previous month, counts as zero.
    if (data?.period !== currentUploadPeriod()) return 0;
    return typeof data.count === "number" ? data.count : 0;
  } catch (error) {
    console.error("Error reading monthly upload count:", error);
    throw new Error("Failed to read upload usage");
  }
}

// Records one upload against the current calendar month, starting a fresh count
// when a new month has begun. Runs in a transaction so concurrent uploads don't
// clobber each other's increment.
export async function recordMonthlyUpload(userId: string): Promise<void> {
  const usageRef = doc(db, UPLOAD_USAGE_COLLECTION, userId);
  const period = currentUploadPeriod();

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(usageRef);
    const data = snapshot.data();
    const samePeriod = data?.period === period;
    const previousCount =
      samePeriod && typeof data?.count === "number" ? data.count : 0;

    transaction.set(usageRef, {
      userId,
      period,
      count: previousCount + 1,
      updatedAt: Timestamp.now(),
    });
  });
}
