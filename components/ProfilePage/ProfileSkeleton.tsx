const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="h-10 w-64 bg-slate-800/50 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-80 bg-slate-800/50 rounded-lg animate-pulse" />
        </div>
        <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-slate-800/50 animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-7 w-48 bg-slate-800/50 rounded-lg animate-pulse" />
              <div className="h-4 w-56 bg-slate-800/50 rounded-lg animate-pulse" />
              <div className="h-4 w-40 bg-slate-800/50 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/50 rounded-xl border border-white/10 p-5"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-800/50 animate-pulse mb-3" />
              <div className="h-4 w-20 bg-slate-800/50 rounded animate-pulse mb-2" />
              <div className="h-8 w-16 bg-slate-800/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProfileSkeleton