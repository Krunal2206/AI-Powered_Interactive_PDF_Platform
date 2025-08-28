import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { UploadedFile } from "@/types/upload";

interface StatusBadgeProps {
  status: UploadedFile["status"];
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const badgeConfig = useMemo(() => {
    switch (status) {
      case "success":
        return {
          variant: "secondary" as const,
          className: "bg-green-500/20 text-green-400 border-green-500/30",
          text: "Uploaded",
        };
      case "error":
        return {
          variant: "destructive" as const,
          className: "bg-red-500/20 text-red-400 border-red-500/30",
          text: "Failed",
        };
      default:
        return {
          variant: "secondary" as const,
          className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
          text: "Uploading",
        };
    }
  }, [status]);

  return (
    <Badge variant={badgeConfig.variant} className={badgeConfig.className}>
      {badgeConfig.text}
    </Badge>
  );
};
