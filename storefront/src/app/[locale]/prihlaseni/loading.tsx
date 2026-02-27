export default function LoginLoading() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-lg border border-border bg-white p-6 space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto h-7 w-1/3 animate-pulse rounded bg-muted" />
          <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
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
