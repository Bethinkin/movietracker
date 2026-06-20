import { useEffect } from 'react'
import { Eye, Film, Pin, Star, Trash2 } from 'lucide-react'
import { Modal } from './Modal'
import { StarRating } from './StarRating'
import { MovieExtrasSections } from './MovieExtrasSections'
import { backdropUrl, posterUrl } from '../lib/tmdb'
import { useMovieExtras } from '../hooks/useMovieExtras'
import { useMovieStore } from '../lib/storage'
import { useListStore } from '../lib/lists'
import { useProfileStore } from '../lib/profile'
import type { SavedMovie } from '../lib/types'

interface Props {
  movie: SavedMovie | null
  onClose: () => void
  onCastClick?: (name: string) => void
}

export function MovieDetailDialog({ movie, onClose, onCastClick }: Props) {
  const setStatus = useMovieStore((s) => s.setStatus)
  const setRating = useMovieStore((s) => s.setRating)
  const setNotes = useMovieStore((s) => s.setNotes)
  const setPinned = useMovieStore((s) => s.setPinned)
  const setRuntime = useMovieStore((s) => s.setRuntime)
  const removeMovie = useMovieStore((s) => s.removeMovie)
  const lists = useListStore((s) => s.lists)
  const addToList = useListStore((s) => s.addToList)
  const removeFromList = useListStore((s) => s.removeFromList)
  const region = useProfileStore((s) => s.profile?.country) || 'US'

  const extras = useMovieExtras(movie?.id ?? null, region)

  // Backfill runtime for stats once we have it.
  useEffect(() => {
    if (movie && extras?.runtime && movie.runtime == null) {
      setRuntime(movie.id, extras.runtime)
    }
  }, [movie, extras?.runtime, setRuntime])

  if (!movie) return null

  const poster = posterUrl(movie.posterPath, 'w342')
  const backdrop = backdropUrl(movie.backdropPath, 'w780')

  const handleRemove = () => {
    removeMovie(movie.id)
    onClose()
  }

  return (
    <Modal open={!!movie} onClose={onClose} size="max-w-3xl">
      {/* Backdrop header */}
      {backdrop && (
        <div className="relative -mx-6 -mt-6 mb-4 h-40 overflow-hidden rounded-t-2xl">
          <img src={backdrop} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--glass))] to-transparent" />
        </div>
      )}

      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="mx-auto h-48 w-32 shrink-0 overflow-hidden rounded-lg bg-bg-elevated sm:mx-0">
          {poster ? (
            <img src={poster} alt={movie.title} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-text-muted">
              <Film size={28} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-light tracking-wide">{movie.title}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {movie.releaseYear || '—'}
            {movie.tmdbRating > 0 && ` · TMDB ★ ${movie.tmdbRating.toFixed(1)}`}
          </p>

          {movie.genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-panel-border px-2.5 py-0.5 text-xs text-text-muted"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {movie.overview && (
            <p className="mt-3 text-sm leading-relaxed text-text-muted">{movie.overview}</p>
          )}
        </div>
      </div>

      {/* Status toggle */}
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setStatus(movie.id, 'want')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${
            movie.status === 'want'
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-panel-border hover:border-accent/60'
          }`}
        >
          <Film size={16} /> Want to see
        </button>
        <button
          type="button"
          onClick={() => setStatus(movie.id, 'seen')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${
            movie.status === 'seen'
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-panel-border hover:border-accent/60'
          }`}
        >
          <Eye size={16} /> Seen it
        </button>
      </div>

      {/* Seen-only: rating + notes */}
      {movie.status === 'seen' && (
        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Star size={15} className="text-accent" /> Your rating
            </p>
            <StarRating value={movie.userRating ?? 0} onChange={(r) => setRating(movie.id, r)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              value={movie.notes ?? ''}
              onChange={(e) => setNotes(movie.id, e.target.value)}
              rows={3}
              placeholder="What did you think?"
              className="w-full resize-none rounded-xl border border-panel-border bg-bg-elevated/60 p-3 text-sm text-text outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
        </div>
      )}

      {lists.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Add to list</p>
          <div className="flex flex-wrap gap-1.5">
            {lists.map((l) => {
              const inList = l.movieIds.includes(movie.id)
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() =>
                    inList ? removeFromList(l.id, movie.id) : addToList(l.id, movie.id)
                  }
                  aria-pressed={inList}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    inList
                      ? 'border-accent bg-accent/15 text-accent'
                      : 'border-panel-border text-text-muted hover:border-accent/60 hover:text-text'
                  }`}
                >
                  {l.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <MovieExtrasSections
        extras={extras}
        region={region}
        title={movie.title}
        onCastClick={onCastClick}
      />

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPinned(movie.id, !movie.pinned)}
          aria-pressed={!!movie.pinned}
          className={`flex items-center gap-2 text-sm transition ${
            movie.pinned ? 'text-accent' : 'text-text-muted hover:text-accent'
          }`}
        >
          <Pin size={15} className={movie.pinned ? 'fill-accent' : ''} />
          {movie.pinned ? 'Pinned to background' : 'Pin to background'}
        </button>
        <button
          type="button"
          onClick={handleRemove}
          className="flex items-center gap-2 text-sm text-text-muted transition hover:text-red-400"
        >
          <Trash2 size={15} /> Remove
        </button>
      </div>
    </Modal>
  )
}
