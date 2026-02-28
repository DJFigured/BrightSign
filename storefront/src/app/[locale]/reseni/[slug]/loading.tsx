export default function SolutionDetailLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="bg-gradient-to-br from-brand-primary-dark to-brand-primary py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded bg-white/20" />
          <div className="mx-auto mb-4 h-10 w-2/3 animate-pulse rounded bg-white/20" />
          <div className="mx-auto h-5 w-1/2 animate-pulse rounded bg-white/20" />
        </div>
      </section>

      {/* Description skeleton */}
      <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="space-y-3">
          <div className="h-5 w-full animate-pulse rounded bg-muted" />
          <div className="h-5 w-full animate-pulse rounded bg-muted" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </section>

      {/* Products skeleton */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8 h-7 w-1/3 animate-pulse rounded bg-muted" />
          <div className="grid gap-6 sm:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-2 h-5 w-10 animate-pulse rounded-full bg-muted" />
                <div className="mb-1 h-6 w-2/3 animate-pulse rounded bg-muted" />
                <div className="mb-4 h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
