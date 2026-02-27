export default function FaqLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 h-8 w-1/4 animate-pulse rounded bg-muted" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-white p-5">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
