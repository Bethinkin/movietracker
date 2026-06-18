import { useMemo, useState } from 'react'
import { Film, Search } from 'lucide-react'
import { Hero } from './components/Hero'
import { SearchDialog } from './components/SearchDialog'
import { MovieGrid } from './components/MovieGrid'
import { MovieDetailDialog } from './components/MovieDetailDialog'
import { LibraryTabs, type Filter } from './components/LibraryTabs'
import { useTheme } from './hooks/useTheme'
import { useMovieStore } from './lib/storage'
import type { SavedMovie } from './lib/types'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const movies = useMovieStore((s) => s.movies)

  const [searchOpen, setSearchOpen] = useState(false)
  const [selected, setSelected] = useState<SavedMovie | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [heroIndex, setHeroIndex] = useState(0)

  // Keep the open detail dialog in sync with the store so edits reflect live.
  const selectedMovie = selected ? movies.find((m) => m.id === selected.id) ?? null : null

  const featured = useMemo(() => movies.filter((m) => m.backdropPath).slice(0, 8), [movies])
  const safeHeroIndex = featured.length ? heroIndex % featured.length : 0

  const counts: Record<Filter, number> = {
    all: movies.length,
    want: movies.filter((m) => m.status === 'want').length,
    seen: movies.filter((m) => m.status === 'seen').length,
  }

  const visible = useMemo(() => {
    if (filter === 'all') return movies
    return movies.filter((m) => m.status === filter)
  }, [movies, filter])

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
      />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
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
