import { db } from "@/firebase";
import {
  Document,
  DocumentUpdateData,
  DocumentUploadData,
  ReserveResult,
  UploadUsageEntry,
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
  writeBatch,
  Transaction,
} from "firebase/firestore";

const COLLECTION_NAME = "pdf-documents";
// One doc per user (keyed by userId) tracking uploads in the current calendar
// month. Powers the free-tier "10 uploads / month" quota.
const UPLOAD_USAGE_COLLECTION = "upload-usage";
const RESERVATION_TTL_MS = 5 * 60 * 1000; // TTL for reservations, after which they are expired
const TRANSACTION_OPTIONS = { maxAttempts: 10 }; // Concurrent upload retry attempts

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
  const messagesQuery = query(
    collection(db, "chat-messages"),
    where("documentId", "==", documentId),
  );
  const messagesSnapshot = await getDocs(messagesQuery);

  const BATCH_LIMIT = 500;

  for (let i = 0; i < messagesSnapshot.docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    messagesSnapshot.docs
      .slice(i, i + BATCH_LIMIT)
      .forEach((messageDoc) => batch.delete(messageDoc.ref));
    await batch.commit();
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

function readUsage(
  data: DocumentData | undefined,
  period: string,
  nowMillis: number,
): { count: number; uploads: UploadUsageEntry[] } {
  if (!data || data.period !== period) return { count: 0, uploads: [] };

  const stored: UploadUsageEntry[] = Array.isArray(data.uploads)
    ? data.uploads
    : [];

  const uploads = stored.filter(
    (entry) =>
      entry.status === "completed" ||
      nowMillis - entry.at.toMillis() < RESERVATION_TTL_MS,
  );

  const expired = stored.length - uploads.length;
  const storedCount = typeof data.count === "number" ? data.count : 0;

  return {
    count: Math.max(0, storedCount - expired),
    uploads,
  };
}

function archivePreviousPeriod(
  transaction: Transaction,
  userId: string,
  data: DocumentData | undefined,
  period: string,
  now: Timestamp,
): void {
  if (!data || typeof data.period !== "string" || data.period === period) {
    return; // same month, or no previous data
  }

  const stored: UploadUsageEntry[] = Array.isArray(data.uploads)
    ? data.uploads
    : [];

  const completed = stored.filter((entry) => entry.status === "completed");
  const unconfirmed = stored.length - completed.length;
  const storedCount = typeof data.count === "number" ? data.count : 0;
  const count = Math.max(0, storedCount - unconfirmed);

  if (count === 0 && completed.length === 0) {
    return;
  }

  transaction.set(
    doc(db, UPLOAD_USAGE_COLLECTION, userId, "history", data.period),
    {
      userId,
      period: data.period,
      count,
      uploads: completed,
      updatedAt: now,
    },
  );
}

export async function reserveUploadSlot(
  userId: string,
  reservationId: string,
  limit: number,
): Promise<ReserveResult> {
  const usageRef = doc(db, UPLOAD_USAGE_COLLECTION, userId);
  const period = currentUploadPeriod();

  return runTransaction<ReserveResult>(
    db,
    async (transaction) => {
      const snapshot = await transaction.get(usageRef);
      const now = Timestamp.now();

      const { count, uploads } = readUsage(
        snapshot.data(),
        period,
        now.toMillis(),
      );

      if (count >= limit) return { ok: false, used: count };

      archivePreviousPeriod(transaction, userId, snapshot.data(), period, now);

      transaction.set(usageRef, {
        userId,
        period,
        uploads: [
          ...uploads,
          { id: reservationId, at: now, status: "reserved" },
        ],
        count: count + 1,
        updatedAt: now,
      });
      return { ok: true };
    },
    TRANSACTION_OPTIONS,
  );
}

// Gives the slot back when the upload failed before a document was saved.
export async function releaseUploadSlot(
  userId: string,
  reservationId: string,
): Promise<void> {
  const usageRef = doc(db, UPLOAD_USAGE_COLLECTION, userId);
  const period = currentUploadPeriod();

  await runTransaction(
    db,
    async (transaction) => {
      const snapshot = await transaction.get(usageRef);
      const now = Timestamp.now();
      const { count, uploads } = readUsage(
        snapshot.data(),
        period,
        now.toMillis(),
      );

      const remaining = uploads.filter(
        (entry) => !(entry.id === reservationId && entry.status === "reserved"),
      );
      if (remaining.length === uploads.length) return; // nothing to release

      transaction.set(usageRef, {
        userId,
        period,
        count: Math.max(0, count - 1),
        uploads: remaining,
        updatedAt: now,
      });
    },
    TRANSACTION_OPTIONS,
  );
}

export async function confirmUploadSlot(
  userId: string,
  reservationId: string,
  documentId: string,
): Promise<void> {
  const usageRef = doc(db, UPLOAD_USAGE_COLLECTION, userId);
  const period = currentUploadPeriod();

  await runTransaction(
    db,
    async (transaction) => {
      const snapshot = await transaction.get(usageRef);
      const now = Timestamp.now();
      const { count, uploads } = readUsage(
        snapshot.data(),
        period,
        now.toMillis(),
      );

      archivePreviousPeriod(transaction, userId, snapshot.data(), period, now);

      const index = uploads.findIndex((entry) => entry.id === reservationId);

      if (index === -1) {
        transaction.set(usageRef, {
          userId,
          period,
          count: count + 1,
          uploads: [
            ...uploads,
            { id: reservationId, at: now, status: "completed", documentId },
          ],
          updatedAt: now,
        });
        return;
      }

      const updated = [...uploads];
      updated[index] = {
        ...updated[index],
        status: "completed",
        documentId,
      };

      transaction.set(usageRef, {
        userId,
        period,
        count,
        uploads: updated,
        updatedAt: now,
      });
    },
    TRANSACTION_OPTIONS,
  );
}
