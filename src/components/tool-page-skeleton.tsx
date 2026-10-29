export function ToolPageSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl animate-pulse px-4 py-8 md:py-12">
      {/* Header skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-9 w-2/3 rounded bg-zinc-200" />
        <div className="h-4 w-1/2 rounded bg-zinc-200" />
      </div>

      {/* Two-column skeleton */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
        {/* Form skeleton */}
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
          <div className="h-6 w-1/3 rounded bg-zinc-200" />
          <div className="h-4 w-2/3 rounded bg-zinc-200" />
          <div className="h-11 rounded bg-zinc-200" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 rounded bg-zinc-200" />
            <div className="h-10 rounded bg-zinc-200" />
          </div>
          <div className="h-12 rounded bg-zinc-200" />
        </div>

        {/* Result skeleton */}
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
          <div className="h-6 w-1/3 rounded bg-zinc-200" />
          <div className="h-12 rounded-lg bg-zinc-200" />
          <div className="h-4 w-2/3 rounded bg-zinc-200" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-zinc-200" />
            <div className="h-4 w-5/6 rounded bg-zinc-200" />
          </div>
        </div>
      </div>
    </div>
  );
}