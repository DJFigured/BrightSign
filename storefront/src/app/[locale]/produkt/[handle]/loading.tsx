export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image skeleton */}
        <div>
          <div className="aspect-square animate-pulse rounded-lg border border-border bg-muted" />
          <div className="mt-3 flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 w-16 animate-pulse rounded border border-border bg-muted" />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div>
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-1/4 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-10 w-1/3 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-1/4 animate-pulse rounded bg-muted" />
          <div className="mt-6 flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="my-6 h-px bg-border" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-32 animate-pulse rounded bg-muted" />
            <div className="h-10 flex-1 animate-pulse rounded bg-muted" />
          </div>
          <div className="my-6 h-px bg-border" />
          <div className="space-y-3">
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}
