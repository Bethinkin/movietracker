import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

export type SortOption = 'added' | 'year-desc' | 'year-asc' | 'title' | 'rating'

export interface ActiveFilters {
  genres: string[]
  years: string[]
  minRating: number
  sort: SortOption
}

interface Props {
  availableGenres: string[]
  availableYears: string[]
  filters: ActiveFilters
  onChange: (filters: ActiveFilters) => void
}

const SORT_LABELS: Record<SortOption, string> = {
  added: 'Date Added',
  'year-desc': 'Year (Newest)',
  'year-asc': 'Year (Oldest)',
  title: 'Title A–Z',
  rating: 'TMDB Rating',
}

const RATING_OPTIONS = [0, 6, 7, 8, 9] as const

export function FilterBar({ availableGenres, availableYears, filters, onChange }: Props) {
  const [open, setOpen] = useState(false)

  const activeCount =
    filters.genres.length +
    filters.years.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.sort !== 'added' ? 1 : 0)

  const toggleGenre = (g: string) =>
    onChange({
      ...filters,
      genres: filters.genres.includes(g)
        ? filters.genres.filter((x) => x !== g)
        : [...filters.genres, g],
    })

  const toggleYear = (y: string) =>
    onChange({
      ...filters,
      years: filters.years.includes(y)
        ? filters.years.filter((x) => x !== y)
        : [...filters.years, y],
    })

  const clearAll = () =>
    onChange({ genres: [], years: [], minRating: 0, sort: 'added' })

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
          open || activeCount > 0
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-panel-border text-text-muted hover:text-text'
        }`}
      >
        <SlidersHorizontal size={15} />
        Filters
        {activeCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-accent-fg">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="glass mt-3 rounded-2xl p-5">
          <div className="flex flex-wrap gap-8">
            {/* Genre */}
            {availableGenres.length > 0 && (
              <section>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                  Genre
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {availableGenres.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        filters.genres.includes(g)
                          ? 'border-accent bg-accent/15 text-accent'
                          : 'border-panel-border text-text-muted hover:border-accent/60 hover:text-text'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Year */}
            {availableYears.length > 0 && (
              <section>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                  Year
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {availableYears.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => toggleYear(y)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        filters.years.includes(y)
                          ? 'border-accent bg-accent/15 text-accent'
                          : 'border-panel-border text-text-muted hover:border-accent/60 hover:text-text'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Min TMDB rating */}
            <section>
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                Min TMDB Rating
              </p>
              <div className="flex gap-1.5">
                {RATING_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onChange({ ...filters, minRating: r })}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      filters.minRating === r
                        ? 'border-accent bg-accent/15 text-accent'
                        : 'border-panel-border text-text-muted hover:border-accent/60 hover:text-text'
                    }`}
                  >
                    {r === 0 ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </section>

            {/* Sort */}
            <section>
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
                Sort By
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ ...filters, sort: s })}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      filters.sort === s
                        ? 'border-accent bg-accent/15 text-accent'
                        : 'border-panel-border text-text-muted hover:border-accent/60 hover:text-text'
                    }`}
                  >
                    {SORT_LABELS[s]}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 flex items-center gap-1.5 text-xs text-text-muted transition hover:text-red-400"
            >
              <X size={12} /> Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
