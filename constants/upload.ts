export const UPLOAD_CONFIG = {
  PROGRESS_INTERVAL: 300,
  MAX_PROGRESS_BEFORE_COMPLETE: 90,
  PROCESSING_PROGRESS: 95,
  ACCEPTED_FILE_TYPES: {
    "application/pdf": [".pdf"],
  },
  MAX_FILES: 1,
} as const;
