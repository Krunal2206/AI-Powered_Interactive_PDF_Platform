import { Skeleton } from "@/components/DashboardPage/Skeleton";

export default function EditLoading() {
  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-700/50 p-6 space-y-6">
          <div className="flex items-center space-x-4 pb-6 border-b border-slate-700/50">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>

          <div className="flex space-x-3 pt-6 border-t border-slate-700/50">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
