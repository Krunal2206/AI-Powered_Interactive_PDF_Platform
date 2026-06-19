import { Skeleton } from "./Skeleton";

export const DocumentCardSkeleton = () => {
  return (
    <div className="aspect-[3/4] bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden p-4 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-11 h-11 rounded-lg" />
        <Skeleton className="w-8 h-8 rounded-md" />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-14" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
};

export const DocumentGridSkeleton = ({ count = 10 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <DocumentCardSkeleton key={i} />
      ))}
    </>
  );
};
