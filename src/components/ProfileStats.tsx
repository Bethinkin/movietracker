import { useMemo } from 'react'
import { useMovieStore } from '../lib/storage'
import { useListStore } from '../lib/lists'
import { decadeOf } from '../lib/filters'

function topEntries(counts: Record<string, number>, n: number): [string, number][] {
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n)
}

export function ProfileStats() {
  const movies = useMovieStore((s) => s.movies)
  const lists = useListStore((s) => s.lists)

  const stats = useMemo(() => {
    const seen = movies.filter((m) => m.status === 'seen')
    const want = movies.filter((m) => m.status === 'want')

    const genreCounts: Record<string, number> = {}
    for (const m of movies) for (const g of m.genres) genreCounts[g] = (genreCounts[g] ?? 0) + 1

    const decadeCounts: Record<string, number> = {}
    for (const m of movies) {
      const d = decadeOf(m.releaseYear)
      if (d) decadeCounts[d] = (decadeCounts[d] ?? 0) + 1
    }

    const ratings = [1, 2, 3, 4, 5].map(
      (r) => seen.filter((m) => m.userRating === r).length,
    )
    const rated = seen.filter((m) => m.userRating)
    const avgRating = rated.length
      ? rated.reduce((s, m) => s + (m.userRating ?? 0), 0) / rated.length
      : 0

    return {
      total: movies.length,
      want: want.length,
      seen: seen.length,
      topGenres: topEntries(genreCounts, 6),
      topDecades: topEntries(decadeCounts, 6).sort((a, b) => b[0].localeCompare(a[0])),
      ratings,
      avgRating,
      pinned: movies.filter((m) => m.pinned).length,
      lists: lists.length,
    }
  }, [movies, lists])

  if (movies.length === 0) {
    return <p className="py-8 text-center text-sm text-text-muted">No movies yet — add some to see your stats.</p>
  }

  const maxGenre = stats.topGenres[0]?.[1] ?? 1
  const maxRating = Math.max(...stats.ratings, 1)

  return (
    <div className="space-y-6">
      {/* Headline tiles */}
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-panel-border bg-panel-border">
        <Tile label="Movies" value={String(stats.total)} />
        <Tile label="Seen" value={String(stats.seen)} />
        <Tile label="Want" value={String(stats.want)} />
      </div>

      {/* Top genres */}
      {stats.topGenres.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">Top genres</p>
          <div className="space-y-1.5">
            {stats.topGenres.map(([genre, count]) => (
              <div key={genre} className="flex items-center gap-2">
                <span className="w-28 shrink-0 truncate text-xs">{genre}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-bg-elevated">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${(count / maxGenre) * 100}%` }}
                  />
                </span>
                <span className="w-6 shrink-0 text-right text-xs text-text-muted">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your ratings */}
      {stats.avgRating > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
            Your ratings <span className="font-normal normal-case">· avg {stats.avgRating.toFixed(1)}★</span>
          </p>
          <div className="flex items-end gap-2">
            {stats.ratings.map((count, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className="w-full rounded-t bg-accent/70"
                  style={{ height: `${(count / maxRating) * 60 + 2}px` }}
                />
                <span className="text-[10px] text-text-muted">{i + 1}★</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decades */}
      {stats.topDecades.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">By decade</p>
          <div className="flex flex-wrap gap-1.5">
            {stats.topDecades.map(([decade, count]) => (
              <span
                key={decade}
                className="rounded-full border border-panel-border px-2.5 py-1 text-xs text-text-muted"
              >
                {decade} <span className="text-text">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-text-muted">
        {stats.lists} {stats.lists === 1 ? 'list' : 'lists'} · {stats.pinned} pinned
      </p>
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-panel px-3 py-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-text-muted">{label}</p>
      <p className="mt-1 truncate text-lg font-medium text-text">{value}</p>
    </div>
  )
}
