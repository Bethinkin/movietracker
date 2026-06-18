import { useEffect, useMemo, useState } from 'react'
import { Film, Search } from 'lucide-react'
import { Hero } from './components/Hero'
import { SearchDialog } from './components/SearchDialog'
import { MovieGrid } from './components/MovieGrid'
import { MovieDetailDialog } from './components/MovieDetailDialog'
import { LibraryTabs, type Filter } from './components/LibraryTabs'
import { FilterBar, type ActiveFilters } from './components/FilterBar'
import { AuthDialog } from './components/AuthDialog'
import { useTheme } from './hooks/useTheme'
import { useMovieStore } from './lib/storage'
import { supabase } from './lib/supabase'
import type { SavedMovie } from './lib/types'
import type { User } from '@supabase/supabase-js'

const DEFAULT_FILTERS: ActiveFilters = { genres: [], years: [], minRating: 0, sort: 'added' }

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const movies = useMovieStore((s) => s.movies)
  const loadMovies = useMovieStore((s) => s.loadMovies)
  const clearMovies = useMovieStore((s) => s.clearMovies)

  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
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
  const availableYears = useMemo(
    () => [...new Set(movies.map((m) => m.releaseYear).filter(Boolean))].sort().reverse(),
    [movies],
  )

  const visible = useMemo(() => {
    let result = filter === 'all' ? movies : movies.filter((m) => m.status === filter)

    if (activeFilters.genres.length > 0)
      result = result.filter((m) => activeFilters.genres.some((g) => m.genres.includes(g)))

    if (activeFilters.years.length > 0)
      result = result.filter((m) => activeFilters.years.includes(m.releaseYear))

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
  }, [movies, filter, activeFilters])

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
          <div className="flex items-center gap-3">
            <LibraryTabs active={filter} onChange={setFilter} counts={counts} />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm text-accent-fg transition hover:opacity-90"
            >
              <Search size={16} /> Add movie
            </button>
          </div>
        </div>

        <div className="mb-8">
          <FilterBar
            availableGenres={availableGenres}
            availableYears={availableYears}
            filters={activeFilters}
            onChange={setActiveFilters}
          />
        </div>

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
