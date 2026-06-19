export type Status = 'want' | 'seen'

/** A movie saved in the user's library. */
export interface SavedMovie {
  id: number // TMDB movie id
  title: string
  posterPath: string | null
  backdropPath: string | null
  releaseYear: string
  overview: string
  tmdbRating: number // vote_average (0–10)
  genres: string[]
  status: Status
  userRating?: number // 1–5 personal stars (seen only)
  notes?: string
  addedAt: string // ISO date
  watchedAt?: string // ISO date when marked seen
}

/** Shape of a movie returned from TMDB search/details (subset we use). */
export interface TmdbMovie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  overview: string
  vote_average: number
  popularity?: number
  genres?: { id: number; name: string }[]
  genre_ids?: number[]
}
