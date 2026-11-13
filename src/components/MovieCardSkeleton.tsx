/** Placeholder tile shown while a movie card is off-screen or loading. */
export function MovieCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-panel-border bg-bg-elevated">
      <div className="aspect-[2/3] w-full animate-pulse bg-panel-border/40" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 animate-pulse rounded bg-panel-border/40" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-panel-border/30" />
      </div>
    </div>
  )
}
