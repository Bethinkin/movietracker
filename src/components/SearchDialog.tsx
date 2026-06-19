import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Eye, Loader2, Plus, Search } from 'lucide-react'
import { Modal } from './Modal'
import {
  browseMovies,
  hasApiKey,
  posterUrl,
  searchMovies,
  yearOf,
  type BrowseCategory,
} from '../lib/tmdb'
import { useMovieStore } from '../lib/storage'
import type { TmdbMovie } from '../lib/types'

interface Props {
  open: boolean
  onClose: () => void
}

type Mode = 'search' | BrowseCategory

const TABS: { id: Mode; label: string }[] = [
  { id: 'search', label: 'Search' },
  { id: 'popular', label: 'Popular' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'now_playing', label: 'In Theaters' },
  { id: 'top_rated', label: 'Top Rated' },
]

export function SearchDialog({ open, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TmdbMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addMovie = useMovieStore((s) => s.addMovie)
  const movies = useMovieStore((s) => s.movies)
  const savedIds = useMemo(() => new Set(movies.map((m) => m.id)), [movies])

  const keyMissing = !hasApiKey()

  // Reset to the search tab each time the dialog is opened.
  useEffect(() => {
    if (open) {
      setMode('search')
      setQuery('')
      setResults([])
      setError(null)
    }
  }, [open])

  useEffect(() => {
    if (open && mode === 'search') setTimeout(() => inputRef.current?.focus(), 50)
  }, [open, mode])

  // Debounced search (search tab only).
  useEffect(() => {
    if (!open || keyMissing || mode !== 'search') return
    const q = query.trim()
    if (!q) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const handle = setTimeout(async () => {
      try {
        setResults(await searchMovies(q))
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(handle)
  }, [query, open, keyMissing, mode])

  // Fetch the selected browse category.
  useEffect(() => {
    if (!open || keyMissing || mode === 'search') return
    let cancelled = false
    setLoading(true)
    setError(null)
    browseMovies(mode)
      .then((res) => {
        if (!cancelled) setResults(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load movies')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mode, open, keyMissing])

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="mb-4 text-xl font-light tracking-wide">Add a movie</h2>

      {keyMissing ? (
        <div className="rounded-xl border border-panel-border bg-bg-elevated/50 p-4 text-sm text-text-muted">
          <p className="mb-2 font-medium text-text">No TMDB API key found.</p>
          <p>
            Add a free key to your <code className="text-accent">.env</code> file as{' '}
            <code className="text-accent">VITE_TMDB_API_KEY</code> and restart the dev server.
            Get one at{' '}
            <a
              className="text-accent underline"
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noreferrer"
            >
              themoviedb.org
            </a>
            .
          </p>
        </div>
      ) : (
        <>
          {/* Browse tabs */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  mode === tab.id
                    ? 'border-accent bg-accent/15 text-accent'
                    : 'border-panel-border text-text-muted hover:border-accent/60 hover:text-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {mode === 'search' && (
            <div className="relative mb-4">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title…"
                className="w-full rounded-xl border border-panel-border bg-bg-elevated/60 py-3 pl-10 pr-10 text-text outline-none transition focus:border-accent"
              />
              {loading && (
                <Loader2
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-accent"
                />
              )}
            </div>
          )}

          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

          <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
            {mode !== 'search' && loading && (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-muted">
                <Loader2 size={18} className="animate-spin text-accent" /> Loading…
              </div>
            )}

            {results.map((movie) => {
              const saved = savedIds.has(movie.id)
              const poster = posterUrl(movie.poster_path, 'w342')
              return (
                <div
                  key={movie.id}
                  className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition hover:border-panel-border hover:bg-bg-elevated/50"
                >
                  <div className="h-20 w-14 shrink-0 overflow-hidden rounded-md bg-bg-elevated">
                    {poster ? (
                      <img src={poster} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xs text-text-muted">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{movie.title}</p>
                    <p className="text-sm text-text-muted">
                      {yearOf(movie.release_date) || '—'}
                      {movie.vote_average > 0 && ` · ★ ${movie.vote_average.toFixed(1)}`}
                    </p>
                  </div>
                  {saved ? (
                    <span className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-text-muted">
                      <Check size={16} /> Added
                    </span>
                  ) : (
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => addMovie(movie, 'want')}
                        className="flex items-center gap-1 rounded-lg border border-panel-border px-3 py-2 text-sm transition hover:border-accent hover:text-accent"
                      >
                        <Plus size={15} /> Want
                      </button>
                      <button
                        type="button"
                        onClick={() => addMovie(movie, 'seen')}
                        className="flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm text-accent-fg transition hover:opacity-90"
                      >
                        <Eye size={15} /> Seen
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {!loading && mode === 'search' && query.trim() && results.length === 0 && !error && (
              <p className="py-6 text-center text-sm text-text-muted">No results found.</p>
            )}
            {!loading && mode !== 'search' && results.length === 0 && !error && (
              <p className="py-6 text-center text-sm text-text-muted">Nothing to show right now.</p>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}
