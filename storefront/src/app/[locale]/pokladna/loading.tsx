export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Steps skeleton */}
      <div className="mb-8 flex items-center justify-center gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="hidden h-4 w-20 animate-pulse rounded bg-muted sm:block" />
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-10 animate-pulse rounded bg-muted" />
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
