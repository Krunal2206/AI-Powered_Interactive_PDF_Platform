import { DocumentReference, WriteBatch, writeBatch } from "firebase/firestore";
import { db } from "@/firebase";

export const FIRESTORE_BATCH_LIMIT = 499;

export interface DocWithRef {
  ref: DocumentReference;
}

/**
 * Executes a batch operation over an array of items in slices of `batchSize`.
 * Automatically instantiates and commits a Firestore WriteBatch for each slice.
 */
export async function batchProcess<T>(
  items: T[],
  operation: (batch: WriteBatch, item: T) => void,
  batchSize: number = FIRESTORE_BATCH_LIMIT,
): Promise<void> {
  if (items.length === 0) return;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = writeBatch(db);
    const slice = items.slice(i, i + batchSize);

    for (const item of slice) {
      operation(batch, item);
    }

    await batch.commit();
  }
}

/**
 * Deletes an array of documents (or objects with a DocumentReference `ref`)
 * in batches of `batchSize`.
 */
export async function batchDeleteDocs<T extends DocWithRef>(
  docs: T[],
  batchSize: number = FIRESTORE_BATCH_LIMIT,
): Promise<void> {
  return batchProcess(
    docs,
    (batch, doc) => {
      batch.delete(doc.ref);
    },
    batchSize,
  );
}
