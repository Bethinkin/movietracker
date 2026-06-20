import { useState } from 'react'
import { Eye, Film, Repeat, Star } from 'lucide-react'
import { posterUrl } from '../lib/tmdb'
import type { SavedMovie } from '../lib/types'

interface Props {
  movie: SavedMovie
  onClick: () => void
}

export function MovieCard({ movie, onClick }: Props) {
  const poster = posterUrl(movie.posterPath, 'w342')
  const [loaded, setLoaded] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-xl border border-panel-border bg-bg-elevated text-left transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/10"
    >
      <div
        className={`aspect-[2/3] w-full overflow-hidden bg-bg-elevated ${
          poster && !loaded ? 'animate-pulse bg-panel-border/30' : ''
        }`}
      >
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-text-muted">
            <Film size={32} />
          </div>
        )}
      </div>

      {/* Status badge */}
      <span
        className={`absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium backdrop-blur ${
          movie.status === 'seen'
            ? 'bg-accent/85 text-accent-fg'
            : 'bg-black/55 text-white'
        }`}
      >
        {movie.status === 'seen' ? <Eye size={12} /> : <Film size={12} />}
        {movie.status === 'seen' ? 'Seen' : 'Want'}
      </span>

      {/* Rewatch badge */}
      {movie.status === 'seen' && movie.rewatch && (
        <span
          className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/55 text-white backdrop-blur"
          title="On your rewatch list"
        >
          <Repeat size={12} />
        </span>
      )}

      <div className="p-3">
        <p className="truncate text-sm font-medium">{movie.title}</p>
        <div className="mt-1 flex items-center justify-between text-xs text-text-muted">
          <span>{movie.releaseYear || '—'}</span>
          {movie.status === 'seen' && movie.userRating ? (
            <span className="flex items-center gap-0.5 text-accent">
              <Star size={12} className="fill-accent" /> {movie.userRating}
            </span>
          ) : movie.tmdbRating > 0 ? (
            <span className="flex items-center gap-0.5">
              <Star size={12} /> {movie.tmdbRating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  )
}
