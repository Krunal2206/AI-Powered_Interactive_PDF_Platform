import { Skeleton } from "@/components/DashboardPage/Skeleton";

export default function UploadLoading() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>

        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
