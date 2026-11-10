/**
 * Initiates a browser download for a Blob.
 *
 * @param blob - The Blob instance to download
 * @param filename - The default filename for the saved file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Initiates a browser download for text content.
 *
 * @param content - Plain text or structured string content
 * @param filename - The default filename for the saved file
 * @param mimeType - Optional MIME type (defaults to 'text/plain;charset=utf-8')
 */
export function downloadText(
  content: string,
  filename: string,
  mimeType: string = "text/plain;charset=utf-8"
): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Fetches a file from a remote URL as a Blob and triggers a browser download.
 *
 * @param url - Remote URL of the file to download
 * @param filename - The desired local filename
 */
export async function downloadUrl(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file for download: ${response.statusText}`);
  }
  const blob = await response.blob();
  downloadBlob(blob, filename);
}

/**
 * Downloads a document given its Cloudinary/remote URL and filename or title.
 *
 * @param document - Object containing at least cloudinaryUrl and optional title or originalFilename
 */
export async function downloadDocument(document: {
  cloudinaryUrl: string;
  originalFilename?: string;
  title?: string;
}): Promise<void> {
  const filename = document.originalFilename || `${document.title || "document"}.pdf`;
  await downloadUrl(document.cloudinaryUrl, filename);
}

