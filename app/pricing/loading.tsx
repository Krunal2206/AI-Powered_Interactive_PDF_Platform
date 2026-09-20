const PricingLoading = () => {
  return (
    <div className="min-h-screen text-white" role="status" aria-label="Loading pricing page">
      <span className="sr-only">Loading pricing page…</span>
      <div className="container mx-auto px-4 py-16">
        {/* Header skeleton */}
        <div className="text-center mb-16">
          <div className="h-12 w-80 bg-slate-800/50 rounded-lg animate-pulse mx-auto mb-6" />
          <div className="h-6 w-full max-w-2xl bg-slate-800/50 rounded-lg animate-pulse mx-auto mb-2" />
          <div className="h-6 w-full max-w-xl bg-slate-800/50 rounded-lg animate-pulse mx-auto" />
        </div>

        {/* Plan cards skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-8 border border-slate-700 bg-slate-900/50"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-800/50 animate-pulse mx-auto mb-4" />
                <div className="h-7 w-24 bg-slate-800/50 rounded-lg animate-pulse mx-auto mb-2" />
                <div className="h-10 w-20 bg-slate-800/50 rounded-lg animate-pulse mx-auto mb-2" />
                <div className="h-4 w-40 bg-slate-800/50 rounded animate-pulse mx-auto" />
              </div>
              <div className="space-y-3 mb-8">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded bg-slate-800/50 animate-pulse shrink-0" />
                    <div className="h-4 w-full bg-slate-800/50 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="h-12 w-full bg-slate-800/50 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>

        {/* Feature comparison skeleton */}
        <div className="mb-20">
          <div className="h-8 w-64 bg-slate-800/50 rounded-lg animate-pulse mx-auto mb-12" />
          <div className="bg-slate-900/50 rounded-2xl border border-slate-700 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-4 border-b border-slate-700/50 last:border-0"
              >
                <div className="h-4 w-40 bg-slate-800/50 rounded animate-pulse" />
                <div className="flex gap-12">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-4 w-16 bg-slate-800/50 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ skeleton */}
        <div className="mb-20">
          <div className="h-8 w-72 bg-slate-800/50 rounded-lg animate-pulse mx-auto mb-12" />
          <div className="max-w-3xl mx-auto space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-900/50 rounded-xl border border-slate-700 p-6"
              >
                <div className="h-6 w-3/4 bg-slate-800/50 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingLoading;
