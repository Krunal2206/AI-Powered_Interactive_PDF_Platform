"use client";

import { DropZone } from "@/components/DashboardPage/DropZone";
import { FileList } from "@/components/DashboardPage/FileList";
import { UploadAlert } from "@/components/DashboardPage/UploadAlert";
import { Button } from "@/components/ui/button";
import { UPLOAD_CONFIG } from "@/constants/upload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const Upload = () => {
  const router = useRouter();
  const {
    uploadedFiles,
    isUploading,
    processFileUpload,
    removeFile,
    clearAllFiles,
  } = useFileUpload();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFile = acceptedFiles[0];
      if (!newFile) return;

      await processFileUpload(newFile);
    },
    [processFileUpload]
  );

  const dropzoneConfig = useDropzone({
    onDrop,
    accept: UPLOAD_CONFIG.ACCEPTED_FILE_TYPES,
    multiple: false,
    maxFiles: UPLOAD_CONFIG.MAX_FILES,
  });

  const handleDone = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 mb-4 p-2"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Documents
          </Button>

          <h1 className="text-4xl font-light text-gray-300 mb-2">
            Upload Documents
          </h1>

          <p className="text-slate-400">
            Drag and drop your files here or click to select files
          </p>
        </div>

        <DropZone
          onDrop={onDrop}
          isDragActive={dropzoneConfig.isDragActive}
          isDragAccept={dropzoneConfig.isDragAccept}
          isDragReject={dropzoneConfig.isDragReject}
          getRootProps={dropzoneConfig.getRootProps}
          getInputProps={dropzoneConfig.getInputProps}
        />

        <UploadAlert isVisible={isUploading} />

        <FileList
          files={uploadedFiles}
          onRemoveFile={removeFile}
          onClearAll={clearAllFiles}
          onDone={handleDone}
          isUploading={isUploading}
        />
      </div>
    </div>
  );
};

export default Upload;
