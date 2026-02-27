export default function CartLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 h-8 w-24 animate-pulse rounded bg-muted" />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items skeleton */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-white">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-4 border-b border-border p-4 last:border-0">
                <div className="h-20 w-20 shrink-0 animate-pulse rounded bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-8 w-24 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>

        {/* Summary skeleton */}
        <div className="rounded-lg border border-border bg-white p-6 space-y-4">
          <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="h-12 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
