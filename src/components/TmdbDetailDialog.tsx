import { Check, Eye, Film, Plus, Repeat, Star } from 'lucide-react'
import { Modal } from './Modal'
import { MovieExtrasSections } from './MovieExtrasSections'
import { FranchiseSection } from './FranchiseSection'
import { StarRating } from './StarRating'
import { backdropUrl, genreNames, posterUrl, yearOf } from '../lib/tmdb'
import { useMovieExtras } from '../hooks/useMovieExtras'
import { useMovieStore } from '../lib/storage'
import { useProfileStore } from '../lib/profile'
import type { TmdbMovie } from '../lib/types'

interface Props {
  movie: TmdbMovie | null
  onClose: () => void
  onCastClick?: (name: string) => void
  onOpenMovie?: (movie: TmdbMovie) => void
}

/** Preview of a TMDB movie; if it's in the library, exposes status/rating/rewatch. */
export function TmdbDetailDialog({ movie, onClose, onCastClick, onOpenMovie }: Props) {
  const addMovie = useMovieStore((s) => s.addMovie)
  const setStatus = useMovieStore((s) => s.setStatus)
  const setRating = useMovieStore((s) => s.setRating)
  const setRewatch = useMovieStore((s) => s.setRewatch)
  const saved = useMovieStore((s) => s.movies)
  const region = useProfileStore((s) => s.profile?.country) || 'US'

  const extras = useMovieExtras(movie?.id ?? null, region)

  if (!movie) return null

  const poster = posterUrl(movie.poster_path, 'w342')
  const backdrop = backdropUrl(movie.backdrop_path, 'w780')
  const genres = genreNames(movie)
  const savedMovie = saved.find((m) => m.id === movie.id)

  return (
    <Modal open={!!movie} onClose={onClose} size="max-w-3xl">
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
            {yearOf(movie.release_date) || '—'}
            {movie.vote_average > 0 && ` · TMDB ★ ${movie.vote_average.toFixed(1)}`}
          </p>

          {genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {genres.map((g) => (
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

      {/* Library controls */}
      {savedMovie ? (
        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatus(movie.id, 'want')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${
                savedMovie.status === 'want'
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
                savedMovie.status === 'seen'
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-panel-border hover:border-accent/60'
              }`}
            >
              <Eye size={16} /> Seen it
            </button>
          </div>

          {savedMovie.status === 'seen' && (
            <>
              <button
                type="button"
                onClick={() => setRewatch(movie.id, !savedMovie.rewatch)}
                aria-pressed={!!savedMovie.rewatch}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${
                  savedMovie.rewatch
                    ? 'border-accent bg-accent/15 text-accent'
                    : 'border-panel-border text-text-muted hover:border-accent/60 hover:text-text'
                }`}
              >
                <Repeat size={16} />
                {savedMovie.rewatch ? 'On your rewatch list' : 'Want to rewatch'}
              </button>
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Star size={15} className="text-accent" /> Your rating
                </p>
                <StarRating
                  value={savedMovie.userRating ?? 0}
                  onChange={(r) => setRating(movie.id, r)}
                />
              </div>
            </>
          )}

          <p className="flex items-center gap-2 text-xs text-text-muted">
            <Check size={14} className="text-accent" /> In your library
          </p>
        </div>
      ) : (
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => addMovie(movie, 'want')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-panel-border px-4 py-2.5 text-sm transition hover:border-accent hover:text-accent"
          >
            <Plus size={16} /> Want to see
          </button>
          <button
            type="button"
            onClick={() => addMovie(movie, 'seen')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm text-accent-fg transition hover:opacity-90"
          >
            <Eye size={16} /> Seen it
          </button>
        </div>
      )}

      {extras?.collection && onOpenMovie && (
        <FranchiseSection collectionId={extras.collection.id} onOpenMovie={onOpenMovie} />
      )}

      <MovieExtrasSections
        extras={extras}
        region={region}
        title={movie.title}
        onCastClick={onCastClick}
      />
    </Modal>
  )
}
