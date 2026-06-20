import { useMemo } from 'react'
import { Check, Eye, Film, Plus } from 'lucide-react'
import { posterUrl, yearOf } from '../lib/tmdb'
import { useMovieStore } from '../lib/storage'
import type { TmdbMovie } from '../lib/types'

/** Horizontal strip of TMDB recommendations with quick Want/Seen add. */
export function RecommendedRow({
  movies,
  onSelect,
}: {
  movies: TmdbMovie[]
  onSelect: (movie: TmdbMovie) => void
}) {
  const addMovie = useMovieStore((s) => s.addMovie)
  const saved = useMovieStore((s) => s.movies)
  const savedIds = useMemo(() => new Set(saved.map((m) => m.id)), [saved])

  if (movies.length === 0) return null

  return (
    <section className="mb-10">
      <h2 className="mb-3 text-2xl font-light tracking-wide">Recommended for you</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {movies.map((m) => {
          const poster = posterUrl(m.poster_path, 'w342')
          const isSaved = savedIds.has(m.id)
          return (
            <div key={m.id} className="w-32 shrink-0">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-panel-border bg-bg-elevated">
                {poster ? (
                  <img src={poster} alt={m.title} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-text-muted">
                    <Film size={24} />
                  </div>
                )}
                {/* Full-tile click target opens the preview */}
                <button
                  type="button"
                  onClick={() => onSelect(m)}
                  aria-label={`View details for ${m.title}`}
                  className="absolute inset-0 transition hover:bg-black/10"
                />
                {isSaved ? (
                  <span className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-fg">
                    <Check size={13} />
                  </span>
                ) : (
                  <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/75 to-transparent p-1.5">
                    <button
                      type="button"
                      onClick={() => addMovie(m, 'want')}
                      aria-label={`Add ${m.title} to Want to see`}
                      className="flex-1 rounded-md bg-white/20 py-1 text-white backdrop-blur transition hover:bg-white/30"
                    >
                      <Plus size={13} className="mx-auto" />
                    </button>
                    <button
                      type="button"
                      onClick={() => addMovie(m, 'seen')}
                      aria-label={`Mark ${m.title} as seen`}
                      className="flex-1 rounded-md bg-accent py-1 text-accent-fg transition hover:opacity-90"
                    >
                      <Eye size={13} className="mx-auto" />
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 truncate text-xs font-medium">{m.title}</p>
              <p className="text-[11px] text-text-muted">{yearOf(m.release_date) || '—'}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
