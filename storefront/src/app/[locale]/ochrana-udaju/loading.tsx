export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-2 h-8 w-1/3 animate-pulse rounded bg-muted" />
      <div className="mb-8 h-4 w-1/4 animate-pulse rounded bg-muted" />
      <div className="space-y-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-1/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
