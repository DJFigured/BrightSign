export default function SolutionsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 h-9 w-1/3 animate-pulse rounded bg-muted" />
        <div className="mx-auto h-5 w-1/2 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-8 shadow-sm">
            <div className="mb-4 h-10 w-10 animate-pulse rounded bg-muted" />
            <div className="mb-2 h-6 w-2/3 animate-pulse rounded bg-muted" />
            <div className="mb-4 h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
