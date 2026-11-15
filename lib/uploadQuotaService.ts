import { db } from "@/firebase";
import {
  UploadRecord,
  UploadUsageEntry,
  UploadUsageSummary,
  ReserveResult,
} from "@/types/upload";
import {
  collection,
  doc,
  DocumentData,
  Firestore,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  Timestamp,
  Transaction,
} from "firebase/firestore";
import { convertTimestamp } from "./timestampUtils";
import { COLLECTIONS } from "@/constants/collections";

const UPLOAD_USAGE_COLLECTION = COLLECTIONS.UPLOAD_USAGE;
const RESERVATION_TTL_MS = 5 * 60 * 1000;
const TRANSACTION_OPTIONS = { maxAttempts: 10 };

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
  firestore: Firestore = db,
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
    doc(
      firestore,
      UPLOAD_USAGE_COLLECTION,
      userId,
      COLLECTIONS.UPLOAD_USAGE_HISTORY,
      data.period,
    ),
    {
      userId,
      period: data.period,
      count,
      uploads: completed,
      updatedAt: now,
    },
  );
}

function toUploadRecords(raw: unknown): UploadRecord[] {
  if (!Array.isArray(raw)) return [];

  return (raw as UploadUsageEntry[])
    .map((entry) => ({
      id: entry.id,
      at: convertTimestamp(entry.at),
      status: entry.status,
      ...(entry.documentId ? { documentId: entry.documentId } : {}),
    }))
    .sort((a, b) => b.at.getTime() - a.at.getTime());
}

export async function reserveUploadSlot(
  userId: string,
  reservationId: string,
  limit: number,
  firestore: Firestore = db,
): Promise<ReserveResult> {
  const usageRef = doc(firestore, UPLOAD_USAGE_COLLECTION, userId);
  const period = currentUploadPeriod();

  return runTransaction<ReserveResult>(
    firestore,
    async (transaction) => {
      const snapshot = await transaction.get(usageRef);
      const now = Timestamp.now();

      const { count, uploads } = readUsage(
        snapshot.data(),
        period,
        now.toMillis(),
      );

      if (count >= limit) return { ok: false, used: count };

      archivePreviousPeriod(
        transaction,
        userId,
        snapshot.data(),
        period,
        now,
        firestore,
      );

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
  firestore: Firestore = db,
): Promise<void> {
  const usageRef = doc(firestore, UPLOAD_USAGE_COLLECTION, userId);
  const period = currentUploadPeriod();

  await runTransaction(
    firestore,
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
  firestore: Firestore = db,
): Promise<void> {
  const usageRef = doc(firestore, UPLOAD_USAGE_COLLECTION, userId);
  const period = currentUploadPeriod();

  await runTransaction(
    firestore,
    async (transaction) => {
      const snapshot = await transaction.get(usageRef);
      const now = Timestamp.now();
      const { count, uploads } = readUsage(
        snapshot.data(),
        period,
        now.toMillis(),
      );

      archivePreviousPeriod(
        transaction,
        userId,
        snapshot.data(),
        period,
        now,
        firestore,
      );

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

export async function getUploadUsage(
  userId: string,
  firestore: Firestore = db,
): Promise<UploadUsageSummary> {
  try {
    const period = currentUploadPeriod();

    const [usageSnapshot, historySnapshot] = await Promise.all([
      getDoc(doc(firestore, UPLOAD_USAGE_COLLECTION, userId)),
      getDocs(
        query(
          collection(
            firestore,
            UPLOAD_USAGE_COLLECTION,
            userId,
            COLLECTIONS.UPLOAD_USAGE_HISTORY,
          ),
          orderBy("period", "desc"),
        ),
      ),
    ]);

    const { count, uploads } = readUsage(
      usageSnapshot.data(),
      period,
      Date.now(),
    );

    return {
      period,
      used: count,
      uploads: toUploadRecords(uploads),
      history: historySnapshot.docs.map((snapshot) => {
        const data = snapshot.data();
        return {
          period: typeof data.period === "string" ? data.period : snapshot.id,
          count: typeof data.count === "number" ? data.count : 0,
          uploads: toUploadRecords(data.uploads),
        };
      }),
    };
  } catch (error) {
    console.error("Error reading upload usage:", error);
    throw new Error("Failed to read upload usage");
  }
}
