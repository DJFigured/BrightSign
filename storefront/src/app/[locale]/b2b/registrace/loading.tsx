export default function B2BRegistraceLoading() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="rounded-lg border border-border bg-white p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-10 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-12 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
