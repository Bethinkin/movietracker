export type SortOption = 'added' | 'year-desc' | 'year-asc' | 'title' | 'rating'

export interface ActiveFilters {
  genres: string[]
  decades: string[]
  minRating: number
  sort: SortOption
  services: number[]
}

export const DEFAULT_FILTERS: ActiveFilters = {
  genres: [],
  decades: [],
  minRating: 0,
  sort: 'added',
  services: [],
}

/** Number of non-default filters currently applied (for the trigger badge). */
export function countActiveFilters(f: ActiveFilters): number {
  return (
    f.genres.length +
    f.decades.length +
    f.services.length +
    (f.minRating > 0 ? 1 : 0) +
    (f.sort !== 'added' ? 1 : 0)
  )
}

/** "1994" -> "1990s". Empty/invalid year -> "". */
export function decadeOf(year: string): string {
  if (!year) return ''
  const n = Number(year)
  if (Number.isNaN(n)) return ''
  return `${Math.floor(n / 10) * 10}s`
}
