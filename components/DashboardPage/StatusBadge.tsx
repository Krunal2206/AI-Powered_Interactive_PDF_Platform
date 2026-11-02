import React from "react";
import { Badge } from "@/components/ui/badge";
import { DocumentOrUploadStatus, getStatusConfig } from "@/lib/documentUtils";

interface StatusBadgeProps {
  status: DocumentOrUploadStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const badgeConfig = getStatusConfig(status);

  return (
    <Badge variant={badgeConfig.variant} className={badgeConfig.badgeColor}>
      {badgeConfig.label}
    </Badge>
  );
};

