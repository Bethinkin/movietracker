import { X } from 'lucide-react'
import { countActiveFilters, DEFAULT_FILTERS, type ActiveFilters, type SortOption } from '../lib/filters'

interface Props {
  availableGenres: string[]
  availableDecades: string[]
  availableServices: { id: number; name: string }[]
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

const chipClass = (active: boolean) =>
  `rounded-full border px-3 py-1 text-xs transition ${
    active
      ? 'border-accent bg-accent/15 text-accent'
      : 'border-panel-border text-text-muted hover:border-accent/60 hover:text-text'
  }`

export function FilterBar({
  availableGenres,
  availableDecades,
  availableServices,
  filters,
  onChange,
}: Props) {
  const activeCount = countActiveFilters(filters)

  const toggleGenre = (g: string) =>
    onChange({
      ...filters,
      genres: filters.genres.includes(g)
        ? filters.genres.filter((x) => x !== g)
        : [...filters.genres, g],
    })

  const toggleService = (id: number) =>
    onChange({
      ...filters,
      services: filters.services.includes(id)
        ? filters.services.filter((x) => x !== id)
        : [...filters.services, id],
    })

  const toggleDecade = (d: string) =>
    onChange({
      ...filters,
      decades: filters.decades.includes(d)
        ? filters.decades.filter((x) => x !== d)
        : [...filters.decades, d],
    })

  const clearAll = () => onChange(DEFAULT_FILTERS)

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap gap-8">
        {/* Genre */}
        {availableGenres.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
              Genre
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableGenres.map((g) => (
                <button key={g} type="button" onClick={() => toggleGenre(g)} className={chipClass(filters.genres.includes(g))}>
                  {g}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Decade */}
        {availableDecades.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
              Decade
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableDecades.map((d) => (
                <button key={d} type="button" onClick={() => toggleDecade(d)} className={chipClass(filters.decades.includes(d))}>
                  {d}
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
              <button key={r} type="button" onClick={() => onChange({ ...filters, minRating: r })} className={chipClass(filters.minRating === r)}>
                {r === 0 ? 'Any' : `${r}+`}
              </button>
            ))}
          </div>
        </section>

        {/* Streaming services */}
        {availableServices.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
              Streaming
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onChange({ ...filters, services: availableServices.map((s) => s.id) })
                }
                className={chipClass(
                  availableServices.length > 0 &&
                    availableServices.every((s) => filters.services.includes(s.id)),
                )}
              >
                My services
              </button>
              {availableServices.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={chipClass(filters.services.includes(s.id))}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Sort */}
        <section>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-muted">
            Sort By
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
              <button key={s} type="button" onClick={() => onChange({ ...filters, sort: s })} className={chipClass(filters.sort === s)}>
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
  )
}
