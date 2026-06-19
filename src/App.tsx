import { useEffect, useMemo, useState } from 'react'
import { Film, Search, SlidersHorizontal, X } from 'lucide-react'
import { Hero } from './components/Hero'
import { SearchDialog } from './components/SearchDialog'
import { MovieGrid } from './components/MovieGrid'
import { MovieDetailDialog } from './components/MovieDetailDialog'
import { LibraryTabs, type Filter } from './components/LibraryTabs'
import { FilterBar } from './components/FilterBar'
import {
  DEFAULT_FILTERS,
  countActiveFilters,
  decadeOf,
  type ActiveFilters,
} from './lib/filters'
import { AuthDialog } from './components/AuthDialog'
import { useTheme } from './hooks/useTheme'
import { useMovieStore } from './lib/storage'
import { supabase } from './lib/supabase'
import type { SavedMovie } from './lib/types'
import type { User } from '@supabase/supabase-js'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const movies = useMovieStore((s) => s.movies)
  const loadMovies = useMovieStore((s) => s.loadMovies)
  const clearMovies = useMovieStore((s) => s.clearMovies)

  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
      })
      .catch(() => {
        // Supabase unavailable or env vars missing — show auth screen anyway
      })
      .finally(() => {
        setAuthReady(true)
      })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      if (nextUser) {
        loadMovies()
      } else {
        clearMovies()
      }
    })
    return () => subscription.unsubscribe()
  }, [loadMovies, clearMovies])

  // Load movies on first mount if already logged in
  useEffect(() => {
    if (authReady && user) loadMovies()
  }, [authReady]) // eslint-disable-line react-hooks/exhaustive-deps

  const [searchOpen, setSearchOpen] = useState(false)
  const [selected, setSelected] = useState<SavedMovie | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [heroIndex, setHeroIndex] = useState(0)
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(DEFAULT_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [librarySearch, setLibrarySearch] = useState('')

  // Keep the open detail dialog in sync with the store so edits reflect live.
  const selectedMovie = selected ? movies.find((m) => m.id === selected.id) ?? null : null

  const featured = useMemo(() => movies.filter((m) => m.backdropPath).slice(0, 8), [movies])
  const safeHeroIndex = featured.length ? heroIndex % featured.length : 0

  const counts: Record<Filter, number> = {
    all: movies.length,
    want: movies.filter((m) => m.status === 'want').length,
    seen: movies.filter((m) => m.status === 'seen').length,
  }

  // Derive available filter options from the full library (not just visible).
  const availableGenres = useMemo(
    () => [...new Set(movies.flatMap((m) => m.genres))].sort(),
    [movies],
  )
  const availableDecades = useMemo(
    () =>
      [...new Set(movies.map((m) => decadeOf(m.releaseYear)).filter(Boolean))]
        .sort()
        .reverse(),
    [movies],
  )

  const visible = useMemo(() => {
    let result = filter === 'all' ? movies : movies.filter((m) => m.status === filter)

    const q = librarySearch.trim().toLowerCase()
    if (q)
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q)),
      )

    if (activeFilters.genres.length > 0)
      result = result.filter((m) => activeFilters.genres.some((g) => m.genres.includes(g)))

    if (activeFilters.decades.length > 0)
      result = result.filter((m) => activeFilters.decades.includes(decadeOf(m.releaseYear)))

    if (activeFilters.minRating > 0)
      result = result.filter((m) => m.tmdbRating >= activeFilters.minRating)

    switch (activeFilters.sort) {
      case 'year-desc':
        result = [...result].sort((a, b) => b.releaseYear.localeCompare(a.releaseYear))
        break
      case 'year-asc':
        result = [...result].sort((a, b) => a.releaseYear.localeCompare(b.releaseYear))
        break
      case 'title':
        result = [...result].sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'rating':
        result = [...result].sort((a, b) => b.tmdbRating - a.tmdbRating)
        break
      default:
        result = [...result].sort(
          (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
        )
    }

    return result
  }, [movies, filter, activeFilters, librarySearch])

  const activeFilterCount = countActiveFilters(activeFilters)

  if (!authReady) return null
  if (!user) return <AuthDialog />

  const signOut = () => supabase.auth.signOut()

  return (
    <div className="min-h-screen">
      <Hero
        featured={featured}
        index={safeHeroIndex}
        onPrev={() => setHeroIndex((i) => (i - 1 + featured.length) % featured.length)}
        onNext={() => setHeroIndex((i) => (i + 1) % featured.length)}
        onAddClick={() => setSearchOpen(true)}
        onFeaturedClick={(m) => setSelected(m)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignOut={signOut}
      />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-light tracking-wide">My Library</h2>
          <div className="flex flex-wrap items-center gap-3">
            <LibraryTabs active={filter} onChange={setFilter} counts={counts} />
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm text-accent-fg transition hover:opacity-90"
              >
                <Search size={16} /> Add movie
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  filtersOpen || activeFilterCount > 0
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-panel-border text-text-muted hover:text-text'
                }`}
              >
                <SlidersHorizontal size={15} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-accent-fg">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
            placeholder="Search your library by title or genre…"
            className="w-full rounded-full border border-panel-border bg-bg-elevated/60 py-2 pl-9 pr-9 text-sm text-text outline-none transition focus:border-accent"
          />
          {librarySearch && (
            <button
              type="button"
              onClick={() => setLibrarySearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-text-muted transition hover:text-text"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {filtersOpen && (
          <div className="mb-8">
            <FilterBar
              availableGenres={availableGenres}
              availableDecades={availableDecades}
              filters={activeFilters}
              onChange={setActiveFilters}
            />
          </div>
        )}

        {visible.length > 0 ? (
          <MovieGrid movies={visible} onSelect={setSelected} />
        ) : (
          <EmptyState isFiltered={movies.length > 0} onAdd={() => setSearchOpen(true)} />
        )}
      </main>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MovieDetailDialog movie={selectedMovie} onClose={() => setSelected(null)} />
    </div>
  )
}

function EmptyState({ isFiltered, onAdd }: { isFiltered: boolean; onAdd: () => void }) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-20 text-center">
      <Film size={40} className="mb-4 text-accent" />
      <p className="text-lg font-light">
        {isFiltered ? 'Nothing here yet' : 'Your library is empty'}
      </p>
      <p className="mt-1 max-w-sm text-sm text-text-muted">
        {isFiltered
          ? 'No movies match this filter. Add more or switch tabs.'
          : 'Search for a movie to add it to your “want to see” list or mark it as seen.'}
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-6 rounded-full bg-accent px-5 py-2.5 text-sm text-accent-fg transition hover:opacity-90"
      >
        Add your first movie
      </button>
    </div>
  )
}
