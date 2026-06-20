import { useEffect, useState } from 'react'
import { Check, Film } from 'lucide-react'
import { getCollection, posterUrl, yearOf } from '../lib/tmdb'
import { useMovieStore } from '../lib/storage'
import type { TmdbMovie } from '../lib/types'

interface Props {
  collectionId: number
  onOpenMovie: (movie: TmdbMovie) => void
}

/** Shows the movie's franchise: all entries with in-library/seen marks. */
export function FranchiseSection({ collectionId, onOpenMovie }: Props) {
  const [collection, setCollection] = useState<{ name: string; parts: TmdbMovie[] } | null>(null)
  const movies = useMovieStore((s) => s.movies)

  useEffect(() => {
    let cancelled = false
    setCollection(null)
    getCollection(collectionId)
      .then((c) => { if (!cancelled) setCollection({ name: c.name, parts: c.parts }) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [collectionId])

  if (!collection) return null

  const byId = new Map(movies.map((m) => [m.id, m]))
  const parts = [...collection.parts]
    .filter((p) => p.title)
    .sort((a, b) => (a.release_date ?? '').localeCompare(b.release_date ?? ''))

  if (parts.length <= 1) return null
  const owned = parts.filter((p) => byId.has(p.id)).length

  return (
    <div className="mt-6">
      <p className="mb-2 text-sm font-medium">
        {collection.name}{' '}
        <span className="font-normal text-text-muted">· {owned}/{parts.length} in library</span>
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {parts.map((p) => {
          const saved = byId.get(p.id)
          const poster = posterUrl(p.poster_path, 'w342')
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onOpenMovie(p)}
              className="w-24 shrink-0 text-left"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-panel-border bg-bg-elevated">
                {poster ? (
                  <img src={poster} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-text-muted">
                    <Film size={20} />
                  </div>
                )}
                {saved && (
                  <span
                    className={`absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full ${
                      saved.status === 'seen' ? 'bg-accent text-accent-fg' : 'bg-black/60 text-white'
                    }`}
                    title={saved.status === 'seen' ? 'Seen' : 'In library'}
                  >
                    <Check size={11} />
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-[11px] font-medium">{p.title}</p>
              <p className="text-[10px] text-text-muted">{yearOf(p.release_date) || '—'}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
