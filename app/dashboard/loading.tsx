import { DocumentGridSkeleton } from "@/components/DashboardPage/DocumentCardSkeleton";
import { Skeleton } from "@/components/DashboardPage/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-full sm:w-48" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <DocumentGridSkeleton count={10} />
      </div>
    </div>
  );
}
