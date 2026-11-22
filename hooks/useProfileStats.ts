import { useCallback, useEffect, useState } from "react";
import { getUserDocuments } from "@/lib/documentRepository";
import { getUploadUsage } from "@/lib/uploadQuotaService";
import { Document, UploadUsageSummary } from "@/types/upload";

export interface UsageStats {
  totalDocuments: number;
  totalStorage: number;
  totalChats: number;
  recentUpload: Date | null;
  processedDocuments: number;
}

const INITIAL_STATS: UsageStats = {
  totalDocuments: 0,
  totalStorage: 0,
  totalChats: 0,
  recentUpload: null,
  processedDocuments: 0,
};

function computeStats(documents: Document[]): UsageStats {
  const totalStorage = documents.reduce(
    (sum, doc) => sum + (doc.fileSize || 0),
    0,
  );
  const totalChats = documents.reduce(
    (sum, doc) => sum + (doc.totalChats || 0),
    0,
  );
  const processedDocuments = documents.filter(
    (doc) => doc.status === "ready",
  ).length;

  const sortedByDate = [...documents].sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );

  return {
    totalDocuments: documents.length,
    totalStorage,
    totalChats,
    recentUpload: sortedByDate[0]?.uploadedAt
      ? new Date(sortedByDate[0].uploadedAt)
      : null,
    processedDocuments,
  };
}

export function useProfileStats(userId: string | undefined) {
  const [stats, setStats] = useState<UsageStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UploadUsageSummary | null>(null);
  const [documentTitles, setDocumentTitles] = useState<Record<string, string>>(
    {},
  );

  const loadStats = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [documents, usageSummary]: [Document[], UploadUsageSummary | null] =
        await Promise.all([
          getUserDocuments(userId),
          getUploadUsage(userId).catch((error) => {
            console.error("Error loading upload usage:", error);
            return null;
          }),
        ]);

      setUsage(usageSummary);
      setDocumentTitles(
        Object.fromEntries(documents.map((doc) => [doc.id, doc.title])),
      );
      setStats(computeStats(documents));
    } catch (error) {
      console.error("Error loading profile stats:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return { stats, loading, usage, documentTitles };
}
