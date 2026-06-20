import { Check, Eye, Film, Plus } from 'lucide-react'
import { Modal } from './Modal'
import { MovieExtrasSections } from './MovieExtrasSections'
import { backdropUrl, genreNames, posterUrl, yearOf } from '../lib/tmdb'
import { useMovieExtras } from '../hooks/useMovieExtras'
import { useMovieStore } from '../lib/storage'
import { useProfileStore } from '../lib/profile'
import type { TmdbMovie } from '../lib/types'

interface Props {
  movie: TmdbMovie | null
  onClose: () => void
  onCastClick?: (name: string) => void
}

/** Read-only preview of a TMDB movie not yet in the library, with add buttons. */
export function TmdbDetailDialog({ movie, onClose, onCastClick }: Props) {
  const addMovie = useMovieStore((s) => s.addMovie)
  const saved = useMovieStore((s) => s.movies)
  const region = useProfileStore((s) => s.profile?.country) || 'US'

  const extras = useMovieExtras(movie?.id ?? null, region)

  if (!movie) return null

  const poster = posterUrl(movie.poster_path, 'w342')
  const backdrop = backdropUrl(movie.backdrop_path, 'w780')
  const genres = genreNames(movie)
  const isSaved = saved.some((m) => m.id === movie.id)

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

      {/* Add to library */}
      {isSaved ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-text-muted">
          <Check size={16} className="text-accent" /> In your library
        </p>
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

      <MovieExtrasSections
        extras={extras}
        region={region}
        title={movie.title}
        onCastClick={onCastClick}
      />
    </Modal>
  )
}
