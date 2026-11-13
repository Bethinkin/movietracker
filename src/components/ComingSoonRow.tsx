import { CalendarClock, Film } from 'lucide-react'
import { posterUrl } from '../lib/tmdb'
import type { SavedMovie } from '../lib/types'

export interface UpcomingItem {
  movie: SavedMovie
  date: string // ISO yyyy-mm-dd
}

function countdownLabel(iso: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000)
  if (days <= 0) return 'Out now'
  if (days === 1) return 'Tomorrow'
  if (days <= 30) return `In ${days} days`
  return target.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Watchlist titles whose release date is still in the future. */
export function ComingSoonRow({
  items,
  onSelect,
}: {
  items: UpcomingItem[]
  onSelect: (movie: SavedMovie) => void
}) {
  if (items.length === 0) return null

  return (
    <section className="mb-10">
      <h2 className="mb-3 flex items-center gap-2 text-2xl font-light tracking-wide">
        <CalendarClock size={20} className="text-accent" /> Coming soon
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map(({ movie, date }) => {
          const poster = posterUrl(movie.posterPath, 'w342')
          return (
            <button
              key={movie.id}
              type="button"
              onClick={() => onSelect(movie)}
              className="w-32 shrink-0 text-left"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-panel-border bg-bg-elevated">
                {poster ? (
                  <img src={poster} alt={movie.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-text-muted">
                    <Film size={24} />
                  </div>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-[11px] font-medium text-white">
                  {countdownLabel(date)}
                </span>
              </div>
              <p className="mt-1 truncate text-xs font-medium">{movie.title}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
