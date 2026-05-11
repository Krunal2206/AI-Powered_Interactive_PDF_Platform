// components/PdfChatPage/ProcessingStatus.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Document as DocumentType } from "@/types/upload";
import {
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  RotateCcw,
  Loader2,
  Info,
} from "lucide-react";

interface ProcessingState {
  isProcessing: boolean;
  isProcessed: boolean;
  error: string | null;
  stats: {
    totalPages: number;
    totalCharacters: number;
    totalChunks: number;
    processingTime: number;
  } | null;
}

interface ProcessingStatusProps {
  document: DocumentType;
  processingState: ProcessingState;
  onProcess: () => void;
  onReprocess: () => void;
}

export const ProcessingStatus = ({
  document,
  processingState,
  onProcess,
  onReprocess,
}: ProcessingStatusProps) => {
  const { isProcessing, isProcessed, error, stats } = processingState;

  return (
    <div className="border-b border-slate-800 p-4 bg-slate-900/50">
      <div className="space-y-3">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">
              Document Status
            </span>
          </div>

          {/* Status Icon */}
          <div className="flex items-center space-x-2">
            {isProcessing && (
              <div className="flex items-center space-x-2 text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Processing...</span>
              </div>
            )}

            {!isProcessing && isProcessed && (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Ready</span>
              </div>
            )}

            {!isProcessing && !isProcessed && !error && (
              <div className="flex items-center space-x-2 text-yellow-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Not processed</span>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">Error</span>
              </div>
            )}
          </div>
        </div>

        {/* Processing Stats */}
        {stats && isProcessed && (
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Pages:</span>
                <span className="text-white">{stats.totalPages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chunks:</span>
                <span className="text-white">{stats.totalChunks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Characters:</span>
                <span className="text-white">
                  {stats.totalCharacters.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time:</span>
                <span className="text-white">
                  {(stats.processingTime / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-300 font-medium">
                  Processing failed
                </p>
                <p className="text-xs text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isProcessed && !isProcessing && (
              <Button
                onClick={onProcess}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xs"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3 mr-1" />
                    Process Document
                  </>
                )}
              </Button>
            )}

            {isProcessed && !isProcessing && (
              <Button
                onClick={onReprocess}
                size="sm"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reprocess
              </Button>
            )}
          </div>

          {/* Info about processing */}
          {!isProcessed && !isProcessing && (
            <div className="flex items-center space-x-1 text-slate-500">
              <Info className="w-3 h-3" />
              <span className="text-xs">Required for chat</span>
            </div>
          )}
        </div>

        {/* Processing Info */}
        {isProcessing && (
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Loader2 className="w-4 h-4 text-blue-400 mt-0.5 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-300 font-medium">
                  Processing document...
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  Extracting text and creating searchable chunks. This may take
                  a moment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
