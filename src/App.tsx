import { useEffect, useMemo, useState } from 'react'
import { Film, Search, SlidersHorizontal, X } from 'lucide-react'
import { Hero, type HeroSlide } from './components/Hero'
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
import { ProfileDialog } from './components/ProfileDialog'
import { RecommendedRow } from './components/RecommendedRow'
import { ComingSoonRow, type UpcomingItem } from './components/ComingSoonRow'
import { TmdbDetailDialog } from './components/TmdbDetailDialog'
import { ListBar } from './components/ListBar'
import { useTheme } from './hooks/useTheme'
import { useMovieStore } from './lib/storage'
import { useProfileStore } from './lib/profile'
import { useListStore } from './lib/lists'
import { useProvidersStore } from './lib/providers'
import { supabase } from './lib/supabase'
import { browseMovies, getRecommendations, getMovieDetails } from './lib/tmdb'
import type { SavedMovie, TmdbMovie } from './lib/types'
import type { User } from '@supabase/supabase-js'

/** Fisher–Yates shuffle returning a new array. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const movies = useMovieStore((s) => s.movies)
  const loadMovies = useMovieStore((s) => s.loadMovies)
  const clearMovies = useMovieStore((s) => s.clearMovies)
  const loadProfile = useProfileStore((s) => s.loadProfile)
  const clearProfile = useProfileStore((s) => s.clearProfile)
  const updateProfile = useProfileStore((s) => s.updateProfile)
  const profile = useProfileStore((s) => s.profile)
  const avatarUrl = profile?.avatarUrl ?? null
  const lists = useListStore((s) => s.lists)
  const loadLists = useListStore((s) => s.loadLists)
  const clearLists = useListStore((s) => s.clearLists)
  const createList = useListStore((s) => s.createList)
  const deleteList = useListStore((s) => s.deleteList)
  const providersById = useProvidersStore((s) => s.byId)
  const ensureProviders = useProvidersStore((s) => s.ensure)

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
        loadProfile()
        loadLists()
      } else {
        clearMovies()
        clearProfile()
        clearLists()
      }
    })
    return () => subscription.unsubscribe()
  }, [loadMovies, clearMovies, loadProfile, clearProfile, loadLists, clearLists])

  // Load library + profile + lists on first mount if already logged in
  useEffect(() => {
    if (authReady && user) {
      loadMovies()
      loadProfile()
      loadLists()
    }
  }, [authReady]) // eslint-disable-line react-hooks/exhaustive-deps

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchInitialQuery, setSearchInitialQuery] = useState<string | undefined>(undefined)
  const [selected, setSelected] = useState<SavedMovie | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [heroIndex, setHeroIndex] = useState(0)
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(DEFAULT_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [librarySearch, setLibrarySearch] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [previewMovie, setPreviewMovie] = useState<TmdbMovie | null>(null)
  const [selectedListId, setSelectedListId] = useState<string | null>(null)

  // Keep the open detail dialog in sync with the store so edits reflect live.
  const selectedMovie = selected ? movies.find((m) => m.id === selected.id) ?? null : null

  const heroSource = profile?.heroSource ?? 'recent'
  const heroCount = profile?.heroCount ?? 5

  // Fetch popular TMDB backdrops only when that source is selected.
  const [tmdbBackdrops, setTmdbBackdrops] = useState<TmdbMovie[]>([])
  useEffect(() => {
    if (heroSource !== 'tmdb-random') return
    let cancelled = false
    browseMovies('popular')
      .then((res) => { if (!cancelled) setTmdbBackdrops(res) })
      .catch(() => { /* hero falls back to the gradient */ })
    return () => { cancelled = true }
  }, [heroSource])

  const heroSlides = useMemo<HeroSlide[]>(() => {
    const withBackdrop = movies.filter((m) => m.backdropPath)
    const toSlide = (m: SavedMovie): HeroSlide => ({
      key: `m-${m.id}`,
      title: m.title,
      backdropPath: m.backdropPath,
      movie: m,
    })
    switch (heroSource) {
      case 'collection-random':
        return shuffle(withBackdrop).slice(0, heroCount).map(toSlide)
      case 'pinned':
        return withBackdrop.filter((m) => m.pinned).slice(0, heroCount).map(toSlide)
      case 'tmdb-random':
        return shuffle(tmdbBackdrops.filter((m) => m.backdrop_path))
          .slice(0, heroCount)
          .map((m) => ({ key: `t-${m.id}`, title: m.title, backdropPath: m.backdrop_path }))
      case 'recent':
      default:
        return [...withBackdrop]
          .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
          .slice(0, heroCount)
          .map(toSlide)
    }
  }, [movies, heroSource, heroCount, tmdbBackdrops])

  const safeHeroIndex = heroSlides.length ? heroIndex % heroSlides.length : 0

  // --- Recommended for you (seeded by your higher-rated seen movies) ---
  // Pick from a quality pool but vary the seeds each load so recs refresh.
  const seedIds = useMemo(() => {
    const seen = movies.filter((m) => m.status === 'seen')
    if (seen.length === 0) return []
    const pool = [...seen]
      .sort((a, b) => (b.userRating ?? 0) - (a.userRating ?? 0) || b.tmdbRating - a.tmdbRating)
      .slice(0, 10)
    return shuffle(pool).slice(0, 3).map((m) => m.id)
  }, [movies])
  const [recommendedRaw, setRecommendedRaw] = useState<TmdbMovie[]>([])
  useEffect(() => {
    if (seedIds.length === 0) { setRecommendedRaw([]); return }
    let cancelled = false
    Promise.all(seedIds.map((id) => getRecommendations(id).catch(() => [] as TmdbMovie[])))
      .then((lists) => {
        if (cancelled) return
        const byId = new Map<number, TmdbMovie>()
        for (const list of lists)
          for (const m of list) if (m.poster_path && !byId.has(m.id)) byId.set(m.id, m)
        setRecommendedRaw(shuffle([...byId.values()]))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [seedIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
  const recommended = useMemo(() => {
    const inLib = new Set(movies.map((m) => m.id))
    const hidden = new Set(profile?.hiddenRecs ?? [])
    return recommendedRaw.filter((m) => !inLib.has(m.id) && !hidden.has(m.id)).slice(0, 20)
  }, [recommendedRaw, movies, profile?.hiddenRecs])

  // --- Coming soon (watchlist titles whose release date is in the future) ---
  const currentYear = new Date().getFullYear()
  const wantFutureIds = useMemo(
    () =>
      movies
        .filter((m) => m.status === 'want' && Number(m.releaseYear) >= currentYear)
        .map((m) => m.id),
    [movies, currentYear],
  )
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([])
  useEffect(() => {
    if (wantFutureIds.length === 0) { setUpcoming([]); return }
    let cancelled = false
    const byId = new Map(movies.map((m) => [m.id, m]))
    Promise.all(
      wantFutureIds.slice(0, 20).map((id) =>
        getMovieDetails(id)
          .then((d) => ({ movie: byId.get(id)!, date: d.release_date }))
          .catch(() => null),
      ),
    ).then((res) => {
      if (cancelled) return
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const items = res
        .filter((r): r is { movie: SavedMovie; date: string } => !!r && !!r.date)
        .filter((r) => new Date(r.date) >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
      setUpcoming(items)
    })
    return () => { cancelled = true }
  }, [wantFutureIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  const openSearch = () => { setSearchInitialQuery(undefined); setSearchOpen(true) }
  const openActorSearch = (name: string) => {
    setSelected(null)
    setSearchInitialQuery(name)
    setSearchOpen(true)
  }

  const counts: Record<Filter, number> = {
    all: movies.length,
    want: movies.filter((m) => m.status === 'want').length,
    seen: movies.filter((m) => m.status === 'seen').length,
    rewatch: movies.filter((m) => m.status === 'seen' && m.rewatch).length,
  }

  // Name shown in the top bar: full name → username → email local part.
  const userName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
    profile?.username ||
    (user?.email ? user.email.split('@')[0] : '')

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
    let result =
      filter === 'all'
        ? movies
        : filter === 'rewatch'
          ? movies.filter((m) => m.status === 'seen' && m.rewatch)
          : movies.filter((m) => m.status === filter)

    if (selectedListId) {
      const list = lists.find((l) => l.id === selectedListId)
      const ids = new Set(list?.movieIds ?? [])
      result = result.filter((m) => ids.has(m.id))
    }

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

    if (activeFilters.services.length > 0)
      result = result.filter((m) => {
        const provs = providersById[m.id]
        return provs ? provs.some((p) => activeFilters.services.includes(p)) : false
      })

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
  }, [movies, filter, activeFilters, librarySearch, selectedListId, lists, providersById])

  // Lazily fetch provider availability when filtering by streaming service.
  const region = profile?.country || 'US'
  useEffect(() => {
    if (activeFilters.services.length > 0) ensureProviders(movies.map((m) => m.id), region)
  }, [activeFilters.services, movies, region, ensureProviders])

  const activeFilterCount = countActiveFilters(activeFilters)

  if (!authReady) return null
  if (!user) return <AuthDialog />

  const signOut = () => supabase.auth.signOut()

  return (
    <div className="min-h-screen">
      <Hero
        slides={heroSlides}
        index={safeHeroIndex}
        onPrev={() => setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length)}
        onNext={() => setHeroIndex((i) => (i + 1) % heroSlides.length)}
        onAddClick={openSearch}
        onFeaturedClick={(m) => setSelected(m)}
        onProfileClick={() => setProfileOpen(true)}
        avatarUrl={avatarUrl}
        userName={userName}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-10 sm:py-12">
        <ComingSoonRow items={upcoming} onSelect={setSelected} />
        <RecommendedRow
          movies={recommended}
          onSelect={setPreviewMovie}
          onDismiss={(m) =>
            updateProfile({ hiddenRecs: [...(profile?.hiddenRecs ?? []), m.id] })
          }
        />

        {/* Top row: tabs + Add movie */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-light tracking-wide">My Library</h2>
          <div className="flex flex-wrap items-center gap-3">
            <LibraryTabs active={filter} onChange={setFilter} counts={counts} />
            <button
              type="button"
              onClick={openSearch}
              className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm text-accent-fg transition hover:opacity-90"
            >
              <Search size={16} /> Add movie
            </button>
          </div>
        </div>

        {/* Divider between the add/tabs row and the search/filter row */}
        <div className="my-4 border-t border-panel-border" />

        {/* Search row: search + Filters on the left, Lists on the right */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
            <input
              type="search"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder="Search your library by title or genre…"
              aria-label="Search your library by title or genre"
              className="w-full rounded-full border border-panel-border bg-bg-elevated/60 py-2 pl-9 pr-9 text-sm text-text outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent"
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

          <ListBar
            lists={lists}
            selectedListId={selectedListId}
            onSelect={setSelectedListId}
            onCreate={createList}
            onDelete={deleteList}
          />
        </div>

        {filtersOpen && (
          <div className="mb-8">
            <FilterBar
              availableGenres={availableGenres}
              availableDecades={availableDecades}
              availableServices={profile?.services ?? []}
              filters={activeFilters}
              onChange={setActiveFilters}
            />
          </div>
        )}

        {visible.length > 0 ? (
          <MovieGrid movies={visible} onSelect={setSelected} />
        ) : (
          <EmptyState isFiltered={movies.length > 0} onAdd={openSearch} />
        )}
      </main>

      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        initialQuery={searchInitialQuery}
      />
      <MovieDetailDialog
        movie={selectedMovie}
        onClose={() => setSelected(null)}
        onCastClick={openActorSearch}
        onOpenMovie={(m) => { setSelected(null); setPreviewMovie(m) }}
      />
      <TmdbDetailDialog
        movie={previewMovie}
        onClose={() => setPreviewMovie(null)}
        onCastClick={(name) => { setPreviewMovie(null); openActorSearch(name) }}
        onOpenMovie={(m) => setPreviewMovie(m)}
      />
      <ProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        stats={{ total: counts.all, want: counts.want, seen: counts.seen }}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignOut={signOut}
      />
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
