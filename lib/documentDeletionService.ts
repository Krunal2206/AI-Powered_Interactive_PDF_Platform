export interface DeleteDocumentOptions {
  fetcher?: typeof fetch;
}

/**
 * Client-facing document deletion helper (DIP compliant).
 * Delegates to the unified server-side DELETE /api/documents/[id] endpoint.
 * Supports an injected fetcher for testing or custom transport.
 */
export async function deleteDocument(
  documentId: string,
  options?: DeleteDocumentOptions,
): Promise<void> {
  const customFetch = options?.fetcher ?? fetch;
  const res = await customFetch(`/api/documents/${documentId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Failed to delete document: ${res.statusText}`,
    );
  }
}
