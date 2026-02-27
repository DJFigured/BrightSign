export default function CompareLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 h-8 w-1/4 animate-pulse rounded bg-muted" />
      <div className="overflow-x-auto">
        <div className="flex gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-[180px] shrink-0 space-y-3">
              <div className="mx-auto h-20 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-6 w-2/3 mx-auto animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
