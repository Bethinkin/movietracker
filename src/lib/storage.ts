import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SavedMovie, Status, TmdbMovie } from './types'
import { genreNames, yearOf } from './tmdb'
import { SEED_MOVIES } from './seed'

interface MovieState {
  movies: SavedMovie[]
  addMovie: (movie: TmdbMovie, status: Status) => void
  setStatus: (id: number, status: Status) => void
  setRating: (id: number, rating: number) => void
  setNotes: (id: number, notes: string) => void
  removeMovie: (id: number) => void
  has: (id: number) => boolean
}

function fromTmdb(movie: TmdbMovie, status: Status): SavedMovie {
  const now = new Date().toISOString()
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseYear: yearOf(movie.release_date),
    overview: movie.overview,
    tmdbRating: movie.vote_average,
    genres: genreNames(movie),
    status,
    addedAt: now,
    watchedAt: status === 'seen' ? now : undefined,
  }
}

export const useMovieStore = create<MovieState>()(
  persist(
    (set, get) => ({
      // Seeded sample library; replaced by persisted data once the user edits.
      movies: SEED_MOVIES,

      addMovie: (movie, status) =>
        set((state) => {
          if (state.movies.some((m) => m.id === movie.id)) return state
          return { movies: [fromTmdb(movie, status), ...state.movies] }
        }),

      setStatus: (id, status) =>
        set((state) => ({
          movies: state.movies.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status,
                  watchedAt:
                    status === 'seen' ? m.watchedAt ?? new Date().toISOString() : undefined,
                }
              : m,
          ),
        })),

      setRating: (id, rating) =>
        set((state) => ({
          movies: state.movies.map((m) => (m.id === id ? { ...m, userRating: rating } : m)),
        })),

      setNotes: (id, notes) =>
        set((state) => ({
          movies: state.movies.map((m) => (m.id === id ? { ...m, notes } : m)),
        })),

      removeMovie: (id) =>
        set((state) => ({ movies: state.movies.filter((m) => m.id !== id) })),

      has: (id) => get().movies.some((m) => m.id === id),
    }),
    { name: 'movie-tracker' },
  ),
)
