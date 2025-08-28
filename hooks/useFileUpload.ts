import { useState, useCallback, useRef } from "react";
import { UploadedFile } from "../types/upload";
import { UPLOAD_CONFIG } from "../constants/upload";
import { generateFileId } from "@/lib/upload";

export const useFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateFileProgress = useCallback((fileId: string, progress: number) => {
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f
      )
    );
  }, []);

  const updateFileStatus = useCallback(
    (
      fileId: string,
      status: UploadedFile["status"],
      additionalData?: Partial<UploadedFile>
    ) => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status, ...additionalData } : f
        )
      );
    },
    []
  );

  const uploadToBackend = useCallback(
    async (file: File, fileId: string) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        updateFileProgress(fileId, 0);

        // Start progress simulation
        progressIntervalRef.current = setInterval(() => {
          setUploadedFiles((prev) =>
            prev.map((f) => {
              if (
                f.id === fileId &&
                f.progress < UPLOAD_CONFIG.MAX_PROGRESS_BEFORE_COMPLETE
              ) {
                return {
                  ...f,
                  progress: Math.min(
                    f.progress + Math.random() * 20,
                    UPLOAD_CONFIG.MAX_PROGRESS_BEFORE_COMPLETE
                  ),
                };
              }
              return f;
            })
          );
        }, UPLOAD_CONFIG.PROGRESS_INTERVAL);

        const response = await fetch("/api/upload-pdf", {
          method: "POST",
          body: formData,
        });

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        updateFileProgress(fileId, UPLOAD_CONFIG.PROCESSING_PROGRESS);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Upload failed with status: ${response.status}`
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Upload failed");
        }

        return result;
      } catch (error) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        throw error instanceof Error ? error : new Error("Upload failed");
      }
    },
    [updateFileProgress]
  );

  const processFileUpload = useCallback(
    async (file: File) => {
      const fileId = generateFileId();
      const fileObj: UploadedFile = {
        file,
        id: fileId,
        status: "uploading",
        progress: 0,
      };

      setUploadedFiles([fileObj]);
      setIsUploading(true);

      try {
        const result = await uploadToBackend(file, fileId);

        updateFileStatus(fileId, "success", {
          progress: 100,
          cloudinaryData: {
            public_id: result.public_id,
            secure_url: result.secure_url,
            resource_type: result.resource_type,
            bytes: result.bytes,
          },
        });

        console.log("Upload successful:", result);
      } catch (error) {
        updateFileStatus(fileId, "error", {
          errorMessage:
            error instanceof Error ? error.message : "Upload failed",
        });
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [uploadToBackend, updateFileStatus]
  );

  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAllFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  return {
    uploadedFiles,
    isUploading,
    processFileUpload,
    removeFile,
    clearAllFiles,
  };
};
