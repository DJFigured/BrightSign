export default function ContactLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-2 h-8 w-1/4 animate-pulse rounded bg-muted" />
      <div className="mb-8 h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 space-y-4">
          <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
              <div className="h-10 animate-pulse rounded bg-muted" />
            </div>
          ))}
          <div className="h-10 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
