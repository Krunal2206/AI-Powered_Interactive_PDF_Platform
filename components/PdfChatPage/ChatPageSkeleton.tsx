import { Skeleton } from "../DashboardPage/Skeleton";

export const ChatPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Skeleton className="h-9 w-9 rounded-md" />
            <div className="flex items-center space-x-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)]">
        <div className="flex-1 flex flex-col">
          <div className="bg-slate-900/50 border-b border-slate-800 p-2 sm:p-4">
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <Skeleton className="h-full w-full max-w-2xl rounded-lg" />
          </div>
        </div>

        <div className="hidden lg:flex w-96 flex-col bg-slate-900/30 border-l border-slate-800">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4">
            <Skeleton className="h-16 w-3/4 rounded-2xl" />
            <Skeleton className="h-12 w-2/3 rounded-2xl ml-auto" />
            <Skeleton className="h-20 w-3/4 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
